import { z } from 'zod';

export const urlSchema = z
  .string()
  .trim()
  .url('Each URL must be a valid absolute URL')
  .refine((value) => /^https?:\/\//i.test(value), 'URL must start with http:// or https://')
  .max(2048, 'URL exceeds max length of 2048 characters');

export const createCampaignSchema = z.object({
  name: z.string().trim().min(2).max(120),
  dripPerDay: z.number().int().min(1).max(10000).optional(),
  urls: z.array(urlSchema).min(1).max(10000),
});

export const statusUpdateSchema = z.object({
  status: z.enum(['paused', 'processing']),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
