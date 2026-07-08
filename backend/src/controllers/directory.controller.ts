import { Request, Response } from 'express';
import { directoryService } from '../services/directory.service';

export const directoryController = {
  async getPaginated(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const data = await directoryService.getPaginated(page, limit);
    res.json(data);
  },

  async getRecent(_req: Request, res: Response) {
    const data = await directoryService.getRecent();
    res.json(data);
  },

  async getPopular(_req: Request, res: Response) {
    const data = await directoryService.getPopular();
    res.json(data);
  },

  async getDaily(req: Request, res: Response) {
    // Expected format: YYYY-MM-DD
    const dateStr = String(req.params.date);
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const data = await directoryService.getArchiveByDate(start, end);
    res.json(data);
  },

  async getWeekly(req: Request, res: Response) {
    // Expected format: YYYY-Www
    const weekStr = String(req.params.week);
    const year = parseInt(weekStr.substring(0, 4));
    const week = parseInt(weekStr.substring(6));
    
    // Simple approximation for demo purposes
    const start = new Date(year, 0, 1 + (week - 1) * 7);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const data = await directoryService.getArchiveByDate(start, end);
    res.json(data);
  },

  async getMonthly(req: Request, res: Response) {
    // Expected format: YYYY-MM
    const monthStr = String(req.params.month);
    const year = parseInt(monthStr.substring(0, 4));
    const month = parseInt(monthStr.substring(5)) - 1; // 0-indexed
    
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    
    const data = await directoryService.getArchiveByDate(start, end);
    res.json(data);
  },

  async getByCategory(req: Request, res: Response) {
    const slug = String(req.params.slug);
    const data = await directoryService.getByCategory(slug);
    res.json(data);
  },
};
