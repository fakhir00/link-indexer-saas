import { IndexingAdapter, AdapterType, AdapterResult, SubmissionContext } from './adapter.interface';

function get(endpoint: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(endpoint, { method: 'GET', signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}

export class SitemapAdapter implements IndexingAdapter {
  readonly name = 'Sitemap Ping';
  readonly type: AdapterType = 'ping';
  private timeoutMs: number;

  constructor() {
    this.timeoutMs = Number(process.env.INDEXING_REQUEST_TIMEOUT_MS ?? 8000);
  }

  isConfigured(): boolean {
    // This adapter is always available as long as it's registered.
    return true;
  }

  async submit(url: string, _context?: SubmissionContext): Promise<AdapterResult> {
    const parsedUrl = new URL(url);
    // Construct standard sitemap URL
    const sitemapUrl = `${parsedUrl.origin}/sitemap.xml`;
    const encodedSitemapUrl = encodeURIComponent(sitemapUrl);

    const endpoints = [
      `https://www.google.com/ping?sitemap=${encodedSitemapUrl}`,
      `https://www.bing.com/ping?sitemap=${encodedSitemapUrl}`
    ];

    const failures: string[] = [];
    let successes = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await get(endpoint, this.timeoutMs);
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        successes++;
      } catch (error) {
        failures.push(`${new URL(endpoint).host} ping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (successes === 0) {
      throw new Error(`Sitemap Ping failed: ${failures.join('; ')}`);
    }

    return {
      adapter: this.name,
      success: true,
      detail: `Sitemap pinged to ${successes} search engines`,
    };
  }
}
