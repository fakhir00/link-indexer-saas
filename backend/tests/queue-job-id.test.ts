import assert from 'node:assert/strict';
import test from 'node:test';
import { createQueueJobId } from '../src/queue/job-id';

test('createQueueJobId removes BullMQ-forbidden colons', () => {
  const jobId = createQueueJobId(['url', 'https://example.com/path', 'attempt', 0]);

  assert.equal(jobId.includes(':'), false);
  assert.match(jobId, /^url-https-example-com-path-attempt-0-[a-f0-9]{12}$/);
});

test('createQueueJobId is deterministic and keeps attempts distinct', () => {
  const firstAttempt = createQueueJobId(['url', 'abc-123', 'attempt', 0]);
  const sameAttempt = createQueueJobId(['url', 'abc-123', 'attempt', 0]);
  const nextAttempt = createQueueJobId(['url', 'abc-123', 'attempt', 1]);

  assert.equal(firstAttempt, sameAttempt);
  assert.notEqual(firstAttempt, nextAttempt);
});
