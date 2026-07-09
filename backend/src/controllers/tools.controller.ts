import { Request, Response } from 'express';
import { indexVerificationService, sitemapIntelligenceService, toolsService } from '../services';
import { parseOrThrow } from '../middleware';
import { toolsGoogleIndexSchema, toolsSitemapAnalyzeSchema, toolsVerifyIndexSchema } from '../validators';

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

  async sitemapAnalyze(req: Request, res: Response) {
    const input = parseOrThrow(toolsSitemapAnalyzeSchema, req.body);
    const result = await sitemapIntelligenceService.analyze(input);
    res.json({ success: true, ...result });
  },
};
