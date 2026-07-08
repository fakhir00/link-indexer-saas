import { Router } from 'express';
import { rssController } from '../controllers/rss.controller';

const router = Router();

router.get('/campaign/:id', rssController.getCampaignFeed);
router.get('/daily', rssController.getDailyFeed);
router.get('/weekly', rssController.getWeeklyFeed);
router.get('/monthly', rssController.getMonthlyFeed);
router.get('/newest', rssController.getNewestFeed);

export default router;
