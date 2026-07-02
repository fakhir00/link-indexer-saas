import { z } from 'zod';

export const urlsQuerySchema = z.object({
  status: z.enum(['all', 'queued', 'processing', 'completed', 'failed']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  search: z.string().trim().max(250).optional(),
  campaignId: z.string().trim().uuid().optional(),
});

export type UrlsQueryInput = z.infer<typeof urlsQuerySchema>;
