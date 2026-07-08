/**
 * worker.ts — entrypoint for the BullMQ worker process.
 * Delegates to the new priority-queue consumer.
 * Kept for backwards compatibility with render.yaml startCommand.
 */
import { startIndexingWorkers } from './queue/consumers/indexing.consumer';

export const workers = startIndexingWorkers();

export { workers as worker };
