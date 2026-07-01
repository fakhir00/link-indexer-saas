import { google } from 'googleapis';

export interface IndexingStrategyResult {
  strategy: string;
  detail: string;
}

export interface IndexingStrategy {
  name: string;
  submit(url: string): Promise<IndexingStrategyResult>;
}

function csv(value?: string) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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

async function postJson(endpoint: string, body: unknown, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function get(endpoint: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, { method: 'GET', signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

class PingStrategy implements IndexingStrategy {
  name = 'Ping';

  constructor(
    private readonly endpoints: string[],
    private readonly timeoutMs: number,
  ) {}

  async submit(url: string) {
    const failures: string[] = [];

    for (const endpoint of this.endpoints) {
      try {
        await get(withUrl(endpoint, url), this.timeoutMs);
        return {
          strategy: this.name,
          detail: `Accepted by ${new URL(endpoint).host}`,
        };
      } catch (error) {
        failures.push(error instanceof Error ? error.message : 'Unknown ping error');
      }
    }

    throw new Error(`Ping strategy failed: ${failures.join('; ')}`);
  }
}

class IndexNowStrategy implements IndexingStrategy {
  name = 'IndexNow';

  constructor(
    private readonly endpoint: string,
    private readonly key: string,
    private readonly host: string,
    private readonly keyLocation: string | undefined,
    private readonly timeoutMs: number,
  ) {}

  async submit(url: string) {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== this.host) {
      throw new Error(`IndexNow host mismatch: ${parsedUrl.hostname} is not ${this.host}`);
    }

    await postJson(
      this.endpoint,
      {
        host: this.host,
        key: this.key,
        keyLocation: this.keyLocation,
        urlList: [url],
      },
      this.timeoutMs,
    );

    return {
      strategy: this.name,
      detail: `Submitted to ${new URL(this.endpoint).host}`,
    };
  }
}

class DryRunStrategy implements IndexingStrategy {
  name = 'Dry Run';

  async submit(url: string) {
    return {
      strategy: this.name,
      detail: `Validated ${new URL(url).hostname}; no live indexing provider configured`,
    };
  }
}

class GoogleIndexingStrategy implements IndexingStrategy {
  name = 'Google Indexing API';

  constructor(
    private readonly serviceAccountJsonBase64: string,
    private readonly timeoutMs: number,
  ) {}

  async submit(url: string) {
    try {
      const decodedJson = Buffer.from(this.serviceAccountJsonBase64, 'base64').toString('utf-8');
      const credentials = JSON.parse(decodedJson);

      const jwtClient = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/indexing']
      });

      const indexing = google.indexing({
        version: 'v3',
        auth: jwtClient,
      });

      const res = await indexing.urlNotifications.publish(
        {
          requestBody: {
            url: url,
            type: 'URL_UPDATED',
          },
        },
        { timeout: this.timeoutMs }
      );

      return {
        strategy: this.name,
        detail: `Submitted to Google Indexing API (${res.status})`,
      };
    } catch (error: any) {
      throw new Error(`Google Indexing API failed: ${error.message || error.toString()}`);
    }
  }
}

function buildStrategies() {
  const timeoutMs = Number(process.env.INDEXING_REQUEST_TIMEOUT_MS ?? 8000);
  const strategies: IndexingStrategy[] = [];
  const pingEndpoints = csv(process.env.PING_ENDPOINTS);

  const googleServiceAccountBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64?.trim();
  if (googleServiceAccountBase64) {
    strategies.push(new GoogleIndexingStrategy(googleServiceAccountBase64, timeoutMs));
  }

  if (pingEndpoints.length > 0) {
    strategies.push(new PingStrategy(pingEndpoints, timeoutMs));
  }

  const indexNowKey = process.env.INDEXNOW_KEY?.trim();
  const indexNowHost = process.env.INDEXNOW_HOST?.trim();
  if (indexNowKey && indexNowHost) {
    strategies.push(
      new IndexNowStrategy(
        process.env.INDEXNOW_ENDPOINT?.trim() || 'https://api.indexnow.org/indexnow',
        indexNowKey,
        indexNowHost,
        process.env.INDEXNOW_KEY_LOCATION?.trim(),
        timeoutMs,
      ),
    );
  }

  if (strategies.length === 0 && process.env.INDEXING_DRY_RUN !== 'false') {
    strategies.push(new DryRunStrategy());
  }

  return strategies;
}

const strategies = buildStrategies();

export async function submitUrlToIndexingProviders(url: string) {
  if (strategies.length === 0) {
    throw new Error('No indexing providers configured');
  }

  const results = await Promise.allSettled(strategies.map((strategy) => strategy.submit(url)));
  const successes = results
    .filter((result): result is PromiseFulfilledResult<IndexingStrategyResult> => result.status === 'fulfilled')
    .map((result) => result.value);

  if (successes.length > 0) {
    return successes;
  }

  const failures = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => (result.reason instanceof Error ? result.reason.message : 'Unknown provider error'));

  throw new Error(failures.join('; ') || 'All indexing providers failed');
}

export function getEnabledIndexingStrategies() {
  return strategies.map((strategy) => strategy.name);
}
