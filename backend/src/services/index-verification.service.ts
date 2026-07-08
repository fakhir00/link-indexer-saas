import { HttpError, uniqueNormalizedUrls } from '../utils';
import { validateUrl } from './url-validator.service';

export type IndexVerificationProvider = 'auto' | 'dataforseo' | 'google-cse' | 'dry-run';
export type IndexVerificationStatus = 'indexed' | 'not_indexed' | 'unknown' | 'error';

export interface IndexVerificationResult {
  url: string;
  status: IndexVerificationStatus;
  indexed: boolean | null;
  provider: Exclude<IndexVerificationProvider, 'auto'> | 'none';
  confidence: number;
  checkedAt: string;
  evidence?: Record<string, unknown>;
  recommendation?: string;
  error?: string;
}

interface DataForSeoItem {
  type?: string;
  url?: string;
  domain?: string;
  title?: string;
}

interface DataForSeoResponse {
  status_code?: number;
  status_message?: string;
  tasks?: Array<{
    status_code?: number;
    status_message?: string;
    result?: Array<{
      items?: DataForSeoItem[];
      items_count?: number;
    }>;
  }>;
}

interface GoogleCseResponse {
  searchInformation?: {
    totalResults?: string;
  };
  items?: Array<{
    link?: string;
    title?: string;
    displayLink?: string;
  }>;
  error?: {
    message?: string;
  };
}

const DEFAULT_TIMEOUT_MS = 12_000;

function timeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

function normalizeComparableUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  url.hash = '';
  url.hostname = url.hostname.toLowerCase();

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  return url.toString();
}

function urlsMatch(a: string | undefined, b: string) {
  if (!a) return false;

  try {
    return normalizeComparableUrl(a) === normalizeComparableUrl(b);
  } catch {
    return false;
  }
}

function dataForSeoConfigured() {
  return Boolean(process.env.DATAFORSEO_LOGIN?.trim() && process.env.DATAFORSEO_PASSWORD?.trim());
}

function googleCseConfigured() {
  return Boolean(process.env.GOOGLE_CSE_API_KEY?.trim() && process.env.GOOGLE_CSE_CX?.trim());
}

function providerError(url: string, provider: IndexVerificationResult['provider'], error: unknown): IndexVerificationResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    url,
    status: 'error',
    indexed: null,
    provider,
    confidence: 0,
    checkedAt: new Date().toISOString(),
    error: message,
    recommendation: 'Retry verification later or check provider credentials and quota.',
  };
}

async function dryRunDiagnostics(url: string, provider: IndexVerificationResult['provider'] = 'dry-run'): Promise<IndexVerificationResult> {
  try {
    const validation = await validateUrl(url);
    return {
      url,
      status: 'unknown',
      indexed: null,
      provider,
      confidence: 0,
      checkedAt: new Date().toISOString(),
      evidence: {
        mode: provider === 'dry-run' ? 'dry-run' : 'diagnostics-only',
        isIndexable: validation.isIndexable,
        httpStatus: validation.httpStatus,
        finalUrl: validation.finalUrl,
        robotsBlocked: validation.robotsTxtBlocked,
        noindex: validation.metaRobotsNoindex,
        canonicalMismatch: validation.canonicalMismatch,
        warnings: validation.warnings,
      },
      recommendation: provider === 'dry-run'
        ? 'Dry-run verifies the plumbing only. Configure DataForSEO or Google CSE for actual index checks.'
        : 'No index verification provider is configured. Configure DataForSEO or Google CSE to check actual index status.',
    };
  } catch (error) {
    return providerError(url, provider, error);
  }
}

async function verifyWithDataForSeo(url: string): Promise<IndexVerificationResult> {
  const login = process.env.DATAFORSEO_LOGIN?.trim();
  const password = process.env.DATAFORSEO_PASSWORD?.trim();
  if (!login || !password) {
    throw new HttpError(503, 'DataForSEO is not configured');
  }

  const timeout = timeoutSignal(DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          keyword: `site:${url}`,
          location_code: Number(process.env.DATAFORSEO_LOCATION_CODE ?? 2840),
          language_code: process.env.DATAFORSEO_LANGUAGE_CODE ?? 'en',
          device: 'desktop',
          depth: 10,
        },
      ]),
      signal: timeout.signal,
    });

    const payload = (await response.json()) as DataForSeoResponse;
    if (!response.ok || payload.status_code && payload.status_code >= 40000) {
      throw new Error(payload.status_message || `${response.status} ${response.statusText}`);
    }

    const task = payload.tasks?.[0];
    if (task?.status_code && task.status_code >= 40000) {
      throw new Error(task.status_message || 'DataForSEO task failed');
    }

    const items = task?.result?.flatMap((result) => result.items ?? []) ?? [];
    const match = items.find((item) => item.type === 'organic' && urlsMatch(item.url, url));

    return {
      url,
      status: match ? 'indexed' : 'not_indexed',
      indexed: Boolean(match),
      provider: 'dataforseo',
      confidence: match ? 0.95 : 0.85,
      checkedAt: new Date().toISOString(),
      evidence: {
        query: `site:${url}`,
        matchedUrl: match?.url,
        matchedTitle: match?.title,
        itemsChecked: items.length,
      },
      recommendation: match
        ? 'URL appears in Google SERP results for an exact site query.'
        : 'URL was not found in the checked Google SERP sample. Recheck after crawl time and review indexability diagnostics.',
    };
  } finally {
    timeout.clear();
  }
}

async function verifyWithGoogleCse(url: string): Promise<IndexVerificationResult> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY?.trim();
  const cx = process.env.GOOGLE_CSE_CX?.trim();
  if (!apiKey || !cx) {
    throw new HttpError(503, 'Google Custom Search is not configured');
  }

  const endpoint = new URL('https://www.googleapis.com/customsearch/v1');
  endpoint.searchParams.set('key', apiKey);
  endpoint.searchParams.set('cx', cx);
  endpoint.searchParams.set('q', `site:${url}`);
  endpoint.searchParams.set('num', '10');

  const timeout = timeoutSignal(DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, { signal: timeout.signal });
    const payload = (await response.json()) as GoogleCseResponse;

    if (!response.ok) {
      throw new Error(payload.error?.message || `${response.status} ${response.statusText}`);
    }

    const items = payload.items ?? [];
    const match = items.find((item) => urlsMatch(item.link, url));
    const totalResults = Number(payload.searchInformation?.totalResults ?? 0);

    return {
      url,
      status: match ? 'indexed' : 'not_indexed',
      indexed: Boolean(match),
      provider: 'google-cse',
      confidence: match ? 0.9 : 0.7,
      checkedAt: new Date().toISOString(),
      evidence: {
        query: `site:${url}`,
        matchedUrl: match?.link,
        matchedTitle: match?.title,
        totalResults,
        itemsChecked: items.length,
      },
      recommendation: match
        ? 'URL appears in Google Custom Search results for an exact site query.'
        : 'URL was not found by Google Custom Search. Confirm the CSE searches the full web and recheck later.',
    };
  } finally {
    timeout.clear();
  }
}

async function verifyOne(url: string, provider: IndexVerificationProvider): Promise<IndexVerificationResult> {
  if (provider === 'dry-run') return dryRunDiagnostics(url);

  if (provider === 'dataforseo') {
    try {
      return await verifyWithDataForSeo(url);
    } catch (error) {
      return providerError(url, 'dataforseo', error);
    }
  }

  if (provider === 'google-cse') {
    try {
      return await verifyWithGoogleCse(url);
    } catch (error) {
      return providerError(url, 'google-cse', error);
    }
  }

  if (dataForSeoConfigured()) {
    return verifyOne(url, 'dataforseo');
  }

  if (googleCseConfigured()) {
    return verifyOne(url, 'google-cse');
  }

  return dryRunDiagnostics(url, 'none');
}

export const indexVerificationService = {
  getConfiguredProviders() {
    return {
      dataforseo: dataForSeoConfigured(),
      googleCse: googleCseConfigured(),
    };
  },

  async verify(urls: string[], provider: IndexVerificationProvider = 'auto') {
    const uniqueUrls = uniqueNormalizedUrls(urls);
    const results = await Promise.all(uniqueUrls.map((url) => verifyOne(url, provider)));

    return {
      provider,
      configuredProviders: this.getConfiguredProviders(),
      results,
    };
  },
};
