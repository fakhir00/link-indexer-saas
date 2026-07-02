import { Request, Response } from 'express';
import { apiKeyService } from '../services';
import { parseOrThrow } from '../middleware';
import { createApiKeySchema } from '../validators';

export const apiKeyController = {
  async list(_req: Request, res: Response) {
    const keys = await apiKeyService.list();
    res.json(keys);
  },

  async create(req: Request, res: Response) {
    const { label } = parseOrThrow(createApiKeySchema, req.body);
    const result = await apiKeyService.create(label);
    res.status(201).json(result);
  },

  async revoke(req: Request, res: Response) {
    await apiKeyService.revoke(String(req.params.id));
    res.json({ success: true });
  },
};
