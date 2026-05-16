"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
const bullmq_1 = require("bullmq");
const queue_1 = require("./queue");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function indexUrlStrategy(_url) {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));
    const isSuccess = Math.random() > 0.1;
    if (!isSuccess) {
        throw new Error('Network timeout reaching ping endpoints');
    }
    return { strategy: 'Ping Strategy' };
}
async function refreshCampaignStatus(campaignId) {
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
const worker = new bullmq_1.Worker(queue_1.QUEUE_NAME, async (job) => {
    const { urlId, url } = job.data;
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
        const result = await indexUrlStrategy(url);
        await prisma.url.update({
            where: { id: urlId },
            data: {
                status: 'completed',
                discoveredAt: new Date(),
                strategy: result.strategy,
                errorMessage: null,
            },
        });
        await refreshCampaignStatus(urlRecord.campaign.id);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown processing error';
        const current = await prisma.url.findUnique({ where: { id: urlId } });
        if (!current)
            return;
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
}, { connection: queue_1.connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5) });
exports.worker = worker;
worker.on('ready', () => console.log('Worker is ready and listening to queue...'));
worker.on('error', (error) => console.error('Worker error:', error));
