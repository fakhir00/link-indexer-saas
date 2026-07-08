import { Job } from 'bullmq';
import { getQueueForPriority, dlqQueue, retryQueue, QUEUE_NAMES } from '../queues';

export interface IndexingJobData {
  urlId: string;
  campaignId: string;
  link: string;
  strategy: string;         // 'indexnow' | 'ping' | 'google' | 'dry-run'
  priority: number;         // 1-10
  attemptNumber: number;    // tracks retry count across queue hops
}

export async function enqueueUrl(data: IndexingJobData): Promise<void> {
  const queue = getQueueForPriority(data.priority);
  await queue.add('index-url', data, {
    priority: data.priority,
    jobId: `url-${data.urlId}-attempt-${data.attemptNumber}`,
  });
}

export async function requeueForRetry(data: IndexingJobData, delayMs: number): Promise<void> {
  await retryQueue.add('retry-url', data, {
    delay: delayMs,
    priority: data.priority,
    jobId: `url-${data.urlId}-retry-${data.attemptNumber}`,
  });
}

export async function sendToDlq(data: IndexingJobData, reason: string): Promise<void> {
  await dlqQueue.add('dlq-url', { ...data, dlqReason: reason }, {
    priority: 10,
    jobId: `url-${data.urlId}-dlq`,
  });
}
