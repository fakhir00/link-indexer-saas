let BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').trim();
// Remove any trailing slashes first
BASE = BASE.replace(/\/+$/, '');
// Automatically append /api if it doesn't end with it and isn't localhost
if (!BASE.endsWith('/api') && !BASE.includes('localhost')) {
  BASE = `${BASE}/api`;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────
export interface Campaign {
  id: string;
  name: string;
  status: string;
  totalUrls: number;
  completedUrls: number;
  failedUrls: number;
  submittedUrls: number;
  dripPerDay: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
  urls?: Url[];
}

export interface Url {
  id: string;
  campaignId: string;
  link: string;
  status: string;
  healthScore: number | null;
  retryCount: number;
  errorMessage: string | null;
  strategy: string | null;
  validationStatus: string | null;
  scheduledAt: string | null;
  isIndexed: boolean;
  lastIndexCheckAt: string | null;
  createdAt: string;
  campaign?: { id: string; name: string; status: string };
}

export interface SystemHealth {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: { database: 'up' | 'down'; redis: 'up' | 'down' };
  queue: { waiting: number; active: number; completed: number; failed: number; delayed?: number; total: number };
}

export interface SystemDetails {
  activeJobs: number;
  workerConcurrency: number;
  enabledIndexingStrategies: string[];
  indexingReady: boolean;
  dryRunEnabled: boolean;
  dbConnected: boolean;
  redisConnected: boolean;
  apiStatus: string;
  queue: { waiting: number; active: number; completed: number; failed: number; delayed?: number; total: number };
}

export interface DirectoryUrl {
  id: string;
  link: string;
  discoveredAt: string | null;
  healthScore: number | null;
  isIndexed: boolean;
  lastIndexCheckAt: string | null;
}

export interface SitemapTopic {
  topic: string;
  count: number;
  urls: string[];
}

export interface SitemapSource {
  url: string;
  type: 'robots' | 'common' | 'nested' | 'fallback';
  status: 'found' | 'miss' | 'error';
  urlsFound: number;
  error?: string;
}

export interface SitemapDiscoveryResult {
  input: string;
  domain: string;
  baseUrl: string;
  sitemapUrls: string[];
  urls: string[];
  contentUrls: string[];
  indexableUrls: string[];
  topics: SitemapTopic[];
  sources: SitemapSource[];
  errors: string[];
}

export interface SitemapGap {
  topic: string;
  score: number;
  competitorCount: number;
  competitorDomains: string[];
  sampleUrls: string[];
}

export interface SitemapAnalyzeResponse {
  success: boolean;
  generatedAt: string;
  contentOnly: boolean;
  maxUrls: number;
  own: SitemapDiscoveryResult;
  competitors: SitemapDiscoveryResult[];
  gaps: SitemapGap[];
  totals: {
    ownUrls: number;
    ownContentUrls: number;
    competitorUrls: number;
    competitorContentUrls: number;
    competitorTopics: number;
    gaps: number;
  };
}

// ─── API Functions ────────────────────────────────────────

export const api = {
  // Health
  health: () => apiFetch<SystemHealth>('/health'),

  // System
  systemDetails: () => apiFetch<SystemDetails>('/system'),
  enqueueOld: () => apiFetch<{ message: string }>('/system/enqueue-old'),

  // Campaigns
  campaigns: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiFetch<{ campaigns: Campaign[]; total: number }>(`/campaigns${qs ? `?${qs}` : ''}`);
  },
  campaign: (id: string) => apiFetch<Campaign>(`/campaigns/${id}`),
  createCampaign: async (body: { name: string; urls: string[]; dripPerDay?: number; priority?: number }) => {
    const result = await apiFetch<{ success: boolean; campaign: Campaign }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return result.campaign;
  },
  pauseCampaign: (id: string) => apiFetch(`/campaigns/${id}/pause`, { method: 'POST' }),
  resumeCampaign: (id: string) => apiFetch(`/campaigns/${id}/resume`, { method: 'POST' }),

  // URLs
  urls: (params?: { campaignId?: string; status?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.campaignId) q.set('campaignId', params.campaignId);
    if (params?.status) q.set('status', params.status);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));
    const qs = q.toString();
    return apiFetch<{ urls: Url[]; total: number }>(`/urls${qs ? `?${qs}` : ''}`);
  },
  retryUrl: (id: string) => apiFetch(`/urls/${id}/retry`, { method: 'POST' }),
  retryAllFailed: () => apiFetch('/urls/retry-failed', { method: 'POST' }),
  retryAllStuck: () => apiFetch<{ success: boolean; retried: number }>('/urls/retry-stuck', { method: 'POST' }),

  // Sitemap intelligence
  sitemapAnalyze: (body: { ownDomain: string; competitorDomains: string[]; maxUrls?: number; contentOnly?: boolean }) =>
    apiFetch<SitemapAnalyzeResponse>('/tools/sitemap/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Public directory
  directory: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiFetch<{ urls: DirectoryUrl[]; total: number; totalPages: number; page: number }>(`/directory${qs ? `?${qs}` : ''}`);
  },
  directoryRecent: () => apiFetch<DirectoryUrl[]>('/directory/recent'),
};
