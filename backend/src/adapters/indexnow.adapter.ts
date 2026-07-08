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
    return !!this.key && !!this.host;
  }

  async submit(url: string, _context?: SubmissionContext): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      throw new Error('IndexNow is not configured. Missing INDEXNOW_KEY or INDEXNOW_HOST.');
    }

    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== this.host) {
      throw new Error(`IndexNow host mismatch: ${parsedUrl.hostname} is not ${this.host}`);
    }

    const response = await postJson(
      this.endpoint,
      {
        host: this.host,
        key: this.key,
        keyLocation: this.keyLocation,
        urlList: [url],
      },
      this.timeoutMs,
    );

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return {
      adapter: this.name,
      success: true,
      detail: `Submitted to ${new URL(this.endpoint).host}`,
    };
  }
}
