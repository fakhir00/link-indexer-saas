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

export type ToolsGoogleIndexInput = z.infer<typeof toolsGoogleIndexSchema>;
export type ToolsVerifyIndexInput = z.infer<typeof toolsVerifyIndexSchema>;
