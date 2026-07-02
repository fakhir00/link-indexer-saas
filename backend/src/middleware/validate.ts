import { z } from 'zod';
import { HttpError } from '../utils/http-error';

export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }
  throw new HttpError(400, 'Validation failed', parsed.error.flatten());
}
