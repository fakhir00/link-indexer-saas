// ==========================================
// Core Types for IndexFlow SaaS
// ==========================================

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  creditsBalance: number;
  isActive: boolean;
}

export type CampaignStatus = 'pending' | 'processing' | 'completed' | 'paused' | 'failed';

export interface Campaign {
  id: string;
  name: string;
  userId: string;
  status: CampaignStatus;
  totalUrls: number;
  processedUrls: number;
  successUrls: number;
  failedUrls: number;
  drip_per_day: number;
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

export type IndexingStrategy = 'ping' | 'sitemap' | 'api_submission' | 'buffer_network';

export interface StrategyResult {
  strategy: IndexingStrategy;
  success: boolean;
  timestamp: string;
  responseCode?: number;
  message?: string;
}

export interface UrlStatusLog {
  id: string;
  urlId: string;
  status: UrlStatus;
  strategy?: IndexingStrategy;
  message?: string;
  createdAt: string;
}

export type PlanType = 'starter' | 'pro' | 'agency';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  credits: number;
  features: string[];
  isPopular?: boolean;
}

export interface CreditsWallet {
  id: string;
  userId: string;
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  key: string;
  label: string;
  lastUsedAt?: string;
  requestCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalUrls: number;
  totalCampaigns: number;
  successRate: number;
  failureRate: number;
  processingSpeed: number;
  creditsBalance: number;
  urlsThisMonth: number;
  activeNow: number;
}

export interface AnalyticsData {
  date: string;
  submitted: number;
  crawled: number;
  failed: number;
}

export interface SystemHealth {
  queueSize: number;
  activeJobs: number;
  workerConcurrency: number;
  enabledIndexingStrategies: string[];
  dbConnected: boolean;
  redisConnected: boolean;
  apiStatus: 'healthy' | 'degraded' | 'down';
  averageProcessingTime: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
