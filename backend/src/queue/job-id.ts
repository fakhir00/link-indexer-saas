import crypto from 'crypto';

const MAX_JOB_ID_STEM_LENGTH = 120;

export function createQueueJobId(parts: Array<string | number | null | undefined>): string {
  const raw = parts
    .filter((part): part is string | number => part !== null && part !== undefined && String(part).length > 0)
    .map(String)
    .join('-');

  const stem =
    raw
      .replace(/:/g, '-')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, MAX_JOB_ID_STEM_LENGTH) || 'job';

  const digest = crypto.createHash('sha1').update(raw).digest('hex').slice(0, 12);

  return `${stem}-${digest}`;
}
