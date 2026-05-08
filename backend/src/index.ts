import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { indexQueue } from './queue';
import { generateToken, requireAuth, AuthRequest } from './auth';
import './worker'; // Start the worker

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large URL payloads

// --- PUBLIC ROUTES ---

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth: Register
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, credits: 500 }
    });

    const token = generateToken(user);
    res.json({ user: { id: user.id, email: user.email, name: user.name, credits: user.credits }, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ user: { id: user.id, email: user.email, name: user.name, credits: user.credits }, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROTECTED ROUTES ---

// Get current user info
app.get('/auth/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, credits: user.credits });
});

// Analytics Dashboard
app.get('/analytics', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  
  const campaigns = await prisma.campaign.findMany({ where: { userId } });
  const totalUrls = await prisma.url.count({ where: { campaign: { userId } } });
  const successUrls = await prisma.url.count({ where: { campaign: { userId }, status: 'completed' } });
  const failedUrls = await prisma.url.count({ where: { campaign: { userId }, status: 'failed' } });

  res.json({
    totalCampaigns: campaigns.length,
    totalUrls,
    successUrls,
    failedUrls,
    successRate: totalUrls > 0 ? ((successUrls / totalUrls) * 100).toFixed(1) : 0,
    recentCampaigns: campaigns.slice(0, 5) // Last 5
  });
});

// Get all campaigns
app.get('/campaigns', requireAuth, async (req: AuthRequest, res) => {
  const campaigns = await prisma.campaign.findMany({
    where: { userId: req.user!.id },
    include: {
      _count: { select: { urls: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate progress for each
  const result = await Promise.all(campaigns.map(async (c) => {
    const completed = await prisma.url.count({ where: { campaignId: c.id, status: 'completed' } });
    return {
      ...c,
      totalUrls: c._count.urls,
      completedUrls: completed,
      progress: c._count.urls > 0 ? Math.round((completed / c._count.urls) * 100) : 0
    };
  }));

  res.json(result);
});

// Create campaign & upload URLs
app.post('/campaigns', requireAuth, async (req: AuthRequest, res) => {
  const { name, urls } = req.body; // urls: string[]
  const userId = req.user!.id;

  if (!urls || urls.length === 0) return res.status(400).json({ error: 'No URLs provided' });

  try {
    // Check credits
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < urls.length) {
      return res.status(402).json({ error: 'Insufficient credits' });
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: urls.length } }
    });

    // Create Campaign & URLs
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name,
        status: 'processing',
        urls: {
          create: urls.map((link: string) => ({ link }))
        }
      },
      include: { urls: true }
    });

    // Send to Queue
    const jobs = campaign.urls.map(u => ({
      name: 'index-url',
      data: { urlId: u.id, url: u.link },
      opts: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    }));
    await indexQueue.addBulk(jobs);

    res.json({ success: true, campaign });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all URLs (with pagination & filter)
app.get('/urls', requireAuth, async (req: AuthRequest, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  const whereClause: any = { campaign: { userId: req.user!.id } };
  
  if (status && status !== 'all') whereClause.status = status;

  const urls = await prisma.url.findMany({
    where: whereClause,
    take: Number(limit),
    skip: Number(offset),
    orderBy: { createdAt: 'desc' },
    include: { campaign: { select: { name: true } } }
  });

  const total = await prisma.url.count({ where: whereClause });

  res.json({ urls, total });
});

// Pause / Resume campaign
app.patch('/campaigns/:id/status', requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.body; // 'paused' or 'processing'
  const campaign = await prisma.campaign.updateMany({
    where: { id: req.params.id, userId: req.user!.id },
    data: { status }
  });
  res.json({ success: true, count: campaign.count });
});

// Delete campaign
app.delete('/campaigns/:id', requireAuth, async (req: AuthRequest, res) => {
  await prisma.campaign.deleteMany({
    where: { id: req.params.id, userId: req.user!.id }
  });
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`🚀 IndexFlow Backend API running on http://localhost:${port}`);
});
