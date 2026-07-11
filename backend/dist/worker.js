"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = exports.verificationWorker = exports.validationWorker = exports.indexingWorkers = void 0;
/**
 * worker.ts — worker process entrypoint.
 * Starts all queue consumers: indexing (5 priority queues) + validation.
 */
const indexing_consumer_1 = require("./queue/consumers/indexing.consumer");
const validation_consumer_1 = require("./queue/consumers/validation.consumer");
const verification_consumer_1 = require("./queue/consumers/verification.consumer");
exports.indexingWorkers = (0, indexing_consumer_1.startIndexingWorkers)();
exports.validationWorker = (0, validation_consumer_1.startValidationWorker)();
exports.verificationWorker = (0, verification_consumer_1.startVerificationWorker)();
// Backwards-compat export
exports.worker = exports.indexingWorkers[0];
