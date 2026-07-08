import { Router } from 'express';
import { healthController } from '../controllers';

import campaignRoutes from './campaign.routes';
import urlRoutes from './url.routes';
import apiKeyRoutes from './api-key.routes';
import billingRoutes from './billing.routes';
import analyticsRoutes from './analytics.routes';
import systemRoutes from './system.routes';
import toolsRoutes from './tools.routes';
import publicRoutes from './public.routes';

import directoryRoutes from './directory.routes';
import rssRoutes from './rss.routes';

const router = Router();

// Health check (top-level)
router.get('/health', healthController.check);

// Domain routes
router.use('/campaigns', campaignRoutes);
router.use('/urls', urlRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/billing', billingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/system', systemRoutes);
router.use('/tools', toolsRoutes);

// Public routes (directory, rss, sitemap, indexnow key)
router.use('/directory', directoryRoutes);
router.use('/rss', rssRoutes);
router.use('/', publicRoutes);

export default router;
