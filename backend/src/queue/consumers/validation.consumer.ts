import { Worker, Job } from 'bullmq';
import { connection } from '../../queue';
import { prisma } from '../../prisma';
import { validateUrl } from '../../services/url-validator.service';
import { scoreUrl } from '../../services/url-scorer.service';
import { enqueueUrl } from '../producers/indexing.producer';
import { QUEUE_NAMES } from '../queues';
import type { ValidationJobData } from '../producers/validation.producer';

const CONCURRENCY = Number(process.env.VALIDATION_CONCURRENCY ?? 10);

async function processValidationJob(job: Job): Promise<void> {
  const data = job.data as ValidationJobData;
  const { urlId, link, campaignId, userPriority, enqueueForIndexingAfter } = data;

  // Mark as validating
  await prisma.url.update({
    where: { id: urlId },
    data: { status: 'validating', validationStatus: 'pending' },
  });

  await prisma.urlTimeline.create({
    data: { urlId, event: 'validating', detail: 'Validation pipeline started' },
  });

  try {
    // ── Run validation ──────────────────────────────────────────────────────
    const validationResult = await validateUrl(link);

    // ── Score the URL ───────────────────────────────────────────────────────
    const scores = scoreUrl(validationResult, {
      submissionCount: 0,
      userPriority,
    });

    const validationStatus = validationResult.isIndexable ? 'passed' : 'warned';

    // ── Persist to UrlValidation + update Url ──────────────────────────────
    await prisma.$transaction([
      // Upsert UrlValidation record
      prisma.urlValidation.upsert({
        where: { urlId },
        update: {
          dnsResolved: validationResult.dnsResolved,
          dnsError: validationResult.dnsError,
          httpStatus: validationResult.httpStatus,
          finalUrl: validationResult.finalUrl,
          redirectChain: validationResult.redirectChain,
          redirectCount: validationResult.redirectCount,
          responseTimeMs: validationResult.responseTimeMs,
          contentType: validationResult.contentType,
          contentLength: validationResult.contentLength,
          isHttps: validationResult.isHttps,
          sslValid: validationResult.sslValid,
          robotsTxtBlocked: validationResult.robotsTxtBlocked,
          robotsRule: validationResult.robotsRule,
          metaRobotsNoindex: validationResult.metaRobotsNoindex,
          canonicalUrl: validationResult.canonicalUrl,
          canonicalMismatch: validationResult.canonicalMismatch,
          technicalScore: scores.technicalScore,
          contentScore: scores.contentScore,
          indexabilityScore: scores.indexabilityScore,
          checkedAt: new Date(),
        },
        create: {
          urlId,
          dnsResolved: validationResult.dnsResolved,
          dnsError: validationResult.dnsError,
          httpStatus: validationResult.httpStatus,
          finalUrl: validationResult.finalUrl,
          redirectChain: validationResult.redirectChain,
          redirectCount: validationResult.redirectCount,
          responseTimeMs: validationResult.responseTimeMs,
          contentType: validationResult.contentType,
          contentLength: validationResult.contentLength,
          isHttps: validationResult.isHttps,
          sslValid: validationResult.sslValid,
          robotsTxtBlocked: validationResult.robotsTxtBlocked,
          robotsRule: validationResult.robotsRule,
          metaRobotsNoindex: validationResult.metaRobotsNoindex,
          canonicalUrl: validationResult.canonicalUrl,
          canonicalMismatch: validationResult.canonicalMismatch,
          technicalScore: scores.technicalScore,
          contentScore: scores.contentScore,
          indexabilityScore: scores.indexabilityScore,
        },
      }),

      // Update Url with scores and validation status
      prisma.url.update({
        where: { id: urlId },
        data: {
          validationStatus,
          httpStatus: validationResult.httpStatus,
          isHttps: validationResult.isHttps,
          responseTimeMs: validationResult.responseTimeMs,
          robotsBlocked: validationResult.robotsTxtBlocked,
          hasNoindex: validationResult.metaRobotsNoindex,
          canonicalMismatch: validationResult.canonicalMismatch,
          redirectChain: validationResult.redirectChain,
          contentType: validationResult.contentType,
          healthScore: scores.healthScore,
          technicalScore: scores.technicalScore,
          contentScore: scores.contentScore,
          indexabilityScore: scores.indexabilityScore,
          status: 'queued', // back to queued — ready for indexing
        },
      }),

      // Timeline event
      prisma.urlTimeline.create({
        data: {
          urlId,
          event: 'validated',
          detail: `${validationStatus} — health: ${scores.healthScore}/100 (tech:${scores.technicalScore} content:${scores.contentScore} indexability:${scores.indexabilityScore})`,
          metadata: {
            warnings: validationResult.warnings,
            isIndexable: validationResult.isIndexable,
            scores: { ...scores } as unknown as Record<string, number>,
          },
        },
      }),
    ]);

    // ── Enqueue for indexing if requested ───────────────────────────────────
    if (enqueueForIndexingAfter) {
      await enqueueUrl({
        urlId,
        campaignId,
        link: validationResult.finalUrl ?? link, // use resolved final URL
        strategy: 'auto',
        priority: userPriority,
        attemptNumber: 0,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    await prisma.$transaction([
      prisma.url.update({
        where: { id: urlId },
        data: {
          validationStatus: 'failed',
          status: 'queued', // still enqueue — let indexing attempt it
          errorMessage: `Validation error: ${msg}`,
        },
      }),
      prisma.urlTimeline.create({
        data: { urlId, event: 'validated', detail: `Validation failed: ${msg}` },
      }),
    ]);

    // Even if validation failed, still enqueue for indexing
    if (enqueueForIndexingAfter) {
      await enqueueUrl({ urlId, campaignId, link, strategy: 'auto', priority: userPriority, attemptNumber: 0 });
    }
  }
}

export function startValidationWorker() {
  const worker = new Worker(QUEUE_NAMES.VALIDATION, processValidationJob, {
    connection,
    concurrency: CONCURRENCY,
  });

  worker.on('ready', () => console.log('[ValidationWorker] Ready'));
  worker.on('failed', (job, err) =>
    console.error(`[ValidationWorker] Job ${job?.id} failed:`, err.message),
  );
  worker.on('error', (err) => console.error('[ValidationWorker] Error:', err));

  return worker;
}
