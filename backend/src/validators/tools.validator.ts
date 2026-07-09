import { z } from 'zod';
import { urlSchema } from './campaign.validator';

export const toolsGoogleIndexSchema = z.object({
  serviceAccountJson: z.string().min(1, 'Service Account JSON is required'),
  urls: z.array(urlSchema).min(1, 'At least one URL is required').max(100),
});

export const toolsVerifyIndexSchema = z.object({
  urls: z.array(urlSchema).min(1, 'At least one URL is required').max(50),
  provider: z.enum(['auto', 'dataforseo', 'google-cse', 'dry-run']).optional().default('auto'),
});

const domainOrUrlSchema = z
  .string()
  .trim()
  .min(3, 'Domain is required')
  .max(2048, 'Domain is too long')
  .refine((value) => {
    try {
      const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Enter a valid domain or URL');

export const toolsSitemapAnalyzeSchema = z.object({
  ownDomain: domainOrUrlSchema,
  competitorDomains: z.array(domainOrUrlSchema).max(5, 'Add up to 5 competitors').optional().default([]),
  maxUrls: z.number().int().min(10).max(1000).optional().default(300),
  contentOnly: z.boolean().optional().default(false),
});

export type ToolsGoogleIndexInput = z.infer<typeof toolsGoogleIndexSchema>;
export type ToolsVerifyIndexInput = z.infer<typeof toolsVerifyIndexSchema>;
export type ToolsSitemapAnalyzeInput = z.infer<typeof toolsSitemapAnalyzeSchema>;
