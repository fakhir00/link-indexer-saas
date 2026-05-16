const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('indexflow_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: getAuthHeaders(),
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

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  role: string;
  credits: number;
  plan?: string;
  urlsThisMonth?: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
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

export interface ApiKeyItem {
  id: string;
  label: string;
  keyPreview: string;
  requestCount: number;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface BillingOverview {
  currentPlan: {
    id: 'starter' | 'pro' | 'agency';
    name: string;
    price: number;
    monthlyCredits: number;
    features: string[];
  };
  credits: {
    currentBalance: number;
    usedThisMonth: number;
    monthlyAllowance: number;
    cycleStart: string;
    cycleEnd: string;
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export const api = {
  login: async (email: string, password: string) => {
    const data = await request<LoginResponse>('/auth/login', 'POST', { email, password });
    if (typeof window !== 'undefined') localStorage.setItem('indexflow_token', data.token);
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const data = await request<LoginResponse>('/auth/register', 'POST', { name, email, password });
    if (typeof window !== 'undefined') localStorage.setItem('indexflow_token', data.token);
    return data;
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('indexflow_token');
  },

  getMe: () => request<AuthUser>('/auth/me'),

  updateMe: (payload: { name?: string; email?: string }) => request<AuthUser>('/auth/me', 'PATCH', payload),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean }>('/auth/change-password', 'POST', payload),

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

  getApiKeys: () => request<ApiKeyItem[]>('/api-keys'),

  createApiKey: (label: string) =>
    request<{ id: string; label: string; key: string; keyPreview: string; createdAt: string }>('/api-keys', 'POST', {
      label,
    }),

  revokeApiKey: (id: string) => request<{ success: boolean }>(`/api-keys/${id}`, 'DELETE'),

  getBillingOverview: () => request<BillingOverview>('/billing/overview'),

  getBillingPlans: () =>
    request<
      Array<{ id: 'starter' | 'pro' | 'agency'; name: string; price: number; monthlyCredits: number; features: string[] }>
    >('/billing/plans'),

  getAdminUsers: () =>
    request<
      Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        isActive: boolean;
        credits: number;
        campaigns: number;
        totalUrls: number;
        createdAt: string;
      }>
    >('/admin/users'),

  setAdminUserActive: (id: string, isActive: boolean) =>
    request<{ id: string; isActive: boolean }>(`/admin/users/${id}/active`, 'PATCH', { isActive }),

  getAdminSystem: () =>
    request<{
      queue: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        paused: number;
        total: number;
      };
      workersActive: number;
      dbConnected: boolean;
      redisConnected: boolean;
      averageProcessingTime: number;
      apiStatus: 'healthy' | 'degraded';
    }>('/admin/system'),
};
