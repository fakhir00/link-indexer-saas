import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("Missing REDIS_URL");

// Create standard ioredis connection for BullMQ
export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

// The main queue for URL processing
export const indexQueue = new Queue('url-indexing-queue', { connection });

console.log("🐂 BullMQ Queue initialized");
