import { Worker, Job } from 'bullmq';
import { connection } from '../../queue';
import { prisma } from '../../prisma';
import { checkIndexStatus } from '../../services/verification.service';
import { QUEUE_NAMES } from '../queues';

const CONCURRENCY = 2; // Low concurrency to avoid aggressive rate limiting from Google

interface VerificationJobData {
  urlId: string;
  link: string;
  attemptNumber: number;
}

async function processVerificationJob(job: Job<VerificationJobData>): Promise<void> {
  const { urlId, link, attemptNumber } = job.data;

  try {
    const isIndexed = await checkIndexStatus(link);

    await prisma.url.update({
      where: { id: urlId },
      data: {
        isIndexed,
        lastIndexCheckAt: new Date(),
      },
    });

    if (isIndexed) {
      await prisma.urlTimeline.create({
        data: {
          urlId,
          event: 'verified_indexed',
          detail: 'Confirmed indexed on Google Search',
        },
      });
    }

  } catch (error: any) {
    console.error(`[VerificationWorker] Error verifying ${link}: ${error.message}`);
    // Unconditionally throw the error so BullMQ knows the job failed and can retry it.
    // If we swallow it, the DB never gets updated and it gets stuck on "Checking..."
    throw error;
  }
}

export function startVerificationWorker() {
  const worker = new Worker(QUEUE_NAMES.VERIFICATION, processVerificationJob, {
    connection,
    concurrency: CONCURRENCY,
    // Use exponential backoff for retries to avoid hammering Google
    settings: {
      backoffStrategy: (attemptsMade: number) => {
        return Math.pow(2, attemptsMade) * 60000; // 1m, 2m, 4m, 8m...
      }
    }
  });

  worker.on('ready', () => console.log(`[Worker] Listening on ${QUEUE_NAMES.VERIFICATION}`));
  worker.on('failed', (job, err) =>
    console.error(`[Worker] Job ${job?.id} on ${QUEUE_NAMES.VERIFICATION} failed:`, err.message),
  );

  return worker;
}
