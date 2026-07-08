const DEFAULT_PRODUCTION_API_URL = 'https://indexflow-backend-api.onrender.com';

function resolveApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin.replace(':3000', ':4000');
    }
  }

  return DEFAULT_PRODUCTION_API_URL;
}

const API_URL = resolveApiUrl();

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function parseErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.error === 'string') return data.error;
    return `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'paused' | 'failed';
  dripPerDay: number;
  createdAt: string;
  updatedAt: string;
  totalUrls: number;
  completedUrls: number;
  progress: number;
}

export interface UrlItem {
  id: string;
  campaignId: string;
  link: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  strategy?: string | null;
  errorMessage?: string | null;
  lastAttemptAt?: string | null;
  discoveredAt?: string | null;
  createdAt: string;
  campaign: {
    id: string;
    name: string;
    status: string;
  };
}

export interface AnalyticsResponse {
  totalCampaigns: number;
  totalUrls: number;
  successUrls: number;
  failedUrls: number;
  successRate: number;
  trends: Array<{ date: string; submitted: number; crawled: number; failed: number }>;
  recentCampaigns: Array<{ id: string; name: string; status: string; createdAt: string; totalUrls: number }>;
}

export type IndexVerificationProvider = 'auto' | 'dataforseo' | 'google-cse' | 'dry-run';
export type IndexVerificationStatus = 'indexed' | 'not_indexed' | 'unknown' | 'error';

export interface IndexVerificationResult {
  url: string;
  status: IndexVerificationStatus;
  indexed: boolean | null;
  provider: Exclude<IndexVerificationProvider, 'auto'> | 'none';
  confidence: number;
  checkedAt: string;
  evidence?: {
    mode?: string;
    isIndexable?: boolean;
    httpStatus?: number;
    finalUrl?: string;
    robotsBlocked?: boolean;
    noindex?: boolean;
    canonicalMismatch?: boolean;
    warnings?: string[];
    matchedUrl?: string;
    matchedTitle?: string;
    itemsChecked?: number;
    totalResults?: number;
    query?: string;
  };
  recommendation?: string;
  error?: string;
}

export interface IndexVerificationResponse {
  success: boolean;
  provider: IndexVerificationProvider;
  configuredProviders: {
    dataforseo: boolean;
    googleCse: boolean;
  };
  results: IndexVerificationResult[];
}

export interface GoogleIndexResult {
  url: string;
  success: boolean;
  status?: number;
  error?: string;
}

export const api = {
  getAnalytics: () => request<AnalyticsResponse>('/analytics'),

  getCampaigns: () => request<Campaign[]>('/campaigns'),

  createCampaign: (name: string, urls: string[], dripPerDay?: number) =>
    request<{ success: boolean; campaign: { id: string; name: string; status: string; totalUrls: number; createdAt: string } }>(
      '/campaigns',
      'POST',
      { name, urls, dripPerDay },
    ),

  updateCampaignStatus: (id: string, status: 'paused' | 'processing') =>
    request<{ success: boolean }>(`/campaigns/${id}/status`, 'PATCH', { status }),

  deleteCampaign: (id: string) => request<{ success: boolean }>(`/campaigns/${id}`, 'DELETE'),

  getUrls: (params?: {
    status?: 'all' | 'queued' | 'processing' | 'completed' | 'failed';
    limit?: number;
    offset?: number;
    search?: string;
    campaignId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    if (params?.search) query.set('search', params.search);
    if (params?.campaignId) query.set('campaignId', params.campaignId);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<{ urls: UrlItem[]; total: number; limit: number; offset: number }>(`/urls${suffix}`);
  },

  retryUrl: (id: string) => request<{ success: boolean }>(`/urls/${id}/retry`, 'POST'),

  retryAllFailedUrls: () => request<{ success: boolean; retried: number }>('/urls/retry-failed', 'POST'),

  tools: {
    googleIndex: (serviceAccountJson: string, urls: string[]) =>
      request<{ success: boolean; results: GoogleIndexResult[] }>(
        '/tools/google-index',
        'POST',
        { serviceAccountJson, urls }
      ),
    verifyIndex: (urls: string[], provider: IndexVerificationProvider = 'auto') =>
      request<IndexVerificationResponse>('/tools/verify-index', 'POST', { urls, provider }),
  },

};
