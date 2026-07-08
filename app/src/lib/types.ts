export type CampaignStatus = 'pending' | 'processing' | 'completed' | 'paused' | 'failed';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  totalUrls: number;
  processedUrls: number;
  successUrls: number;
  failedUrls: number;
  dripPerDay: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type UrlStatus = 'queued' | 'processing' | 'submitted' | 'crawled' | 'failed' | 'retried';

export interface UrlEntry {
  id: string;
  campaignId: string;
  url: string;
  status: UrlStatus;
  retryCount: number;
  maxRetries: number;
  strategy?: string;
  lastAttemptAt?: string;
  discoveredAt?: string;
  createdAt: string;
  errorMessage?: string;
}

export type IndexingStrategy = 'ping' | 'indexnow' | 'google' | 'dry-run';

export interface StrategyResult {
  strategy: IndexingStrategy;
  success: boolean;
  timestamp: string;
  responseCode?: number;
  message?: string;
}

export interface AnalyticsData {
  date: string;
  submitted: number;
  crawled: number;
  failed: number;
}
