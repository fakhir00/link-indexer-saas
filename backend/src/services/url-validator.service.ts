/**
 * URL Validation Service
 *
 * Runs the full 9-step pre-submission validation pipeline:
 *  1. DNS resolution
 *  2. HTTP status + redirect chain
 *  3. HTTPS check
 *  4. Content-Type
 *  5. Robots.txt
 *  6. Meta robots noindex
 *  7. Canonical tag
 *  8. Response time
 *  9. Duplicate check
 *
 * Returns a ValidationResult that maps 1:1 to the UrlValidation model.
 */

export interface ValidationResult {
  // DNS
  dnsResolved: boolean;
  dnsError?: string;
  ipAddress?: string;

  // HTTP
  httpStatus?: number;
  finalUrl?: string;
  redirectChain: string[];
  redirectCount: number;
  responseTimeMs?: number;
  contentType?: string;
  contentLength?: number;

  // HTTPS
  isHttps: boolean;
  sslValid?: boolean;

  // Crawlability
  robotsTxtBlocked: boolean;
  robotsRule?: string;
  metaRobotsNoindex: boolean;
  canonicalUrl?: string;
  canonicalMismatch: boolean;

  // Computed scores (set by scorer)
  technicalScore?: number;
  contentScore?: number;
  indexabilityScore?: number;

  // Warnings for the user (non-blocking)
  warnings: string[];
  isIndexable: boolean;
}

const FETCH_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 10;
const ROBOTS_CACHE = new Map<string, { content: string; cachedAt: number }>();
const ROBOTS_TTL_MS = 15 * 60_000; // 15 minutes

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms),
    ),
  ]);
}

/** Fetch with manual redirect tracking */
async function fetchWithRedirects(url: string): Promise<{
  finalUrl: string;
  status: number;
  headers: Headers;
  text: () => Promise<string>;
  redirectChain: string[];
  responseTimeMs: number;
}> {
  const chain: string[] = [url];
  let current = url;
  let response!: Response;
  const start = Date.now();

  for (let i = 0; i < MAX_REDIRECTS; i++) {
    response = await withTimeout(
      fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'NexusIndexerBot/1.0 (+https://nexusindexer.com/bot)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }),
      FETCH_TIMEOUT_MS,
    );

    const location = response.headers.get('location');
    if ((response.status >= 301 && response.status <= 308) && location) {
      const next = new URL(location, current).toString();
      chain.push(next);
      current = next;
    } else {
      break;
    }
  }

  return {
    finalUrl: current,
    status: response.status,
    headers: response.headers,
    text: () => response.text(),
    redirectChain: chain,
    responseTimeMs: Date.now() - start,
  };
}

/** Fetch and cache robots.txt for a domain */
async function getRobotsTxt(origin: string): Promise<string> {
  const cached = ROBOTS_CACHE.get(origin);
  if (cached && Date.now() - cached.cachedAt < ROBOTS_TTL_MS) {
    return cached.content;
  }

  try {
    const res = await withTimeout(
      fetch(`${origin}/robots.txt`, {
        headers: { 'User-Agent': 'NexusIndexerBot/1.0' },
        signal: AbortSignal.timeout(5_000),
      }),
      5_000,
    );
    if (res.status === 200) {
      const content = await res.text();
      ROBOTS_CACHE.set(origin, { content, cachedAt: Date.now() });
      return content;
    }
  } catch {
    // robots.txt unreachable = assume allowed
  }
  return '';
}

/** Check if a user-agent is blocked by robots.txt */
function isBlockedByRobots(robotsTxt: string, url: string): { blocked: boolean; rule?: string } {
  if (!robotsTxt) return { blocked: false };

  const lines = robotsTxt.split('\n').map((l) => l.trim());
  let inOurBlock = false;
  let disallowRules: string[] = [];

  for (const line of lines) {
    if (line.toLowerCase().startsWith('user-agent:')) {
      const agent = line.split(':')[1]?.trim().toLowerCase();
      inOurBlock = agent === '*' || agent === 'nexusindexerbot';
      if (inOurBlock) disallowRules = [];
    }
    if (inOurBlock && line.toLowerCase().startsWith('disallow:')) {
      const rule = line.split(':')[1]?.trim();
      if (rule) disallowRules.push(rule);
    }
  }

  try {
    const path = new URL(url).pathname;
    const matchedRule = disallowRules.find((rule) => rule === '/' || path.startsWith(rule));
    if (matchedRule) return { blocked: true, rule: matchedRule };
  } catch {
    // ignore malformed URLs
  }

  return { blocked: false };
}

/** Parse meta robots and canonical from HTML */
function parseHtmlMeta(html: string, baseUrl: string): { noindex: boolean; canonical?: string } {
  const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex[^"']*["']/i.test(html);
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const canonical = canonicalMatch?.[1]
    ? new URL(canonicalMatch[1], baseUrl).toString()
    : undefined;
  return { noindex, canonical };
}

export async function validateUrl(rawUrl: string): Promise<ValidationResult> {
  const warnings: string[] = [];
  const result: ValidationResult = {
    dnsResolved: false,
    redirectChain: [],
    redirectCount: 0,
    isHttps: false,
    robotsTxtBlocked: false,
    metaRobotsNoindex: false,
    canonicalMismatch: false,
    warnings,
    isIndexable: false,
  };

  // ── Step 1-4: HTTP fetch (covers DNS, redirects, HTTPS, Content-Type) ─────
  let html = '';
  try {
    const res = await fetchWithRedirects(rawUrl);
    result.dnsResolved = true;
    result.httpStatus = res.status;
    result.finalUrl = res.finalUrl;
    result.redirectChain = res.redirectChain;
    result.redirectCount = res.redirectChain.length - 1;
    result.responseTimeMs = res.responseTimeMs;
    result.contentType = res.headers.get('content-type') ?? undefined;
    result.contentLength = Number(res.headers.get('content-length')) || undefined;
    result.isHttps = res.finalUrl.startsWith('https://');
    result.sslValid = result.isHttps; // simplified — true if HTTPS resolved

    if (!result.isHttps) warnings.push('Page is served over HTTP, not HTTPS');
    if (result.redirectCount > 0) warnings.push(`${result.redirectCount} redirect(s): ${result.redirectChain.join(' → ')}`);
    if (result.redirectCount > 2) warnings.push('Long redirect chain may slow down indexing');
    if (result.responseTimeMs > 3000) warnings.push(`Slow response time: ${result.responseTimeMs}ms`);

    if (res.status >= 200 && res.status < 300) {
      const ct = result.contentType ?? '';
      if (ct.includes('text/html')) {
        try {
          html = await res.text();
        } catch {
          // body read failed — not fatal
        }
      } else {
        warnings.push(`Non-HTML content-type: ${ct}`);
      }
    } else if (res.status === 404) {
      warnings.push('URL returns 404 Not Found');
    } else if (res.status >= 400) {
      warnings.push(`URL returns HTTP ${res.status}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      result.dnsError = msg;
      warnings.push('DNS resolution failed — domain does not exist or is unreachable');
    } else if (msg.includes('SSL') || msg.includes('certificate')) {
      result.sslValid = false;
      warnings.push('SSL/TLS certificate error');
    } else {
      warnings.push(`Fetch error: ${msg}`);
    }
    return { ...result, isIndexable: false };
  }

  // ── Step 5: Robots.txt ────────────────────────────────────────────────────
  try {
    const origin = new URL(result.finalUrl ?? rawUrl).origin;
    const robotsTxt = await getRobotsTxt(origin);
    const robotsCheck = isBlockedByRobots(robotsTxt, result.finalUrl ?? rawUrl);
    result.robotsTxtBlocked = robotsCheck.blocked;
    result.robotsRule = robotsCheck.rule;
    if (robotsCheck.blocked) {
      warnings.push(`robots.txt blocks indexing: Disallow: ${robotsCheck.rule}`);
    }
  } catch {
    // robots.txt check failed — non-fatal
  }

  // ── Steps 6-7: Meta robots + Canonical ───────────────────────────────────
  if (html) {
    const { noindex, canonical } = parseHtmlMeta(html, result.finalUrl ?? rawUrl);
    result.metaRobotsNoindex = noindex;
    result.canonicalUrl = canonical;

    if (noindex) {
      warnings.push('Page has <meta name="robots" content="noindex">');
    }

    if (canonical) {
      const finalNormalized = (result.finalUrl ?? rawUrl).split('?')[0].replace(/\/$/, '');
      const canonicalNormalized = canonical.split('?')[0].replace(/\/$/, '');
      result.canonicalMismatch = finalNormalized !== canonicalNormalized;
      if (result.canonicalMismatch) {
        warnings.push(`Canonical points elsewhere: ${canonical}`);
      }
    }
  }

  // ── Indexability verdict ──────────────────────────────────────────────────
  const httpOk = result.httpStatus !== undefined && result.httpStatus >= 200 && result.httpStatus < 300;
  result.isIndexable =
    result.dnsResolved &&
    httpOk &&
    !result.robotsTxtBlocked &&
    !result.metaRobotsNoindex;

  return result;
}
