/**
 * Error classification and retry delay engine.
 * Maps error signals to deterministic retry strategies.
 */

export type ErrorClass =
  | 'rate_limit'      // 429 Too Many Requests
  | 'server_error'    // 5xx Server Error
  | 'not_found'       // 404 — permanent, never retry
  | 'dns_error'       // DNS resolution failed
  | 'network'         // Timeout, ECONNREFUSED, ECONNRESET
  | 'ssl'             // SSL/TLS errors
  | 'bad_request'     // 400/401/403 — permanent
  | 'unknown';        // Fallback

export interface RetryDecision {
  shouldRetry: boolean;
  errorClass: ErrorClass;
  delayMs: number;
  permanent: boolean; // if true, send to DLQ immediately
}

// Retry delay schedules (ms) indexed by attempt number (0-based)
const RETRY_DELAYS: Record<ErrorClass, number[]> = {
  rate_limit:   [5 * 60_000, 30 * 60_000, 2 * 3600_000, 12 * 3600_000, 24 * 3600_000],
  server_error: [1 * 60_000, 5 * 60_000, 30 * 60_000],
  not_found:    [],
  dns_error:    [5 * 60_000, 30 * 60_000, 2 * 3600_000],
  network:      [1 * 60_000, 5 * 60_000, 15 * 60_000, 1 * 3600_000],
  ssl:          [5 * 60_000],
  bad_request:  [],
  unknown:      [2 * 60_000, 10 * 60_000, 30 * 60_000],
};

const MAX_RETRIES: Record<ErrorClass, number> = {
  rate_limit:   5,
  server_error: 3,
  not_found:    0,
  dns_error:    3,
  network:      4,
  ssl:          1,
  bad_request:  0,
  unknown:      3,
};

export function classifyError(err: unknown): ErrorClass {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  const status = (err as any)?.status ?? (err as any)?.response?.status ?? (err as any)?.statusCode;

  if (status === 429) return 'rate_limit';
  if (status === 404) return 'not_found';
  if (status === 400 || status === 401 || status === 403) return 'bad_request';
  if (status && status >= 500 && status < 600) return 'server_error';

  if (msg.includes('enotfound') || msg.includes('getaddrinfo') || msg.includes('dns')) return 'dns_error';
  if (msg.includes('ssl') || msg.includes('tls') || msg.includes('cert')) return 'ssl';
  if (
    msg.includes('econnrefused') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('fetch failed')
  ) return 'network';

  return 'unknown';
}

export function makeRetryDecision(err: unknown, attemptNumber: number): RetryDecision {
  const errorClass = classifyError(err);
  const maxRetries = MAX_RETRIES[errorClass];
  const delays = RETRY_DELAYS[errorClass];

  if (maxRetries === 0 || attemptNumber >= maxRetries) {
    return {
      shouldRetry: false,
      errorClass,
      delayMs: 0,
      permanent: true,
    };
  }

  const delayMs = delays[Math.min(attemptNumber, delays.length - 1)] ?? delays[delays.length - 1] ?? 60_000;

  return {
    shouldRetry: true,
    errorClass,
    delayMs,
    permanent: false,
  };
}
