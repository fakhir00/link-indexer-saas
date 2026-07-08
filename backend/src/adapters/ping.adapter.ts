import { IndexingAdapter, AdapterType, AdapterResult, SubmissionContext } from './adapter.interface';

function get(endpoint: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(endpoint, { method: 'GET', signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}

function withUrl(endpoint: string, url: string) {
  if (endpoint.includes('{url}')) {
    return endpoint.replaceAll('{url}', encodeURIComponent(url));
  }
  const parsed = new URL(endpoint);
  if (!parsed.searchParams.has('url')) {
    parsed.searchParams.set('url', url);
  }
  return parsed.toString();
}

function csv(value?: string) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export class PingAdapter implements IndexingAdapter {
  readonly name = 'Ping';
  readonly type: AdapterType = 'ping';
  private endpoints: string[] = [];
  private timeoutMs: number;

  constructor() {
    this.endpoints = csv(process.env.PING_ENDPOINTS);
    this.timeoutMs = Number(process.env.INDEXING_REQUEST_TIMEOUT_MS ?? 8000);
  }

  isConfigured(): boolean {
    return this.endpoints.length > 0;
  }

  async submit(url: string, _context?: SubmissionContext): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      throw new Error('PingAdapter is not configured. Missing PING_ENDPOINTS.');
    }

    const failures: string[] = [];

    for (const endpoint of this.endpoints) {
      try {
        const response = await get(withUrl(endpoint, url), this.timeoutMs);
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        
        return {
          adapter: this.name,
          success: true,
          detail: `Accepted by ${new URL(endpoint).host}`,
        };
      } catch (error) {
        failures.push(error instanceof Error ? error.message : 'Unknown ping error');
      }
    }

    throw new Error(`Ping adapter failed: ${failures.join('; ')}`);
  }
}
