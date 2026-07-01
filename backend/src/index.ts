import express, { NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from './prisma';
import { indexQueue, getQueueSnapshot, connection } from './queue';
import { getEnabledIndexingStrategies, hasEnabledIndexingStrategies, isUsingDryRunStrategy } from './indexing-strategies';

dotenv.config({ override: true });

if (process.env.ENABLE_INLINE_WORKER === 'true') {
  void import('./worker');
}

const app = express();
const port = Number(process.env.PORT ?? 4000);

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

const urlSchema = z
  .string()
  .trim()
  .url('Each URL must be a valid absolute URL')
  .refine((value) => /^https?:\/\//i.test(value), 'URL must start with http:// or https://')
  .max(2048, 'URL exceeds max length of 2048 characters');

const createCampaignSchema = z.object({
  name: z.string().trim().min(2).max(120),
  dripPerDay: z.number().int().min(1).max(10000).optional(),
  urls: z.array(urlSchema).min(1).max(10000),
});

const statusUpdateSchema = z.object({
  status: z.enum(['paused', 'processing']),
});

const createApiKeySchema = z.object({
  label: z.string().trim().min(1).max(80),
});

const urlsQuerySchema = z.object({
  status: z.enum(['all', 'queued', 'processing', 'completed', 'failed']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  search: z.string().trim().max(250).optional(),
  campaignId: z.string().trim().uuid().optional(),
});

class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }
  throw new HttpError(400, 'Validation failed', parsed.error.flatten());
}

function uniqueNormalizedUrls(urls: string[]) {
  const clean = urls.map((url) => url.trim());
  return Array.from(new Set(clean));
}

function hashApiKey(apiKey: string) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

function generateApiKey() {
  return `if_live_sk_${crypto.randomBytes(24).toString('hex')}`;
}

function toApiKeyItem(apiKey: {
  id: string;
  keyHash: string;
  label: string | null;
  lastUsedAt: Date | null;
  requestCount: number;
  isActive: boolean;
  createdAt: Date;
}) {
  return {
    id: apiKey.id,
    label: apiKey.label ?? 'Untitled key',
    keyPreview: `if_live_sk_...${apiKey.keyHash.slice(-8)}`,
    lastUsedAt: apiKey.lastUsedAt,
    requestCount: apiKey.requestCount,
    isActive: apiKey.isActive,
    createdAt: apiKey.createdAt,
  };
}

function requireIndexingProvider() {
  if (hasEnabledIndexingStrategies()) {
    return;
  }

  throw new HttpError(
    503,
    'No live indexing provider configured. Add INDEXNOW_KEY and INDEXNOW_HOST, or configure PING_ENDPOINTS. Set INDEXING_DRY_RUN=true only for local testing.',
  );
}

app.get('/health', async (_req, res) => {
  let dbConnected = false;
  let redisConnected = false;
  let queue = {
    waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0, total: 0,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  try {
    redisConnected = (await connection.ping()) === 'PONG';
  } catch {
    redisConnected = false;
  }

  if (redisConnected) {
    try {
      queue = await getQueueSnapshot();
    } catch {
      // ignore queue errors for health response
    }
  }

  const healthy = dbConnected && redisConnected;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbConnected ? 'up' : 'down',
      redis: redisConnected ? 'up' : 'down',
    },
    queue,
  });
});

app.get('/analytics', async (_req, res) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 13);
  start.setHours(0, 0, 0, 0);

  const [totalCampaigns, totalUrls, successUrls, failedUrls, recentCampaigns, recentUrls] = await Promise.all([
    prisma.campaign.count(),
    prisma.url.count(),
    prisma.url.count({ where: { status: 'completed' } }),
    prisma.url.count({ where: { status: 'failed' } }),
    prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { urls: true } },
      },
    }),
    prisma.url.findMany({
      where: {
        createdAt: { gte: start },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const trendMap = new Map<string, { submitted: number; crawled: number; failed: number }>();
  for (let i = 0; i < 14; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    trendMap.set(key, { submitted: 0, crawled: 0, failed: 0 });
  }

  for (const item of recentUrls) {
    const key = item.createdAt.toISOString().slice(0, 10);
    const target = trendMap.get(key);
    if (!target) continue;
    target.submitted += 1;
    if (item.status === 'completed') target.crawled += 1;
    if (item.status === 'failed') target.failed += 1;
  }

  const trends = Array.from(trendMap.entries()).map(([key, value]) => {
    const d = new Date(`${key}T00:00:00Z`);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      submitted: value.submitted,
      crawled: value.crawled,
      failed: value.failed,
    };
  });

  const successRate = totalUrls > 0 ? Number(((successUrls / totalUrls) * 100).toFixed(1)) : 0;

  res.json({
    totalCampaigns,
    totalUrls,
    successUrls,
    failedUrls,
    successRate,
    trends,
    recentCampaigns: recentCampaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      createdAt: campaign.createdAt,
      totalUrls: campaign._count.urls,
    })),
  });
});

app.get('/campaigns', async (_req, res) => {
  const campaigns = await prisma.campaign.findMany({
    include: {
      _count: { select: { urls: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const campaignIds = campaigns.map((campaign) => campaign.id);
  const completedGroups = campaignIds.length
    ? await prisma.url.groupBy({
        by: ['campaignId'],
        where: {
          campaignId: { in: campaignIds },
          status: 'completed',
        },
        _count: { _all: true },
      })
    : [];

  const completedMap = new Map(completedGroups.map((group) => [group.campaignId, group._count._all]));

  const result = campaigns.map((campaign) => {
    const totalUrls = campaign._count.urls;
    const completedUrls = completedMap.get(campaign.id) ?? 0;
    const progress = totalUrls > 0 ? Math.round((completedUrls / totalUrls) * 100) : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      dripPerDay: campaign.dripPerDay,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      totalUrls,
      completedUrls,
      progress,
    };
  });

  res.json(result);
});

app.post('/campaigns', async (req, res) => {
  requireIndexingProvider();

  const input = parseOrThrow(createCampaignSchema, req.body);
  const urls = uniqueNormalizedUrls(input.urls);

  if (urls.length === 0) {
    throw new HttpError(400, 'No valid URLs provided');
  }

  const campaign = await prisma.campaign.create({
    data: {
      name: input.name,
      status: 'processing',
      dripPerDay: input.dripPerDay ?? 30,
      urls: {
        create: urls.map((link) => ({
          link,
          status: 'queued',
        })),
      },
    },
    include: { urls: true },
  });

  await indexQueue.addBulk(
    campaign.urls.map((url) => ({
      name: 'index-url',
      data: {
        urlId: url.id,
        url: url.link,
      },
      opts: {
        jobId: url.id,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    })),
  );

  res.status(201).json({
    success: true,
    campaign: {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      totalUrls: campaign.urls.length,
      createdAt: campaign.createdAt,
    },
  });
});

app.patch('/campaigns/:id/status', async (req, res) => {
  const { status } = parseOrThrow(statusUpdateSchema, req.body);
  const campaignId = String(req.params.id);

  const updated = await prisma.campaign.updateMany({
    where: {
      id: campaignId,
    },
    data: { status },
  });

  if (updated.count === 0) {
    throw new HttpError(404, 'Campaign not found');
  }

  res.json({ success: true });
});

app.delete('/campaigns/:id', async (req, res) => {
  const campaignId = String(req.params.id);
  const deleted = await prisma.campaign.deleteMany({
    where: {
      id: campaignId,
    },
  });

  if (deleted.count === 0) {
    throw new HttpError(404, 'Campaign not found');
  }

  res.json({ success: true });
});

app.get('/urls', async (req, res) => {
  const { status, limit, offset, search, campaignId } = parseOrThrow(urlsQuerySchema, req.query);

  const whereClause = {
    ...(status !== 'all' ? { status } : {}),
    ...(search
      ? {
          link: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),
    ...(campaignId ? { campaignId } : {}),
  };

  const [urls, total] = await Promise.all([
    prisma.url.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: { campaign: { select: { id: true, name: true, status: true } } },
    }),
    prisma.url.count({ where: whereClause }),
  ]);

  res.json({ urls, total, limit, offset });
});

app.post('/urls/:id/retry', async (req, res) => {
  requireIndexingProvider();

  const urlId = String(req.params.id);
  const url = await prisma.url.findFirst({
    where: {
      id: urlId,
    },
  });

  if (!url) {
    throw new HttpError(404, 'URL not found');
  }

  if (url.status !== 'failed') {
    throw new HttpError(400, 'Only failed URLs can be retried');
  }

  await prisma.url.update({
    where: { id: url.id },
    data: {
      status: 'queued',
      retryCount: 0,
      errorMessage: null,
    },
  });

  await prisma.campaign.update({
    where: { id: url.campaignId },
    data: { status: 'processing' },
  });

  await indexQueue.add('index-url', { urlId: url.id, url: url.link }, { jobId: url.id, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

  res.json({ success: true });
});

app.post('/urls/retry-failed', async (_req, res) => {
  requireIndexingProvider();

  const failedUrls = await prisma.url.findMany({
    where: {
      status: 'failed',
    },
    select: {
      id: true,
      link: true,
      campaignId: true,
    },
  });

  if (failedUrls.length === 0) {
    return res.json({ success: true, retried: 0 });
  }

  await prisma.$transaction([
    prisma.url.updateMany({
      where: {
        id: { in: failedUrls.map((url) => url.id) },
      },
      data: {
        status: 'queued',
        retryCount: 0,
        errorMessage: null,
      },
    }),
    prisma.campaign.updateMany({
      where: { id: { in: Array.from(new Set(failedUrls.map((url) => url.campaignId))) } },
      data: { status: 'processing' },
    }),
  ]);

  await indexQueue.addBulk(
    failedUrls.map((url) => ({
      name: 'index-url',
      data: { urlId: url.id, url: url.link },
      opts: { jobId: url.id, attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    })),
  );

  res.json({ success: true, retried: failedUrls.length });
});

app.get('/api-keys', async (_req, res) => {
  const apiKeys = await prisma.apiKey.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json(apiKeys.map(toApiKeyItem));
});

app.post('/api-keys', async (req, res) => {
  const { label } = parseOrThrow(createApiKeySchema, req.body);
  const rawKey = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      label,
      keyHash: hashApiKey(rawKey),
    },
  });

  res.status(201).json({
    ...toApiKeyItem(apiKey),
    key: rawKey,
  });
});

app.delete('/api-keys/:id', async (req, res) => {
  const updated = await prisma.apiKey.updateMany({
    where: { id: String(req.params.id) },
    data: { isActive: false },
  });

  if (updated.count === 0) {
    throw new HttpError(404, 'API key not found');
  }

  res.json({ success: true });
});

const billingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    monthlyCredits: 500,
    features: ['500 URL credits/mo', '3 active campaigns', 'Ping endpoint strategy', 'CSV import', 'Basic analytics', 'Admin support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    monthlyCredits: 2000,
    features: ['2,000 URL credits/mo', 'Unlimited campaigns', 'Ping + IndexNow strategies', 'CSV import + API access', 'Advanced analytics', 'API key authentication'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 199,
    monthlyCredits: 10000,
    features: ['10,000 URL credits/mo', 'Unlimited campaigns', 'Ping + IndexNow strategies', 'Bulk campaign operations', 'Admin-managed users', 'Priority operations support'],
  },
] as const;

app.get('/billing/plans', (_req, res) => {
  res.json(billingPlans);
});

app.get('/billing/overview', async (_req, res) => {
  const currentPlan = billingPlans[0];
  const now = new Date();
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const usedThisMonth = await prisma.url.count({
    where: { createdAt: { gte: cycleStart, lt: cycleEnd } },
  });

  res.json({
    currentPlan,
    credits: {
      currentBalance: Math.max(currentPlan.monthlyCredits - usedThisMonth, 0),
      usedThisMonth,
      monthlyAllowance: currentPlan.monthlyCredits,
      cycleEnd,
    },
  });
});

app.get('/sitemap.xml', async (_req, res) => {
  const urls = await prisma.url.findMany({
    where: { status: 'completed' },
    orderBy: { createdAt: 'desc' },
    take: 10000,
    select: { link: true, discoveredAt: true },
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${url.link.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}</loc>\n`;
    if (url.discoveredAt) {
      xml += `    <lastmod>${url.discoveredAt.toISOString()}</lastmod>\n`;
    }
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/:indexNowKey.txt', (req, res, next) => {
  const indexNowKey = process.env.INDEXNOW_KEY?.trim();

  if (!indexNowKey || req.params.indexNowKey !== indexNowKey) {
    next();
    return;
  }

  res.type('text/plain').send(indexNowKey);
});

app.get('/system', async (_req, res) => {
  const [queue, dbStatus, redisStatus] = await Promise.all([
    getQueueSnapshot(),
    prisma
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false),
    connection
      .ping()
      .then((value) => value === 'PONG')
      .catch(() => false),
  ]);

  const averageProcessingTime = 2.4;
  const apiStatus = dbStatus && redisStatus ? 'healthy' : 'degraded';

  res.json({
    queue,
    activeJobs: queue.active,
    workerConcurrency: Number(process.env.WORKER_CONCURRENCY ?? 5),
    enabledIndexingStrategies: getEnabledIndexingStrategies(),
    indexingReady: hasEnabledIndexingStrategies(),
    dryRunEnabled: isUsingDryRunStrategy(),
    dbConnected: dbStatus,
    redisConnected: redisStatus,
    averageProcessingTime,
    apiStatus,
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`IndexFlow backend running on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
});
