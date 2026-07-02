import { Request, Response } from 'express';
import { toolsService } from '../services';
import { parseOrThrow } from '../middleware';
import { toolsGoogleIndexSchema } from '../validators';

export const toolsController = {
  async googleIndex(req: Request, res: Response) {
    const { serviceAccountJson, urls } = parseOrThrow(toolsGoogleIndexSchema, req.body);
    const results = await toolsService.googleIndex(serviceAccountJson, urls);
    res.json({ success: true, results });
  },
};
