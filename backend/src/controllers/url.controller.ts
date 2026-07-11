import { Request, Response } from 'express';
import { urlService } from '../services';
import { parseOrThrow } from '../middleware';
import { urlsQuerySchema } from '../validators';

export const urlController = {
  async list(req: Request, res: Response) {
    const params = parseOrThrow(urlsQuerySchema, req.query);
    const result = await urlService.list(params);
    res.json(result);
  },

  async getDetails(req: Request, res: Response) {
    const result = await urlService.getDetails(String(req.params.id));
    res.json(result);
  },

  async retry(req: Request, res: Response) {
    await urlService.retry(String(req.params.id));
    res.json({ success: true });
  },

  async retryAllFailed(_req: Request, res: Response) {
    const retried = await urlService.retryAllFailed();
    res.json({ success: true, retried });
  },
};
