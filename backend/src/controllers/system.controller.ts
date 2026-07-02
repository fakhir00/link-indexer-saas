import { Request, Response } from 'express';
import { systemService } from '../services';

export const systemController = {
  async getDetails(_req: Request, res: Response) {
    const details = await systemService.getSystemDetails();
    res.json(details);
  },
};
