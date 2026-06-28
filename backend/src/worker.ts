import { Worker, Job } from 'bullmq';
import { connection, QUEUE_NAME } from './queue';
import { prisma } from './prisma';
import { submitUrlToIndexingProviders } from './indexing-strategies';

async function refreshCampaignStatus(campaignId: string) {
  const [total, completed, failed, processing, queued] = await Promise.all([
    prisma.url.count({ where: { campaignId } }),
    prisma.url.count({ where: { campaignId, status: 'completed' } }),
    prisma.url.count({ where: { campaignId, status: 'failed' } }),
    prisma.url.count({ where: { campaignId, status: 'processing' } }),
    prisma.url.count({ where: { campaignId, status: 'queued' } }),
  ]);

  if (total > 0 && completed + failed === total) {
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'completed' } });
    return;
  }

  if (processing > 0 || queued > 0) {
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'processing' } });
  }
}

const worker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { urlId, url } = job.data as { urlId: string; url: string };
    const urlRecord = await prisma.url.findUnique({
      where: { id: urlId },
      include: { campaign: { select: { id: true, status: true } } },
    });

    if (!urlRecord?.campaign) {
      return;
    }

    if (urlRecord.campaign.status === 'paused') {
      await prisma.url.update({
        where: { id: urlId },
        data: {
          status: 'queued',
          errorMessage: 'Campaign is paused',
        },
      });
      return;
    }

    await prisma.url.update({
      where: { id: urlId },
      data: {
        status: 'processing',
        lastAttemptAt: new Date(),
      },
    });

    try {
      const results = await submitUrlToIndexingProviders(url);

      await prisma.url.update({
        where: { id: urlId },
        data: {
          status: 'completed',
          discoveredAt: new Date(),
          strategy: results.map((result) => result.strategy).join(', '),
          errorMessage: null,
        },
      });

      await refreshCampaignStatus(urlRecord.campaign.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';
      const current = await prisma.url.findUnique({ where: { id: urlId } });
      if (!current) return;

      const newRetryCount = current.retryCount + 1;
      const permanentlyFailed = newRetryCount >= current.maxRetries;

      await prisma.url.update({
        where: { id: urlId },
        data: {
          status: permanentlyFailed ? 'failed' : 'queued',
          retryCount: newRetryCount,
          errorMessage: message,
        },
      });

      await refreshCampaignStatus(urlRecord.campaign.id);

      if (!permanentlyFailed) {
        throw new Error(message);
      }
    }
  },
  { connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5) },
);

worker.on('ready', () => console.log('Worker is ready and listening to queue...'));
worker.on('error', (error) => console.error('Worker error:', error));

export { worker };
