// Utility helpers for IndexFlow

import type { CampaignStatus, UrlStatus } from './types';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatCredits(n: number): string {
  return n.toLocaleString();
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function campaignProgress(campaign: { processedUrls: number; totalUrls: number }): number {
  if (campaign.totalUrls === 0) return 0;
  return Math.round((campaign.processedUrls / campaign.totalUrls) * 100);
}

export function successRate(campaign: { successUrls: number; processedUrls: number }): number {
  if (campaign.processedUrls === 0) return 0;
  return Math.round((campaign.successUrls / campaign.processedUrls) * 100);
}

export function getCampaignStatusClass(status: CampaignStatus): string {
  const map: Record<CampaignStatus, string> = {
    pending: 'badge-queued',
    processing: 'badge-processing',
    completed: 'badge-completed',
    paused: 'badge-paused',
    failed: 'badge-failed',
  };
  return map[status] ?? 'badge-queued';
}

export function getUrlStatusClass(status: UrlStatus): string {
  const map: Record<UrlStatus, string> = {
    queued: 'badge-queued',
    processing: 'badge-processing',
    submitted: 'badge-submitted',
    crawled: 'badge-completed',
    failed: 'badge-failed',
    retried: 'badge-paused',
  };
  return map[status] ?? 'badge-queued';
}

export function maskApiKey(key: string): string {
  if (key.length < 16) return key;
  return key.substring(0, 12) + '••••••••••••' + key.substring(key.length - 4);
}

export function truncateUrl(url: string, maxLength = 60): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '…';
}

export function generateMockApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `if_live_sk_${segment(32)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
