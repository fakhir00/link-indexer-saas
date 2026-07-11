/**
 * worker.ts — worker process entrypoint.
 * Starts all queue consumers: indexing (5 priority queues) + validation.
 */
import { startIndexingWorkers } from './queue/consumers/indexing.consumer';
import { startValidationWorker } from './queue/consumers/validation.consumer';
import { startVerificationWorker } from './queue/consumers/verification.consumer';

export const indexingWorkers = startIndexingWorkers();
export const validationWorker = startValidationWorker();
export const verificationWorker = startVerificationWorker();

// Backwards-compat export
export const worker = indexingWorkers[0];
