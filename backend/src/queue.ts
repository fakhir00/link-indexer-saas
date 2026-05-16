import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error('Missing REDIS_URL');

export const QUEUE_NAME = 'url-indexing-queue';

export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const indexQueue = new Queue(QUEUE_NAME, { connection });

export async function getQueueSnapshot() {
  const counts = await indexQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');
  return {
    waiting: counts.waiting ?? 0,
    active: counts.active ?? 0,
    completed: counts.completed ?? 0,
    failed: counts.failed ?? 0,
    delayed: counts.delayed ?? 0,
    paused: counts.paused ?? 0,
    total: Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0),
  };
}

console.log('Queue initialized');
