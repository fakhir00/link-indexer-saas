import { Request, Response } from 'express';
import { analyticsService } from '../services';

export const analyticsController = {
  async getDashboard(_req: Request, res: Response) {
    const data = await analyticsService.getDashboard();
    res.json(data);
  },
};
