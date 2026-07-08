import { Worker, Job } from 'bullmq';
import { connection } from '../../queue';
import { prisma } from '../../prisma';
import { submitUrlToIndexingProviders } from '../../indexing-strategies';
import { makeRetryDecision, classifyError } from '../retry-engine';
import { requeueForRetry, sendToDlq, IndexingJobData } from '../producers/indexing.producer';
import {
  QUEUE_NAMES,
  criticalQueue,
  highQueue,
  mediumQueue,
  lowQueue,
  retryQueue,
} from '../queues';

const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 5);

// ─── Campaign roll-up (existing logic preserved) ────────────────────────────

async function refreshCampaignStatus(campaignId: string) {
  const [total, completed, failed, processing, queued] = await Promise.all([
    prisma.url.count({ where: { campaignId } }),
    prisma.url.count({ where: { campaignId, status: 'completed' } }),
    prisma.url.count({ where: { campaignId, status: 'failed' } }),
    prisma.url.count({ where: { campaignId, status: 'processing' } }),
    prisma.url.count({ where: { campaignId, status: 'queued' } }),
  ]);

  const campaignStatus =
    total > 0 && completed + failed === total
      ? 'completed'
      : processing > 0 || queued > 0
      ? 'processing'
      : undefined;

  if (campaignStatus) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: campaignStatus,
        submittedUrls: completed + failed,
        completedUrls: completed,
        failedUrls: failed,
      },
    });
  }
}

// ─── Core job processor ──────────────────────────────────────────────────────

async function processIndexingJob(job: Job): Promise<void> {
  // Support both new job format (IndexingJobData) and legacy format
  const jobData = job.data as IndexingJobData & { url?: string };
  const urlId = jobData.urlId;
  const link = jobData.link ?? jobData.url;
  const attemptNumber = jobData.attemptNumber ?? 0;

  const urlRecord = await prisma.url.findUnique({
    where: { id: urlId },
    include: { campaign: { select: { id: true, status: true } } },
  });

  if (!urlRecord?.campaign) return;

  // Paused campaign — put back to queued, do not process
  if (urlRecord.campaign.status === 'paused') {
    await prisma.url.update({
      where: { id: urlId },
      data: { status: 'queued', errorMessage: 'Campaign is paused' },
    });
    return;
  }

  const startedAt = Date.now();

  // Mark as processing
  await prisma.url.update({
    where: { id: urlId },
    data: { status: 'processing', lastAttemptAt: new Date() },
  });

  // Log timeline event
  await prisma.urlTimeline.create({
    data: { urlId, event: 'processing', detail: `Attempt #${attemptNumber + 1}` },
  });

  try {
    const results = await submitUrlToIndexingProviders(link);
    const durationMs = Date.now() - startedAt;
    const strategiesUsed = results.map((r) => r.strategy).join(', ');

    // Log each submission
    await prisma.$transaction(
      results.map((r) =>
        prisma.submissionLog.create({
          data: {
            urlId,
            adapter: r.strategy,
            status: 'success',
            durationMs,
            attemptNo: attemptNumber + 1,
          },
        }),
      ),
    );

    // Mark URL completed
    await prisma.url.update({
      where: { id: urlId },
      data: {
        status: 'completed',
        discoveredAt: new Date(),
        strategy: strategiesUsed,
        errorMessage: null,
        retryCount: attemptNumber,
        errorClass: null,
      },
    });

    await prisma.urlTimeline.create({
      data: { urlId, event: 'completed', detail: `via ${strategiesUsed}` },
    });

    await refreshCampaignStatus(urlRecord.campaign.id);
  } catch (error: unknown) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : String(error);
    const decision = makeRetryDecision(error, attemptNumber);

    // Log the failed submission attempt
    await prisma.submissionLog.create({
      data: {
        urlId,
        adapter: jobData.strategy ?? 'unknown',
        status: 'failed',
        errorMessage: message,
        durationMs,
        attemptNo: attemptNumber + 1,
      },
    });

    if (decision.shouldRetry) {
      // Requeue with delay
      await prisma.url.update({
        where: { id: urlId },
        data: {
          status: 'queued',
          retryCount: attemptNumber + 1,
          errorMessage: message,
          errorClass: decision.errorClass,
          nextRetryAt: new Date(Date.now() + decision.delayMs),
        },
      });

      await prisma.urlTimeline.create({
        data: {
          urlId,
          event: 'retried',
          detail: `${decision.errorClass} — retry in ${Math.round(decision.delayMs / 60_000)}m`,
        },
      });

      const nextAttempt: IndexingJobData = {
        urlId,
        campaignId: urlRecord.campaign.id,
        link,
        strategy: jobData.strategy ?? 'auto',
        priority: jobData.priority ?? 5,
        attemptNumber: attemptNumber + 1,
      };

      await requeueForRetry(nextAttempt, decision.delayMs);
    } else {
      // Permanent failure — send to DLQ
      await prisma.url.update({
        where: { id: urlId },
        data: {
          status: 'failed',
          retryCount: attemptNumber + 1,
          errorMessage: message,
          errorClass: decision.errorClass,
          nextRetryAt: null,
        },
      });

      await prisma.urlTimeline.create({
        data: {
          urlId,
          event: 'failed',
          detail: `${decision.errorClass} — permanent failure`,
        },
      });

      await sendToDlq(
        {
          urlId,
          campaignId: urlRecord.campaign.id,
          link,
          strategy: jobData.strategy ?? 'auto',
          priority: jobData.priority ?? 5,
          attemptNumber: attemptNumber + 1,
        },
        `${decision.errorClass}: ${message}`,
      );
    }

    await refreshCampaignStatus(urlRecord.campaign.id);
  }
}

// ─── Worker factory ──────────────────────────────────────────────────────────

function createWorker(queueName: string) {
  const w = new Worker(queueName, processIndexingJob, {
    connection,
    concurrency: CONCURRENCY,
  });

  w.on('ready', () => console.log(`[Worker] Listening on ${queueName}`));
  w.on('failed', (job, err) =>
    console.error(`[Worker] Job ${job?.id} on ${queueName} failed:`, err.message),
  );
  w.on('error', (err) => console.error(`[Worker] ${queueName} error:`, err));

  return w;
}

// ─── Start all priority workers ──────────────────────────────────────────────

export function startIndexingWorkers() {
  const workers = [
    createWorker(QUEUE_NAMES.CRITICAL),
    createWorker(QUEUE_NAMES.HIGH),
    createWorker(QUEUE_NAMES.MEDIUM),
    createWorker(QUEUE_NAMES.LOW),
    createWorker(QUEUE_NAMES.RETRY),
  ];

  console.log(`[Worker] Started ${workers.length} indexing workers`);
  return workers;
}

// ─── Legacy compatibility export ─────────────────────────────────────────────
// Keeps worker.ts import path working during transition

export const worker = {
  start: startIndexingWorkers,
};
