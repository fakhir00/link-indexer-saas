import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

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

class GoogleIndexingStrategy implements IndexingStrategy {
  name = 'Google Indexing API';
  private jwtClient: any;
  private indexing: any;

  constructor(serviceAccountJsonStr: string) {
    const credentials = JSON.parse(serviceAccountJsonStr);
    this.jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    this.indexing = google.indexing({
      version: 'v3',
      auth: this.jwtClient,
    });
  }

  async submit(url: string) {
    try {
      const response = await this.indexing.urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' },
      });
      return {
        strategy: this.name,
        detail: `Submitted to Google (Status: ${response.status})`,
      };
    } catch (error: any) {
      throw new Error(`Google Indexing API failed: ${error.message || error.toString()}`);
    }
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

function buildStrategies() {
  const timeoutMs = Number(process.env.INDEXING_REQUEST_TIMEOUT_MS ?? 8000);
  const strategies: IndexingStrategy[] = [];
  const pingEndpoints = csv(process.env.PING_ENDPOINTS);

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

  const credentialsPath = path.join(__dirname, '..', 'google-credentials.json');
  if (fs.existsSync(credentialsPath)) {
    try {
      const serviceAccountJson = fs.readFileSync(credentialsPath, 'utf8');
      strategies.push(new GoogleIndexingStrategy(serviceAccountJson));
    } catch (err) {
      console.error('Failed to load Google Indexing API credentials:', err);
    }
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

export function hasEnabledIndexingStrategies() {
  return strategies.length > 0;
}

export function isUsingDryRunStrategy() {
  return strategies.some((strategy) => strategy.name === 'Dry Run');
}
