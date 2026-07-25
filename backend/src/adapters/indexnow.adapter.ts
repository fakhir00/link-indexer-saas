import { IndexingAdapter, AdapterType, AdapterTier, AdapterResult, SubmissionContext } from './adapter.interface';

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
  readonly tier: AdapterTier = 'primary';
  
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

    if (this.key && !this.host && !this.keyLocation) {
      console.warn(
        '[IndexNowAdapter] WARNING: INDEXNOW_KEY is set but INDEXNOW_HOST and INDEXNOW_KEY_LOCATION are empty. ' +
        'IndexNow requires the key file to be hosted at https://<target-domain>/<key>.txt. ' +
        'Submissions for domains that do not host this key file will be rejected (403/422).'
      );
    }
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

    const body: Record<string, unknown> = {
      host: urlHost,
      key: this.key,
      urlList: [url],
    };

    // Only include keyLocation if configured
    if (this.keyLocation) {
      body.keyLocation = this.keyLocation;
    }

    const response = await postJson(this.endpoint, body, this.timeoutMs);

    if (!response.ok) {
      const responseBody = await response.text().catch(() => '');
      // Provide specific guidance for common errors
      if (response.status === 403 || response.status === 422) {
        throw new Error(
          `IndexNow ${response.status}: Key verification failed for ${urlHost}. ` +
          `The file https://${urlHost}/${this.key}.txt must exist and contain the key. ` +
          `Response: ${responseBody || response.statusText}`
        );
      }
      throw new Error(`IndexNow ${response.status}: ${responseBody || response.statusText}`);
    }

    return {
      adapter: this.name,
      success: true,
      tier: this.tier,
      detail: `Submitted ${urlHost} to ${new URL(this.endpoint).host}`,
    };
  }
}

