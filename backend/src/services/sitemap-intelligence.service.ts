import zlib from 'zlib';
import { uniqueNormalizedUrls } from '../utils';

export interface SitemapAnalyzeInput {
  ownDomain: string;
  competitorDomains?: string[];
  maxUrls?: number;
  contentOnly?: boolean;
}

export interface SitemapSource {
  url: string;
  type: 'robots' | 'common' | 'nested' | 'fallback';
  status: 'found' | 'miss' | 'error';
  urlsFound: number;
  error?: string;
}

export interface TopicSummary {
  topic: string;
  count: number;
  urls: string[];
}

export interface SitemapDiscoveryResult {
  input: string;
  domain: string;
  baseUrl: string;
  sitemapUrls: string[];
  urls: string[];
  contentUrls: string[];
  indexableUrls: string[];
  topics: TopicSummary[];
  sources: SitemapSource[];
  errors: string[];
}

export interface SitemapGap {
  topic: string;
  score: number;
  competitorCount: number;
  competitorDomains: string[];
  sampleUrls: string[];
}

export interface SitemapAnalyzeResult {
  generatedAt: string;
  contentOnly: boolean;
  maxUrls: number;
  own: SitemapDiscoveryResult;
  competitors: SitemapDiscoveryResult[];
  gaps: SitemapGap[];
  totals: {
    ownUrls: number;
    ownContentUrls: number;
    competitorUrls: number;
    competitorContentUrls: number;
    competitorTopics: number;
    gaps: number;
  };
}

const USER_AGENT = 'IndexFlow-SitemapIntelligence/1.0 (+https://indexflow.app)';
const MAX_DEPTH = 5;
const MAX_SITEMAPS = 40;
const FETCH_TIMEOUT_MS = Number(process.env.SITEMAP_FETCH_TIMEOUT_MS ?? 10_000);
const FETCH_RETRIES = 1;

const COMMON_SITEMAP_PATHS = [
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/sitemap/sitemap.xml',
  '/sitemap/',
  '/sitemaps/sitemap.xml',
  '/news-sitemap.xml',
  '/blog-sitemap.xml',
  '/post-sitemap.xml',
  '/page-sitemap.xml',
];

const CONTENT_PATTERNS = [
  /\/blog\//i,
  /\/news\//i,
  /\/post\//i,
  /\/posts\//i,
  /\/article\//i,
  /\/articles\//i,
  /\/insights\//i,
  /\/resources\//i,
  /\/guides\//i,
  /\/tutorials?\//i,
  /\/stories\//i,
  /\/updates\//i,
  /\/press\//i,
  /\/media\//i,
  /\/learn\//i,
  /\/knowledge\//i,
  /\/support\//i,
  /\/\d{4}\/\d{2}\//i,
  /\/\d{4}\/\d{2}\/\d{2}\//i,
  /\/\d{4}\//i,
];

const EXCLUDE_PATTERNS = [
  /\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|gz|tar|mp4|mp3|css|js)(\?|$)/i,
  /\/tag\//i,
  /\/tags\//i,
  /\/category\//i,
  /\/categories\//i,
  /\/author\//i,
  /\/authors\//i,
  /\/page\/\d+/i,
  /\/wp-json\//i,
  /\/wp-admin\//i,
  /\/wp-content\//i,
  /\/feed\//i,
  /\/rss\//i,
  /\/amp\//i,
  /#/,
  /\?s=/i,
  /\/search\//i,
  /\/cart\//i,
  /\/checkout\//i,
  /\/account\//i,
  /\/login\//i,
  /\/register\//i,
  /\/sitemap/i,
];

const STOP_WORDS = new Set([
  'a',
  'about',
  'and',
  'are',
  'best',
  'blog',
  'for',
  'from',
  'how',
  'into',
  'new',
  'news',
  'of',
  'on',
  'page',
  'pages',
  'post',
  'posts',
  'the',
  'to',
  'top',
  'url',
  'urls',
  'with',
  'www',
  'your',
]);

function clampMaxUrls(maxUrls?: number) {
  return Math.min(1000, Math.max(10, maxUrls ?? 300));
}

function getBaseUrl(input: string): string {
  const withScheme = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
  const parsed = new URL(withScheme);

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS domains are supported');
  }

  return parsed.origin;
}

function hostKey(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return value.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

function urlFromBase(baseUrl: string, pathOrUrl: string) {
  return new URL(pathOrUrl, baseUrl).toString();
}

function decodeXmlEntity(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function decodeMaybeGzip(buffer: Buffer) {
  if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
    return zlib.gunzipSync(buffer).toString('utf8');
  }

  return buffer.toString('utf8');
}

async function fetchText(url: string): Promise<{ status: number; text?: string; error?: string }> {
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      const body = Buffer.from(await response.arrayBuffer());

      if ((response.status === 429 || response.status >= 500) && attempt < FETCH_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }

      if (!response.ok) {
        return { status: response.status, error: response.statusText || `HTTP ${response.status}` };
      }

      return { status: response.status, text: decodeMaybeGzip(body) };
    } catch (error) {
      if (attempt < FETCH_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }

      return {
        status: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { status: 0, error: 'Fetch failed' };
}

function parseLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi))
    .map((match) => decodeXmlEntity(match[1].trim()))
    .filter((loc) => /^https?:\/\//i.test(loc));
}

function parseRobotsSitemaps(robotsTxt: string) {
  return robotsTxt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^sitemap:/i.test(line))
    .map((line) => line.split(/:\s*/).slice(1).join(':').trim())
    .filter((url) => /^https?:\/\//i.test(url));
}

function looksLikeSitemapUrl(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith('.xml') || path.endsWith('.xml.gz') || path.includes('sitemap');
  } catch {
    return /sitemap|\.xml(\.gz)?$/i.test(url);
  }
}

function sameDomain(url: string, baseUrl: string) {
  const urlHost = hostKey(url);
  const baseHost = hostKey(baseUrl);
  return urlHost === baseHost || urlHost.endsWith(`.${baseHost}`);
}

function isContentUrl(url: string, baseUrl: string) {
  if (!/^https?:\/\//i.test(url) || !sameDomain(url, baseUrl)) return false;
  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(url))) return false;

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();

    if (CONTENT_PATTERNS.some((pattern) => pattern.test(path))) return true;

    const segments = path.split('/').filter(Boolean);
    const last = segments.at(-1) ?? '';
    if (segments.length >= 2 && last.includes('-') && last.length > 15 && !/\.(html?|php)$/i.test(last)) {
      return true;
    }
    if (/\.(html?|php)$/i.test(last) && last.includes('-') && last.length > 20) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function normalizeTopicToken(value: string) {
  return value
    .toLowerCase()
    .replace(/\.(html?|php|aspx?)$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function topicFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname
      .split('/')
      .map((segment) => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return segment;
        }
      })
      .map(normalizeTopicToken)
      .filter(Boolean)
      .filter((segment) => !CONTENT_PATTERNS.some((pattern) => pattern.test(`/${segment}/`)));

    const candidate = segments.at(-1) ?? parsed.hostname.replace(/^www\./i, '');
    const words = normalizeTopicToken(candidate)
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter((word) => !STOP_WORDS.has(word))
      .filter((word) => !/^\d+$/.test(word));

    return words.slice(0, 6).join(' ');
  } catch {
    return '';
  }
}

function buildTopics(urls: string[]) {
  const topicMap = new Map<string, { count: number; urls: string[] }>();

  for (const url of urls) {
    const topic = topicFromUrl(url);
    if (!topic) continue;

    const current = topicMap.get(topic) ?? { count: 0, urls: [] };
    current.count += 1;
    if (current.urls.length < 3) current.urls.push(url);
    topicMap.set(topic, current);
  }

  return Array.from(topicMap.entries())
    .map(([topic, value]) => ({ topic, count: value.count, urls: value.urls }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))
    .slice(0, 100);
}

async function discover(input: string, maxUrls: number, contentOnly: boolean): Promise<SitemapDiscoveryResult> {
  const baseUrl = getBaseUrl(input);
  const domain = hostKey(baseUrl);
  const sources: SitemapSource[] = [];
  const errors: string[] = [];
  const visited = new Set<string>();
  const sitemapUrls = new Set<string>();
  const pageUrls = new Set<string>();

  async function walkSitemap(url: string, type: SitemapSource['type'], depth: number): Promise<void> {
    if (visited.has(url) || depth > MAX_DEPTH || visited.size >= MAX_SITEMAPS || pageUrls.size >= maxUrls) {
      return;
    }
    visited.add(url);

    const response = await fetchText(url);
    if (!response.text) {
      if (depth === 0) {
        sources.push({ url, type, status: response.status === 404 ? 'miss' : 'error', urlsFound: 0, error: response.error });
      }
      return;
    }

    const locs = parseLocs(response.text);
    const isIndex = /<sitemapindex\b/i.test(response.text);
    const isUrlSet = /<urlset\b/i.test(response.text);

    if (isIndex) {
      sources.push({ url, type, status: 'found', urlsFound: locs.length });
      for (const child of locs) {
        if (visited.size >= MAX_SITEMAPS || pageUrls.size >= maxUrls) break;
        await walkSitemap(child, 'nested', depth + 1);
      }
      return;
    }

    if (isUrlSet || locs.some((loc) => !looksLikeSitemapUrl(loc))) {
      sitemapUrls.add(url);
      const before = pageUrls.size;
      for (const loc of locs) {
        if (pageUrls.size >= maxUrls) break;
        if (!looksLikeSitemapUrl(loc) && sameDomain(loc, baseUrl)) {
          pageUrls.add(loc);
        }
      }
      sources.push({ url, type, status: 'found', urlsFound: pageUrls.size - before });
      return;
    }

    sources.push({ url, type, status: 'miss', urlsFound: 0 });
  }

  const robotsUrl = urlFromBase(baseUrl, '/robots.txt');
  const robots = await fetchText(robotsUrl);
  if (robots.text) {
    const robotsSitemaps = parseRobotsSitemaps(robots.text);
    if (robotsSitemaps.length === 0) {
      sources.push({ url: robotsUrl, type: 'robots', status: 'miss', urlsFound: 0 });
    }
    for (const sitemapUrl of robotsSitemaps) {
      await walkSitemap(sitemapUrl, 'robots', 0);
    }
  } else {
    sources.push({ url: robotsUrl, type: 'robots', status: robots.status === 404 ? 'miss' : 'error', urlsFound: 0, error: robots.error });
  }

  for (const path of COMMON_SITEMAP_PATHS) {
    if (pageUrls.size >= maxUrls) break;
    await walkSitemap(urlFromBase(baseUrl, path), 'common', 0);
  }

  if (pageUrls.size === 0) {
    await walkSitemap(urlFromBase(baseUrl, '/sitemap.xml'), 'fallback', 0);
  }

  if (pageUrls.size === 0) {
    pageUrls.add(baseUrl);
    errors.push('No sitemap URLs were found, so the domain homepage was returned as a fallback.');
  }

  const urls = uniqueNormalizedUrls(Array.from(pageUrls)).slice(0, maxUrls);
  const contentUrls = urls.filter((url) => isContentUrl(url, baseUrl));
  const indexableUrls = contentOnly ? contentUrls : urls;
  const topics = buildTopics(contentUrls.length > 0 ? contentUrls : urls);

  return {
    input,
    domain,
    baseUrl,
    sitemapUrls: Array.from(sitemapUrls),
    urls,
    contentUrls,
    indexableUrls,
    topics,
    sources,
    errors,
  };
}

function buildGaps(own: SitemapDiscoveryResult, competitors: SitemapDiscoveryResult[]) {
  const ownTopics = new Set(own.topics.map((topic) => topic.topic));
  const gaps = new Map<string, { count: number; domains: Set<string>; urls: string[] }>();

  for (const competitor of competitors) {
    for (const topic of competitor.topics) {
      if (ownTopics.has(topic.topic)) continue;

      const current = gaps.get(topic.topic) ?? { count: 0, domains: new Set<string>(), urls: [] };
      current.count += topic.count;
      current.domains.add(competitor.domain);
      for (const url of topic.urls) {
        if (current.urls.length < 5) current.urls.push(url);
      }
      gaps.set(topic.topic, current);
    }
  }

  return Array.from(gaps.entries())
    .map(([topic, value]) => ({
      topic,
      score: value.count * 10 + value.domains.size * 25,
      competitorCount: value.count,
      competitorDomains: Array.from(value.domains),
      sampleUrls: value.urls,
    }))
    .sort((a, b) => b.score - a.score || a.topic.localeCompare(b.topic))
    .slice(0, 100);
}

export const sitemapIntelligenceService = {
  async analyze(input: SitemapAnalyzeInput): Promise<SitemapAnalyzeResult> {
    const maxUrls = clampMaxUrls(input.maxUrls);
    const contentOnly = input.contentOnly ?? false;
    const competitorDomains = uniqueNormalizedUrls(input.competitorDomains ?? []).slice(0, 5);

    const [own, ...competitors] = await Promise.all([
      discover(input.ownDomain, maxUrls, contentOnly),
      ...competitorDomains.map((domain) => discover(domain, maxUrls, true)),
    ]);
    const gaps = buildGaps(own, competitors);

    return {
      generatedAt: new Date().toISOString(),
      contentOnly,
      maxUrls,
      own,
      competitors,
      gaps,
      totals: {
        ownUrls: own.urls.length,
        ownContentUrls: own.contentUrls.length,
        competitorUrls: competitors.reduce((sum, competitor) => sum + competitor.urls.length, 0),
        competitorContentUrls: competitors.reduce((sum, competitor) => sum + competitor.contentUrls.length, 0),
        competitorTopics: new Set(competitors.flatMap((competitor) => competitor.topics.map((topic) => topic.topic))).size,
        gaps: gaps.length,
      },
    };
  },
};
