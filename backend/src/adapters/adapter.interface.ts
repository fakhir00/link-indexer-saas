export type AdapterType = 'api' | 'ping' | 'feed' | 'directory';

/**
 * Adapter tier controls how the registry interprets success/failure.
 *
 * - **primary**: A real indexing signal (Google Indexing API, IndexNow, configured ping
 *   endpoints). At least one primary adapter must succeed for a URL to be marked "completed".
 * - **supplementary**: Indirect helpers (sitemap ping, URL shortener bounce). Their success
 *   is logged but never counts as "indexed". They run in parallel but cannot mask primary
 *   adapter failures.
 */
export type AdapterTier = 'primary' | 'supplementary';

export interface SubmissionContext {
  campaignId?: string;
  source?: string;
  [key: string]: unknown;
}

export interface AdapterResult {
  adapter: string;
  detail: string;
  success: boolean;
  tier: AdapterTier;
  metadata?: Record<string, unknown>;
}

export interface IndexingAdapter {
  readonly name: string;
  readonly type: AdapterType;
  readonly tier: AdapterTier;
  
  isConfigured(): boolean;
  submit(url: string, context?: SubmissionContext): Promise<AdapterResult>;
  submitBatch?(urls: string[], context?: SubmissionContext): Promise<AdapterResult[]>;
}
