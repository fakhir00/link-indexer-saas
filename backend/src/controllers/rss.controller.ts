import { Request, Response } from 'express';
import { rssService } from '../services/rss.service';

function sendRss(res: Response, xml: string | null) {
  if (!xml) {
    res.status(404).send('Not Found');
    return;
  }
  res.header('Content-Type', 'application/rss+xml');
  res.send(xml);
}

export const rssController = {
  async getCampaignFeed(req: Request, res: Response) {
    const xml = await rssService.getCampaignFeed(String(req.params.id));
    sendRss(res, xml);
  },

  async getDailyFeed(_req: Request, res: Response) {
    const xml = await rssService.getDailyFeed();
    sendRss(res, xml);
  },

  async getWeeklyFeed(_req: Request, res: Response) {
    const xml = await rssService.getWeeklyFeed();
    sendRss(res, xml);
  },

  async getMonthlyFeed(_req: Request, res: Response) {
    const xml = await rssService.getMonthlyFeed();
    sendRss(res, xml);
  },

  async getNewestFeed(_req: Request, res: Response) {
    const xml = await rssService.getNewestFeed();
    sendRss(res, xml);
  },
};
