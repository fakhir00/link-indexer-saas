// src/lib/api.ts
const API_URL = 'http://localhost:4000';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('indexflow_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (typeof window !== 'undefined') localStorage.setItem('indexflow_token', data.token);
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (typeof window !== 'undefined') localStorage.setItem('indexflow_token', data.token);
    return data;
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('indexflow_token');
  },

  getMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_URL}/analytics`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Campaigns
  getCampaigns: async () => {
    const res = await fetch(`${API_URL}/campaigns`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  createCampaign: async (name: string, urls: string[]) => {
    const res = await fetch(`${API_URL}/campaigns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, urls })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  updateCampaignStatus: async (id: string, status: 'paused' | 'processing') => {
    const res = await fetch(`${API_URL}/campaigns/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update campaign status');
    return res.json();
  },

  deleteCampaign: async (id: string) => {
    const res = await fetch(`${API_URL}/campaigns/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete campaign');
    return res.json();
  },

  // URLs
  getUrls: async (status: string = 'all', limit: number = 50, offset: number = 0) => {
    const res = await fetch(`${API_URL}/urls?status=${status}&limit=${limit}&offset=${offset}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch URLs');
    return res.json();
  }
};
