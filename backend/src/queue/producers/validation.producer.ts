import { validationQueue } from '../queues';

export interface ValidationJobData {
  urlId: string;
  link: string;
  campaignId: string;
  userPriority: number;
  enqueueForIndexingAfter: boolean; // if true, automatically enqueue for indexing after validation
}

export async function enqueueForValidation(data: ValidationJobData): Promise<void> {
  await validationQueue.add('validate-url', data, {
    jobId: `validate:${data.urlId}`,
    priority: data.userPriority,
  });
}
