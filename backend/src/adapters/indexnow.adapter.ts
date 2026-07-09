import { IndexingAdapter, AdapterType, AdapterResult, SubmissionContext } from './adapter.interface';

async function postJson(endpoint: string, body: unknown, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeout);
  });
}

export class IndexNowAdapter implements IndexingAdapter {
  readonly name = 'IndexNow';
  readonly type: AdapterType = 'api';
  
  private endpoint: string;
  private key: string | undefined;
  private host: string | undefined;
  private keyLocation: string | undefined;
  private timeoutMs: number;

  constructor() {
    this.endpoint = process.env.INDEXNOW_ENDPOINT?.trim() || 'https://api.indexnow.org/indexnow';
    this.key = process.env.INDEXNOW_KEY?.trim();
    this.host = process.env.INDEXNOW_HOST?.trim();
    this.keyLocation = process.env.INDEXNOW_KEY_LOCATION?.trim();
    this.timeoutMs = Number(process.env.INDEXING_REQUEST_TIMEOUT_MS ?? 8000);
  }

  isConfigured(): boolean {
    // Only need a key to be configured — host is derived per-URL
    return !!this.key;
  }

  async submit(url: string, _context?: SubmissionContext): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      throw new Error('IndexNow is not configured. Missing INDEXNOW_KEY.');
    }

    const parsedUrl = new URL(url);
    const urlHost = parsedUrl.hostname;

    const response = await postJson(
      this.endpoint,
      {
        host: urlHost,
        key: this.key,
        keyLocation: this.keyLocation,
        urlList: [url],
      },
      this.timeoutMs,
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`IndexNow ${response.status}: ${body || response.statusText}`);
    }

    return {
      adapter: this.name,
      success: true,
      detail: `Submitted ${urlHost} to ${new URL(this.endpoint).host}`,
    };
  }
}
