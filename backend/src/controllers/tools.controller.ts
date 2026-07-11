import { Request, Response } from 'express';
import { indexVerificationService, toolsService } from '../services';
import { parseOrThrow } from '../middleware';
import { toolsGoogleIndexSchema, toolsVerifyIndexSchema } from '../validators';

export const toolsController = {
  async googleIndex(req: Request, res: Response) {
    const { serviceAccountJson, urls } = parseOrThrow(toolsGoogleIndexSchema, req.body);
    const results = await toolsService.googleIndex(serviceAccountJson, urls);
    res.json({ success: true, results });
  },

  async verifyIndex(req: Request, res: Response) {
    const { urls, provider } = parseOrThrow(toolsVerifyIndexSchema, req.body);
    const result = await indexVerificationService.verify(urls, provider);
    res.json({ success: true, ...result });
  },
};
