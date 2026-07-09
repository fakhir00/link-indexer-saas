import { Router } from 'express';
import { toolsController } from '../controllers';

const router = Router();

router.post('/google-index', toolsController.googleIndex);
router.post('/verify-index', toolsController.verifyIndex);
router.post('/sitemap/analyze', toolsController.sitemapAnalyze);

export default router;
