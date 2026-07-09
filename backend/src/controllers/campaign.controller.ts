import { Request, Response } from 'express';
import { campaignService } from '../services';
import { parseOrThrow } from '../middleware';
import { createCampaignSchema, statusUpdateSchema } from '../validators';

export const campaignController = {
  async list(_req: Request, res: Response) {
    const campaigns = await campaignService.list();
    res.json({ campaigns, total: campaigns.length });
  },

  async getById(req: Request, res: Response) {
    const campaign = await campaignService.getById(String(req.params.id));
    res.json(campaign);
  },

  async create(req: Request, res: Response) {
    const input = parseOrThrow(createCampaignSchema, req.body);
    const campaign = await campaignService.create(input);
    res.status(201).json({ success: true, campaign });
  },

  async updateStatus(req: Request, res: Response) {
    const { status } = parseOrThrow(statusUpdateSchema, req.body);
    await campaignService.updateStatus(String(req.params.id), status);
    res.json({ success: true });
  },

  async pause(req: Request, res: Response) {
    await campaignService.updateStatus(String(req.params.id), 'paused');
    res.json({ success: true });
  },

  async resume(req: Request, res: Response) {
    await campaignService.updateStatus(String(req.params.id), 'processing');
    res.json({ success: true });
  },

  async delete(req: Request, res: Response) {
    await campaignService.delete(String(req.params.id));
    res.json({ success: true });
  },
};
