import { IndexingAdapter, AdapterType, AdapterTier, AdapterResult, SubmissionContext } from './adapter.interface';

async function fetchJson(endpoint: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(endpoint, { method: 'GET', signal: controller.signal })
    .then(res => res.json())
    .finally(() => clearTimeout(timeout));
}

// Function to just hit the shortlink once to register a crawl/hit
async function pingUrl(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { 
    method: 'HEAD', // HEAD request is enough to trigger the redirect and register the hit
    signal: controller.signal,
    redirect: 'follow'
  }).finally(() => clearTimeout(timeout));
}

export class ShortenerAdapter implements IndexingAdapter {
  readonly name = 'Shortener Bounce';
  readonly type: AdapterType = 'api';
  readonly tier: AdapterTier = 'supplementary';
  private timeoutMs: number;

  constructor() {
    this.timeoutMs = Number(process.env.INDEXING_REQUEST_TIMEOUT_MS ?? 8000);
  }

  isConfigured(): boolean {
    return true; // Uses free open APIs
  }

  async submit(url: string, _context?: SubmissionContext): Promise<AdapterResult> {
    const encodedUrl = encodeURIComponent(url);
    // is.gd is a free URL shortener with a simple JSON API that doesn't require an API key
    const apiUrl = `https://is.gd/create.php?format=json&url=${encodedUrl}`;

    try {
      const data: any = await fetchJson(apiUrl, this.timeoutMs);
      
      if (data.errorcode || !data.shorturl) {
        throw new Error(data.errormessage || 'Failed to generate shortlink');
      }

      const shortUrl = data.shorturl;

      // Ping the short URL to establish an initial request trail
      try {
        await pingUrl(shortUrl, this.timeoutMs);
      } catch (err) {
        // We don't fail the whole adapter if the ping fails, 
        // the shortlink was still created and exists out there.
        console.warn(`[ShortenerAdapter] Failed to ping generated shortlink ${shortUrl}:`, err);
      }

      return {
        adapter: this.name,
        success: true,
        tier: this.tier,
        detail: `Created shortlink: ${shortUrl} (supplementary — does not directly signal search engines)`,
      };
    } catch (error: any) {
      throw new Error(`Shortener Bounce failed: ${error.message || 'Unknown error'}`);
    }
  }
}

