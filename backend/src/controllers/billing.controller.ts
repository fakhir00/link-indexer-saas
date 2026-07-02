import { Request, Response } from 'express';
import { billingService } from '../services';

export const billingController = {
  getPlans(_req: Request, res: Response) {
    res.json(billingService.getPlans());
  },

  async getOverview(_req: Request, res: Response) {
    const overview = await billingService.getOverview();
    res.json(overview);
  },
};
