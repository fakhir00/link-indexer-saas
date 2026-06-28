"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
const bullmq_1 = require("bullmq");
const queue_1 = require("./queue");
const prisma_1 = require("./prisma");
const indexing_strategies_1 = require("./indexing-strategies");
async function refreshCampaignStatus(campaignId) {
    const [total, completed, failed, processing, queued] = await Promise.all([
        prisma_1.prisma.url.count({ where: { campaignId } }),
        prisma_1.prisma.url.count({ where: { campaignId, status: 'completed' } }),
        prisma_1.prisma.url.count({ where: { campaignId, status: 'failed' } }),
        prisma_1.prisma.url.count({ where: { campaignId, status: 'processing' } }),
        prisma_1.prisma.url.count({ where: { campaignId, status: 'queued' } }),
    ]);
    if (total > 0 && completed + failed === total) {
        await prisma_1.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'completed' } });
        return;
    }
    if (processing > 0 || queued > 0) {
        await prisma_1.prisma.campaign.update({ where: { id: campaignId }, data: { status: 'processing' } });
    }
}
const worker = new bullmq_1.Worker(queue_1.QUEUE_NAME, async (job) => {
    const { urlId, url } = job.data;
    const urlRecord = await prisma_1.prisma.url.findUnique({
        where: { id: urlId },
        include: { campaign: { select: { id: true, status: true } } },
    });
    if (!urlRecord?.campaign) {
        return;
    }
    if (urlRecord.campaign.status === 'paused') {
        await prisma_1.prisma.url.update({
            where: { id: urlId },
            data: {
                status: 'queued',
                errorMessage: 'Campaign is paused',
            },
        });
        return;
    }
    await prisma_1.prisma.url.update({
        where: { id: urlId },
        data: {
            status: 'processing',
            lastAttemptAt: new Date(),
        },
    });
    try {
        const results = await (0, indexing_strategies_1.submitUrlToIndexingProviders)(url);
        await prisma_1.prisma.url.update({
            where: { id: urlId },
            data: {
                status: 'completed',
                discoveredAt: new Date(),
                strategy: results.map((result) => result.strategy).join(', '),
                errorMessage: null,
            },
        });
        await refreshCampaignStatus(urlRecord.campaign.id);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown processing error';
        const current = await prisma_1.prisma.url.findUnique({ where: { id: urlId } });
        if (!current)
            return;
        const newRetryCount = current.retryCount + 1;
        const permanentlyFailed = newRetryCount >= current.maxRetries;
        await prisma_1.prisma.url.update({
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
}, { connection: queue_1.connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5) });
exports.worker = worker;
worker.on('ready', () => console.log('Worker is ready and listening to queue...'));
worker.on('error', (error) => console.error('Worker error:', error));
