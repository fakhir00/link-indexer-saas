import { Request, Response, NextFunction } from 'express';
import { sitemapService } from '../services';
import { env } from '../config/env';

export const publicController = {
  async sitemap(_req: Request, res: Response) {
    const xml = await sitemapService.generateSitemapXml();
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  },

  indexNowKey(req: Request, res: Response, next: NextFunction) {
    const indexNowKey = env.indexNowKey;
    if (!indexNowKey || req.params.indexNowKey !== indexNowKey) {
      next();
      return;
    }
    res.type('text/plain').send(indexNowKey);
  },

  async campaignSitemap(req: Request, res: Response) {
    const xml = await sitemapService.generateCampaignSitemapXml(String(req.params.campaignId));
    if (!xml) {
      res.status(404).send('Not Found');
      return;
    }
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  },
};
