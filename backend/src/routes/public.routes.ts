import { Router } from 'express';
import { publicController } from '../controllers';

const router = Router();

router.get('/sitemap.xml', publicController.sitemap);
router.get('/sitemap/:campaignId.xml', publicController.campaignSitemap);
router.get('/:indexNowKey.txt', publicController.indexNowKey);

export default router;
