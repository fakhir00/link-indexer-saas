import { z } from 'zod';

export const createApiKeySchema = z.object({
  label: z.string().trim().min(1).max(80),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
