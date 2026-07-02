import crypto from 'crypto';

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function generateApiKey(): string {
  return `nx_live_sk_${crypto.randomBytes(24).toString('hex')}`;
}
