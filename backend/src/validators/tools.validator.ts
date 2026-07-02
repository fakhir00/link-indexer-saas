import { z } from 'zod';
import { urlSchema } from './campaign.validator';

export const toolsGoogleIndexSchema = z.object({
  serviceAccountJson: z.string().min(1, 'Service Account JSON is required'),
  urls: z.array(urlSchema).min(1, 'At least one URL is required').max(100),
});

export type ToolsGoogleIndexInput = z.infer<typeof toolsGoogleIndexSchema>;
