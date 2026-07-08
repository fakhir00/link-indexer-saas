import { Queue, QueueEvents } from 'bullmq';
import { connection } from '../queue';

// Priority queues — lower BullMQ priority number = processed first
// We map 1=critical → BullMQ priority 1, 2=high → 2, etc.
export const QUEUE_NAMES = {
  CRITICAL: 'indexing-critical',
  HIGH:     'indexing-high',
  MEDIUM:   'indexing-medium',
  LOW:      'indexing-low',
  RETRY:    'indexing-retry',
  DLQ:      'indexing-dlq',
  VALIDATION: 'url-validation',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

function makeQueue(name: string) {
  return new Queue(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: { count: 500, age: 3600 },
      removeOnFail: { count: 500, age: 86400 },
    },
  });
}

export const criticalQueue   = makeQueue(QUEUE_NAMES.CRITICAL);
export const highQueue       = makeQueue(QUEUE_NAMES.HIGH);
export const mediumQueue     = makeQueue(QUEUE_NAMES.MEDIUM);
export const lowQueue        = makeQueue(QUEUE_NAMES.LOW);
export const retryQueue      = makeQueue(QUEUE_NAMES.RETRY);
export const dlqQueue        = makeQueue(QUEUE_NAMES.DLQ);
export const validationQueue = makeQueue(QUEUE_NAMES.VALIDATION);

// Map campaign priority (1-10) to the right queue
export function getQueueForPriority(priority: number) {
  if (priority <= 2) return criticalQueue;
  if (priority <= 4) return highQueue;
  if (priority <= 7) return mediumQueue;
  return lowQueue;
}

// Snapshot all queue counts
export async function getAllQueueSnapshots() {
  const queues = [criticalQueue, highQueue, mediumQueue, lowQueue, retryQueue, dlqQueue, validationQueue];
  const results = await Promise.all(
    queues.map(async (q) => {
      const [waiting, active, failed, delayed, completed] = await Promise.all([
        q.getWaitingCount(),
        q.getActiveCount(),
        q.getFailedCount(),
        q.getDelayedCount(),
        q.getCompletedCount(),
      ]);
      return { name: q.name, waiting, active, failed, delayed, completed, total: waiting + active + delayed };
    }),
  );
  return results;
}

export const allQueues = [criticalQueue, highQueue, mediumQueue, lowQueue, retryQueue, dlqQueue, validationQueue];
