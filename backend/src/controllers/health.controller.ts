import { Request, Response } from 'express';
import { systemService } from '../services';

export const healthController = {
  async check(_req: Request, res: Response) {
    const health = await systemService.getHealth();
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  },
};
