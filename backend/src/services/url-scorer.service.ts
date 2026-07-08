/**
 * URL Health Scoring Engine
 *
 * 5 scores, each 0-100:
 *  - Technical Score   — HTTP, response time, SSL, redirect chain
 *  - Content Score     — Content-Type, page size, meta integrity
 *  - Indexability Score — robots, noindex, canonical
 *  - Discovery Score   — submission history, time since first submission
 *  - Priority Score    — composite of above + user priority
 */

import type { ValidationResult } from './url-validator.service';

export interface UrlScores {
  technicalScore: number;
  contentScore: number;
  indexabilityScore: number;
  discoveryScore: number;
  priorityScore: number;   // 0-100 composite
  healthScore: number;     // overall health (avg of tech + content + indexability)
}

/** Returns 0-100 technical health score */
export function computeTechnicalScore(v: ValidationResult): number {
  if (!v.dnsResolved) return 0;

  let score = 100;

  // HTTP status
  if (!v.httpStatus) return 0;
  if (v.httpStatus >= 500) score -= 60;
  else if (v.httpStatus === 404) score -= 80;
  else if (v.httpStatus >= 400) score -= 50;
  else if (v.httpStatus >= 300) score -= 5; // redirect — minor

  // HTTPS
  if (!v.isHttps) score -= 15;
  if (v.sslValid === false) score -= 20;

  // Redirect chain
  if (v.redirectCount > 2) score -= 10;
  else if (v.redirectCount > 0) score -= 3;

  // Response time
  const rt = v.responseTimeMs ?? 0;
  if (rt > 5000) score -= 20;
  else if (rt > 3000) score -= 10;
  else if (rt > 1500) score -= 5;
  else if (rt < 500) score += 5; // fast bonus

  return Math.max(0, Math.min(100, score));
}

/** Returns 0-100 content score */
export function computeContentScore(v: ValidationResult): number {
  if (!v.dnsResolved || !v.httpStatus || v.httpStatus >= 400) return 0;

  let score = 100;

  // Content-Type
  const ct = v.contentType ?? '';
  if (!ct.includes('text/html')) score -= 30;

  // Content length (too small = thin content)
  if (v.contentLength !== undefined) {
    if (v.contentLength < 1000) score -= 20;     // < 1KB — probably empty
    else if (v.contentLength < 5000) score -= 10; // < 5KB — thin
  }

  return Math.max(0, Math.min(100, score));
}

/** Returns 0-100 indexability score */
export function computeIndexabilityScore(v: ValidationResult): number {
  if (!v.dnsResolved || !v.httpStatus || v.httpStatus >= 400) return 0;

  let score = 100;

  if (v.robotsTxtBlocked) score -= 50;
  if (v.metaRobotsNoindex) score -= 40;
  if (v.canonicalMismatch) score -= 20;

  return Math.max(0, Math.min(100, score));
}

/** Returns 0-100 discovery score based on submission history */
export function computeDiscoveryScore(opts: {
  submissionCount: number;
  daysSinceFirstSubmission?: number;
}): number {
  let score = 0;

  // More submission methods = higher discovery
  if (opts.submissionCount >= 3) score += 60;
  else if (opts.submissionCount === 2) score += 40;
  else if (opts.submissionCount === 1) score += 20;

  // Time bonus — fresh submissions score higher
  const days = opts.daysSinceFirstSubmission ?? 999;
  if (days <= 1) score += 40;
  else if (days <= 7) score += 30;
  else if (days <= 30) score += 20;
  else score += 10;

  return Math.max(0, Math.min(100, score));
}

/** Returns composite priority score (0-100) */
export function computePriorityScore(opts: {
  technicalScore: number;
  contentScore: number;
  indexabilityScore: number;
  discoveryScore: number;
  userPriority: number; // 1 (critical) – 10 (low)
}): number {
  const baseScore =
    opts.technicalScore * 0.3 +
    opts.contentScore * 0.2 +
    opts.indexabilityScore * 0.3 +
    opts.discoveryScore * 0.2;

  // Map user priority (1=critical → bonus, 10=low → penalty)
  const priorityBonus = ((10 - opts.userPriority) / 9) * 20;

  return Math.max(0, Math.min(100, Math.round(baseScore + priorityBonus)));
}

/** Run all scores from a validation result */
export function scoreUrl(
  validation: ValidationResult,
  opts: { submissionCount?: number; daysSinceFirstSubmission?: number; userPriority?: number } = {},
): UrlScores {
  const technicalScore = computeTechnicalScore(validation);
  const contentScore = computeContentScore(validation);
  const indexabilityScore = computeIndexabilityScore(validation);
  const discoveryScore = computeDiscoveryScore({
    submissionCount: opts.submissionCount ?? 0,
    daysSinceFirstSubmission: opts.daysSinceFirstSubmission,
  });
  const priorityScore = computePriorityScore({
    technicalScore,
    contentScore,
    indexabilityScore,
    discoveryScore,
    userPriority: opts.userPriority ?? 5,
  });
  const healthScore = Math.round((technicalScore + contentScore + indexabilityScore) / 3);

  return {
    technicalScore,
    contentScore,
    indexabilityScore,
    discoveryScore,
    priorityScore,
    healthScore,
  };
}
