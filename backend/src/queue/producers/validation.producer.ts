import { validationQueue } from '../queues';
import { processValidationPayload } from '../consumers/validation.consumer';

export interface ValidationJobData {
  urlId: string;
  link: string;
  campaignId: string;
  userPriority: number;
  enqueueForIndexingAfter: boolean; // if true, automatically enqueue for indexing after validation
}

export async function enqueueForValidation(data: ValidationJobData, options?: { delayMs?: number }): Promise<void> {
  try {
    await validationQueue.add('validate-url', data, {
      jobId: `validate-${data.urlId}`,
      priority: data.userPriority,
      delay: options?.delayMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ValidationQueue] enqueue failed for ${data.urlId}; using inline fallback: ${message}`);

    const runInline = () => {
      void processValidationPayload(data).catch((inlineError) => {
        const inlineMessage = inlineError instanceof Error ? inlineError.message : String(inlineError);
        console.error(`[ValidationQueue] inline fallback failed for ${data.urlId}: ${inlineMessage}`);
      });
    };

    if (options?.delayMs && options.delayMs > 0) {
      setTimeout(runInline, options.delayMs);
      return;
    }

    setImmediate(runInline);
  }
}
