import { urlRepository } from '../repositories';
import { campaignRepository } from '../repositories';
import { indexQueue } from '../queue';
import { HttpError } from '../utils';
import { hasEnabledIndexingStrategies } from '../indexing-strategies';
import type { UrlsQueryInput } from '../validators';

function requireIndexingProvider() {
  if (!hasEnabledIndexingStrategies()) {
    throw new HttpError(
      503,
      'No live indexing provider configured. Add INDEXNOW_KEY and INDEXNOW_HOST, or configure PING_ENDPOINTS. Set INDEXING_DRY_RUN=true only for local testing.',
    );
  }
}

export const urlService = {
  async list(params: UrlsQueryInput) {
    const [urls, total] = await urlRepository.findMany(params);
    return { urls, total, limit: params.limit, offset: params.offset };
  },

  async retry(id: string) {
    requireIndexingProvider();

    const url = await urlRepository.findById(id);
    if (!url) {
      throw new HttpError(404, 'URL not found');
    }
    if (url.status !== 'failed') {
      throw new HttpError(400, 'Only failed URLs can be retried');
    }

    await urlRepository.resetForRetry(url.id);
    await campaignRepository.updateStatus(url.campaignId, 'processing');
    await indexQueue.add(
      'index-url',
      { urlId: url.id, url: url.link },
      { jobId: url.id, attempts: 3, backoff: { type: 'exponential' as const, delay: 2000 } },
    );
  },

  async retryAllFailed() {
    requireIndexingProvider();

    const failedUrls = await urlRepository.findAllFailed();
    if (failedUrls.length === 0) {
      return 0;
    }

    const ids = failedUrls.map((u) => u.id);
    const campaignIds = Array.from(new Set(failedUrls.map((u) => u.campaignId)));

    await urlRepository.bulkResetForRetry(ids, campaignIds);
    await indexQueue.addBulk(
      failedUrls.map((url) => ({
        name: 'index-url',
        data: { urlId: url.id, url: url.link },
        opts: { jobId: url.id, attempts: 3, backoff: { type: 'exponential' as const, delay: 2000 } },
      })),
    );

    return failedUrls.length;
  },
};
