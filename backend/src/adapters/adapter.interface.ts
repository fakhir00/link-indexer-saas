export type AdapterType = 'api' | 'ping' | 'feed' | 'directory';

export interface SubmissionContext {
  campaignId?: string;
  source?: string;
  [key: string]: unknown;
}

export interface AdapterResult {
  adapter: string;
  detail: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export interface IndexingAdapter {
  readonly name: string;
  readonly type: AdapterType;
  
  isConfigured(): boolean;
  submit(url: string, context?: SubmissionContext): Promise<AdapterResult>;
  submitBatch?(urls: string[], context?: SubmissionContext): Promise<AdapterResult[]>;
}
