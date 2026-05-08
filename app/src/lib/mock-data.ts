// ==========================================
// Mock Data for IndexFlow SaaS Demo
// ==========================================

import type {
  User, Campaign, UrlEntry, AnalyticsData,
  DashboardStats, ApiKey, Payment, Plan, SystemHealth
} from './types';

export const MOCK_USER: User = {
  id: 'usr_01',
  email: 'alex@indexflow.io',
  name: 'Alex Morgan',
  role: 'admin',
  createdAt: '2024-01-15T08:00:00Z',
  creditsBalance: 4820,
  isActive: true,
};

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    credits: 500,
    features: [
      '500 URL credits/mo',
      '3 active campaigns',
      'Ping + Sitemap strategies',
      'CSV upload',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    credits: 2000,
    isPopular: true,
    features: [
      '2,000 URL credits/mo',
      'Unlimited campaigns',
      'All 4 indexing strategies',
      'CSV upload + API access',
      'Advanced analytics',
      'Webhooks',
      'Priority support',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 199,
    credits: 10000,
    features: [
      '10,000 URL credits/mo',
      'Unlimited campaigns',
      'All 4 indexing strategies',
      'API + Chrome extension',
      'White-label reports',
      'Team seats (5 users)',
      'Reseller API',
      'Dedicated support',
    ],
  },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_001',
    name: 'Blog Posts — May 2024',
    userId: 'usr_01',
    status: 'processing',
    totalUrls: 150,
    processedUrls: 87,
    successUrls: 72,
    failedUrls: 15,
    drip_per_day: 30,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-08T14:30:00Z',
  },
  {
    id: 'cmp_002',
    name: 'Product Pages — Q2',
    userId: 'usr_01',
    status: 'completed',
    totalUrls: 280,
    processedUrls: 280,
    successUrls: 261,
    failedUrls: 19,
    drip_per_day: 50,
    createdAt: '2024-04-15T08:00:00Z',
    updatedAt: '2024-05-06T09:00:00Z',
    completedAt: '2024-05-06T09:00:00Z',
  },
  {
    id: 'cmp_003',
    name: 'New Landing Pages',
    userId: 'usr_01',
    status: 'pending',
    totalUrls: 45,
    processedUrls: 0,
    successUrls: 0,
    failedUrls: 0,
    drip_per_day: 15,
    createdAt: '2024-05-08T12:00:00Z',
    updatedAt: '2024-05-08T12:00:00Z',
  },
  {
    id: 'cmp_004',
    name: 'E-commerce SKUs — Batch 3',
    userId: 'usr_01',
    status: 'paused',
    totalUrls: 500,
    processedUrls: 220,
    successUrls: 198,
    failedUrls: 22,
    drip_per_day: 100,
    createdAt: '2024-04-20T08:00:00Z',
    updatedAt: '2024-05-03T16:00:00Z',
  },
  {
    id: 'cmp_005',
    name: 'Client A — News Articles',
    userId: 'usr_01',
    status: 'processing',
    totalUrls: 90,
    processedUrls: 34,
    successUrls: 31,
    failedUrls: 3,
    drip_per_day: 20,
    createdAt: '2024-05-07T09:00:00Z',
    updatedAt: '2024-05-08T11:00:00Z',
  },
];

export const MOCK_URLS: UrlEntry[] = [
  {
    id: 'url_001',
    campaignId: 'cmp_001',
    url: 'https://example.com/blog/seo-guide-2024',
    status: 'crawled',
    retryCount: 0,
    maxRetries: 3,
    strategy: 'ping',
    lastAttemptAt: '2024-05-08T10:15:00Z',
    discoveredAt: '2024-05-08T10:20:00Z',
    createdAt: '2024-05-08T09:00:00Z',
  },
  {
    id: 'url_002',
    campaignId: 'cmp_001',
    url: 'https://example.com/blog/link-building-strategies',
    status: 'submitted',
    retryCount: 0,
    maxRetries: 3,
    strategy: 'sitemap',
    lastAttemptAt: '2024-05-08T10:30:00Z',
    createdAt: '2024-05-08T09:00:00Z',
  },
  {
    id: 'url_003',
    campaignId: 'cmp_001',
    url: 'https://example.com/blog/technical-seo-checklist',
    status: 'processing',
    retryCount: 0,
    maxRetries: 3,
    strategy: 'api_submission',
    lastAttemptAt: '2024-05-08T14:00:00Z',
    createdAt: '2024-05-08T09:00:00Z',
  },
  {
    id: 'url_004',
    campaignId: 'cmp_001',
    url: 'https://example.com/blog/core-web-vitals-tips',
    status: 'failed',
    retryCount: 3,
    maxRetries: 3,
    strategy: 'ping',
    lastAttemptAt: '2024-05-08T11:00:00Z',
    errorMessage: 'Max retries exceeded — connection timeout',
    createdAt: '2024-05-08T09:00:00Z',
  },
  {
    id: 'url_005',
    campaignId: 'cmp_001',
    url: 'https://example.com/blog/google-search-console',
    status: 'queued',
    retryCount: 0,
    maxRetries: 3,
    createdAt: '2024-05-08T09:00:00Z',
  },
  {
    id: 'url_006',
    campaignId: 'cmp_001',
    url: 'https://example.com/blog/backlink-audit',
    status: 'submitted',
    retryCount: 1,
    maxRetries: 3,
    strategy: 'buffer_network',
    lastAttemptAt: '2024-05-08T13:00:00Z',
    createdAt: '2024-05-08T09:00:00Z',
  },
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { date: 'Apr 28', submitted: 120, crawled: 98, failed: 22 },
  { date: 'Apr 29', submitted: 145, crawled: 130, failed: 15 },
  { date: 'Apr 30', submitted: 89, crawled: 76, failed: 13 },
  { date: 'May 1', submitted: 200, crawled: 182, failed: 18 },
  { date: 'May 2', submitted: 175, crawled: 158, failed: 17 },
  { date: 'May 3', submitted: 220, crawled: 199, failed: 21 },
  { date: 'May 4', submitted: 160, crawled: 147, failed: 13 },
  { date: 'May 5', submitted: 180, crawled: 163, failed: 17 },
  { date: 'May 6', submitted: 240, crawled: 221, failed: 19 },
  { date: 'May 7', submitted: 195, crawled: 178, failed: 17 },
  { date: 'May 8', submitted: 87, crawled: 72, failed: 15 },
];

export const MOCK_STATS: DashboardStats = {
  totalUrls: 1280,
  totalCampaigns: 12,
  successRate: 87.3,
  failureRate: 12.7,
  processingSpeed: 42,
  creditsBalance: 4820,
  urlsThisMonth: 487,
  activeNow: 34,
};

export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'key_001',
    userId: 'usr_01',
    key: 'if_live_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4',
    label: 'Production API',
    lastUsedAt: '2024-05-08T14:00:00Z',
    requestCount: 1482,
    isActive: true,
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'key_002',
    userId: 'usr_01',
    key: 'if_test_sk_z9y8x7w6v5u4t3s2r1q0p9o8n7m6',
    label: 'Testing',
    lastUsedAt: '2024-05-01T10:00:00Z',
    requestCount: 238,
    isActive: true,
    createdAt: '2024-02-05T08:00:00Z',
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay_001',
    userId: 'usr_01',
    amount: 7900,
    credits: 2000,
    plan: 'pro',
    status: 'succeeded',
    stripeSessionId: 'cs_live_abc123',
    createdAt: '2024-05-01T08:00:00Z',
  },
  {
    id: 'pay_002',
    userId: 'usr_01',
    amount: 7900,
    credits: 2000,
    plan: 'pro',
    status: 'succeeded',
    stripeSessionId: 'cs_live_def456',
    createdAt: '2024-04-01T08:00:00Z',
  },
];

export const MOCK_SYSTEM_HEALTH: SystemHealth = {
  queueSize: 487,
  workersActive: 8,
  dbConnected: true,
  redisConnected: true,
  apiStatus: 'healthy',
  averageProcessingTime: 2.4,
};

// Indexing Strategies metadata
export const STRATEGY_INFO = {
  ping: {
    label: 'Ping Submission',
    description: 'Submits URLs to RSS/ping endpoints to trigger crawl discovery',
    icon: '📡',
    color: '#06b6d4',
  },
  sitemap: {
    label: 'Sitemap Feeder',
    description: 'Generates dynamic sitemap feeds to help search bots discover URLs',
    icon: '🗺️',
    color: '#10b981',
  },
  api_submission: {
    label: 'Search Console API',
    description: 'Simulates Google Search Console indexing API submission layer',
    icon: '🔌',
    color: '#6366f1',
  },
  buffer_network: {
    label: 'Buffer Network',
    description: 'Internal linking simulation pages for improved crawl discovery',
    icon: '🔗',
    color: '#f59e0b',
  },
};
