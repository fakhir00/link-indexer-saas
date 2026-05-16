import express, { NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { indexQueue, getQueueSnapshot, connection } from './queue';
import { generateToken, requireAdmin, requireAuth, AuthRequest } from './auth';

dotenv.config();

if (process.env.ENABLE_INLINE_WORKER === 'true') {
  void import('./worker');
}

const app = express();
const port = Number(process.env.PORT ?? 4000);
const prisma = new PrismaClient();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);
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

const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().trim().min(2).max(80),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const createCampaignSchema = z.object({
  name: z.string().trim().min(2).max(120),
  dripPerDay: z.number().int().min(1).max(10000).optional(),
  urls: z.array(urlSchema).min(1).max(10000),
});

const statusUpdateSchema = z.object({
  status: z.enum(['paused', 'processing']),
});

const urlsQuerySchema = z.object({
  status: z.enum(['all', 'queued', 'processing', 'completed', 'failed']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  search: z.string().trim().max(250).optional(),
  campaignId: z.string().trim().uuid().optional(),
});

const createApiKeySchema = z.object({
  label: z.string().trim().min(2).max(60),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
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

function hashApiKey(apiKey: string) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

function generateApiKey() {
  return `if_live_sk_${crypto.randomBytes(24).toString('base64url')}`;
}

function maskFromId(id: string) {
  return `if_live_sk_••••••••${id.slice(-6)}`;
}

function firstName(name: string) {
  return name.trim().split(' ')[0] || name;
}

function uniqueNormalizedUrls(urls: string[]) {
  const clean = urls.map((url) => url.trim());
  return Array.from(new Set(clean));
}

function getMonthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

const planCatalog = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    monthlyCredits: 500,
    features: ['500 URL credits/mo', '3 active campaigns', 'Basic analytics'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    monthlyCredits: 2000,
    features: ['2,000 URL credits/mo', 'Unlimited campaigns', 'API access'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 199,
    monthlyCredits: 10000,
    features: ['10,000 URL credits/mo', 'Team workflows', 'Priority support'],
  },
] as const;

function inferPlan(credits: number) {
  if (credits >= 10000) return 'agency';
  if (credits >= 2000) return 'pro';
  return 'starter';
}

app.get('/health', async (_req, res) => {
  let dbConnected = false;
  let redisConnected = false;
  let queue = {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    paused: 0,
    total: 0,
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

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = parseOrThrow(registerSchema, req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      credits: 500,
      role: 'user',
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      credits: user.credits,
    },
  });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = parseOrThrow(loginSchema, req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      credits: user.credits,
    },
  });
});

app.get('/auth/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const month = getMonthBounds();
  const urlsThisMonth = await prisma.url.count({
    where: {
      campaign: { userId: user.id },
      createdAt: { gte: month.start, lt: month.end },
    },
  });

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: firstName(user.name),
    role: user.role,
    credits: user.credits,
    plan: inferPlan(user.credits),
    urlsThisMonth,
  });
});

app.patch('/auth/me', requireAuth, async (req: AuthRequest, res) => {
  const payload = parseOrThrow(updateProfileSchema, req.body);

  if (!payload.name && !payload.email) {
    throw new HttpError(400, 'No changes provided');
  }

  if (payload.email) {
    const existing = await prisma.user.findFirst({
      where: {
        email: payload.email,
        id: { not: req.user!.id },
      },
    });

    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: payload,
  });

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    credits: user.credits,
  });
});

app.post('/auth/change-password', requireAuth, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = parseOrThrow(changePasswordSchema, req.body);

  if (currentPassword === newPassword) {
    throw new HttpError(400, 'New password must be different from current password');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Current password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  res.json({ success: true });
});

app.get('/analytics', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 13);
  start.setHours(0, 0, 0, 0);

  const [totalCampaigns, totalUrls, successUrls, failedUrls, recentCampaigns, recentUrls] = await Promise.all([
    prisma.campaign.count({ where: { userId } }),
    prisma.url.count({ where: { campaign: { userId } } }),
    prisma.url.count({ where: { campaign: { userId }, status: 'completed' } }),
    prisma.url.count({ where: { campaign: { userId }, status: 'failed' } }),
    prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { urls: true } },
      },
    }),
    prisma.url.findMany({
      where: {
        campaign: { userId },
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

app.get('/campaigns', requireAuth, async (req: AuthRequest, res) => {
  const campaigns = await prisma.campaign.findMany({
    where: { userId: req.user!.id },
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
      userId: campaign.userId,
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

app.post('/campaigns', requireAuth, async (req: AuthRequest, res) => {
  const input = parseOrThrow(createCampaignSchema, req.body);
  const urls = uniqueNormalizedUrls(input.urls);

  if (urls.length === 0) {
    throw new HttpError(400, 'No valid URLs provided');
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: req.user!.id } });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    if (!user.isActive) {
      throw new HttpError(403, 'Account is disabled');
    }

    if (user.credits < urls.length) {
      throw new HttpError(402, `Insufficient credits. Required ${urls.length}, available ${user.credits}`);
    }

    await tx.user.update({
      where: { id: user.id },
      data: { credits: { decrement: urls.length } },
    });

    const campaign = await tx.campaign.create({
      data: {
        userId: user.id,
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

    return { campaign, deductedCredits: urls.length };
  });

  await indexQueue.addBulk(
    result.campaign.urls.map((url) => ({
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
      id: result.campaign.id,
      name: result.campaign.name,
      status: result.campaign.status,
      totalUrls: result.campaign.urls.length,
      createdAt: result.campaign.createdAt,
    },
    deductedCredits: result.deductedCredits,
  });
});

app.patch('/campaigns/:id/status', requireAuth, async (req: AuthRequest, res) => {
  const { status } = parseOrThrow(statusUpdateSchema, req.body);
  const campaignId = String(req.params.id);

  const updated = await prisma.campaign.updateMany({
    where: {
      id: campaignId,
      userId: req.user!.id,
    },
    data: { status },
  });

  if (updated.count === 0) {
    throw new HttpError(404, 'Campaign not found');
  }

  res.json({ success: true });
});

app.delete('/campaigns/:id', requireAuth, async (req: AuthRequest, res) => {
  const campaignId = String(req.params.id);
  const deleted = await prisma.campaign.deleteMany({
    where: {
      id: campaignId,
      userId: req.user!.id,
    },
  });

  if (deleted.count === 0) {
    throw new HttpError(404, 'Campaign not found');
  }

  res.json({ success: true });
});

app.get('/urls', requireAuth, async (req: AuthRequest, res) => {
  const { status, limit, offset, search, campaignId } = parseOrThrow(urlsQuerySchema, req.query);

  const whereClause = {
    campaign: {
      userId: req.user!.id,
    },
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

app.post('/urls/:id/retry', requireAuth, async (req: AuthRequest, res) => {
  const urlId = String(req.params.id);
  const url = await prisma.url.findFirst({
    where: {
      id: urlId,
      campaign: { userId: req.user!.id },
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

app.post('/urls/retry-failed', requireAuth, async (req: AuthRequest, res) => {
  const failedUrls = await prisma.url.findMany({
    where: {
      campaign: { userId: req.user!.id },
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

app.get('/api-keys', requireAuth, async (req: AuthRequest, res) => {
  const keys = await prisma.apiKey.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    keys.map((key) => ({
      id: key.id,
      label: key.label ?? 'API Key',
      keyPreview: maskFromId(key.id),
      requestCount: key.requestCount,
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
    })),
  );
});

app.post('/api-keys', requireAuth, async (req: AuthRequest, res) => {
  const { label } = parseOrThrow(createApiKeySchema, req.body);
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);

  const existing = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (existing) {
    throw new HttpError(500, 'Please retry key generation');
  }

  const key = await prisma.apiKey.create({
    data: {
      userId: req.user!.id,
      label,
      keyHash,
      isActive: true,
    },
  });

  res.status(201).json({
    id: key.id,
    label: key.label,
    key: rawKey,
    keyPreview: maskFromId(key.id),
    createdAt: key.createdAt,
  });
});

app.delete('/api-keys/:id', requireAuth, async (req: AuthRequest, res) => {
  const keyId = String(req.params.id);
  const updated = await prisma.apiKey.updateMany({
    where: {
      id: keyId,
      userId: req.user!.id,
      isActive: true,
    },
    data: { isActive: false },
  });

  if (updated.count === 0) {
    throw new HttpError(404, 'API key not found');
  }

  res.json({ success: true });
});

app.get('/billing/plans', requireAuth, (_req: AuthRequest, res) => {
  res.json(planCatalog);
});

app.get('/billing/overview', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const month = getMonthBounds();
  const usedThisMonth = await prisma.url.count({
    where: {
      campaign: { userId: user.id },
      createdAt: { gte: month.start, lt: month.end },
    },
  });

  const currentPlanId = inferPlan(user.credits);
  const currentPlan = planCatalog.find((plan) => plan.id === currentPlanId)!;

  res.json({
    currentPlan,
    credits: {
      currentBalance: user.credits,
      usedThisMonth,
      monthlyAllowance: currentPlan.monthlyCredits,
      cycleStart: month.start.toISOString(),
      cycleEnd: month.end.toISOString(),
    },
    payments: [],
  });
});

app.post('/billing/checkout', requireAuth, async (_req: AuthRequest, res) => {
  res.status(501).json({
    error: 'Stripe checkout is not configured yet. Set STRIPE_SECRET_KEY and implement product prices to enable checkout.',
  });
});

app.get('/admin/users', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      _count: { select: { campaigns: true } },
    },
  });

  const userIds = users.map((user) => user.id);
  const urlCounts = userIds.length
    ? await prisma.url.groupBy({
        by: ['campaignId'],
        where: {
          campaign: {
            userId: { in: userIds },
          },
        },
        _count: { _all: true },
      })
    : [];

  const campaignCounts = await prisma.campaign.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, userId: true },
  });

  const campaignToUser = new Map(campaignCounts.map((campaign) => [campaign.id, campaign.userId]));
  const urlCountByUser = new Map<string, number>();

  for (const row of urlCounts) {
    const ownerId = campaignToUser.get(row.campaignId);
    if (!ownerId) continue;
    urlCountByUser.set(ownerId, (urlCountByUser.get(ownerId) ?? 0) + row._count._all);
  }

  res.json(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      credits: user.credits,
      campaigns: user._count.campaigns,
      totalUrls: urlCountByUser.get(user.id) ?? 0,
      createdAt: user.createdAt,
    })),
  );
});

app.patch('/admin/users/:id/active', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const payload = z.object({ isActive: z.boolean() }).safeParse(req.body);
  if (!payload.success) {
    throw new HttpError(400, 'Validation failed', payload.error.flatten());
  }

  const targetUserId = String(req.params.id);
  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: payload.data.isActive },
  });

  res.json({
    id: user.id,
    isActive: user.isActive,
  });
});

app.get('/admin/system', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
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
    workersActive: queue.active,
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
