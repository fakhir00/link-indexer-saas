"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexQueue = exports.connection = exports.QUEUE_NAME = void 0;
exports.getQueueSnapshot = getQueueSnapshot;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL;
if (!redisUrl)
    throw new Error('Missing REDIS_URL');
exports.QUEUE_NAME = 'url-indexing-queue';
exports.connection = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null,
});
exports.indexQueue = new bullmq_1.Queue(exports.QUEUE_NAME, { connection: exports.connection });
async function getQueueSnapshot() {
    const counts = await exports.indexQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');
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
