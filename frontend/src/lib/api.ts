// Central API client — reads the base URL from the environment
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

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
  createdAt: string;
  campaign?: { id: string; name: string; status: string };
}

export interface SystemHealth {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: { database: 'up' | 'down'; redis: 'up' | 'down' };
  queue: { waiting: number; active: number; completed: number; failed: number; total: number };
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
  queue: { waiting: number; active: number; completed: number; failed: number; total: number };
}

export interface DirectoryUrl {
  id: string;
  link: string;
  discoveredAt: string | null;
  healthScore: number | null;
}

// ─── API Functions ────────────────────────────────────────

export const api = {
  // Health
  health: () => apiFetch<SystemHealth>('/health'),

  // System
  systemDetails: () => apiFetch<SystemDetails>('/system/details'),

  // Campaigns
  campaigns: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiFetch<{ campaigns: Campaign[]; total: number }>(`/campaigns${qs ? `?${qs}` : ''}`);
  },
  campaign: (id: string) => apiFetch<Campaign>(`/campaigns/${id}`),
  createCampaign: (body: { name: string; urls: string[]; dripPerDay?: number; priority?: number }) =>
    apiFetch<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(body) }),
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
