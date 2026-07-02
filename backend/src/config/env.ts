import dotenv from 'dotenv';

dotenv.config({ override: true });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

function optionalInt(key: string, fallback: number): number {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? fallback : parsed;
}

function optionalBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key]?.trim()?.toLowerCase();
  if (raw === undefined || raw === '') return fallback;
  return raw === 'true' || raw === '1';
}

function csv(key: string): string[] {
  return (process.env[key] ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = {
  // Server
  port: optionalInt('PORT', 4000),
  nodeEnv: optional('NODE_ENV', 'development'),
  corsOrigins: csv('CORS_ORIGINS').length > 0 ? csv('CORS_ORIGINS') : ['http://localhost:3000'],

  // Database
  databaseUrl: required('DATABASE_URL'),

  // Redis
  redisUrl: required('REDIS_URL'),

  // Auth
  jwtSecret: optional('JWT_SECRET', 'super_secret_indexflow_key_change_me_in_prod'),

  // Indexing
  indexingDryRun: optionalBool('INDEXING_DRY_RUN', true),
  indexingTimeoutMs: optionalInt('INDEXING_REQUEST_TIMEOUT_MS', 8000),
  pingEndpoints: csv('PING_ENDPOINTS'),
  indexNowKey: process.env.INDEXNOW_KEY?.trim() || '',
  indexNowHost: process.env.INDEXNOW_HOST?.trim() || '',
  indexNowEndpoint: optional('INDEXNOW_ENDPOINT', 'https://api.indexnow.org/indexnow'),
  indexNowKeyLocation: process.env.INDEXNOW_KEY_LOCATION?.trim() || '',

  // Worker
  workerConcurrency: optionalInt('WORKER_CONCURRENCY', 5),
  enableInlineWorker: optionalBool('ENABLE_INLINE_WORKER', false),
} as const;
