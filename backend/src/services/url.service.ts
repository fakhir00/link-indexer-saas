import { urlRepository, campaignRepository } from '../repositories';
import { HttpError } from '../utils';
import { adapterRegistry } from '../adapters/adapter.registry';
import type { UrlsQueryInput } from '../validators';
import { enqueueForValidation } from '../queue/producers/validation.producer';

function requireIndexingProvider() {
  if (!adapterRegistry.hasEnabledAdapters()) {
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

  async getDetails(id: string) {
    const url = await urlRepository.findByIdWithValidation(id);
    if (!url) {
      throw new HttpError(404, 'URL not found');
    }
    return url;
  },

  async retry(id: string) {
    requireIndexingProvider();

    const url = await urlRepository.findByIdWithCampaign(id);
    if (!url) {
      throw new HttpError(404, 'URL not found');
    }
    if (url.status !== 'failed') {
      throw new HttpError(400, 'Only failed URLs can be retried');
    }

    await urlRepository.resetForRetry(url.id);
    await campaignRepository.updateStatus(url.campaignId, 'processing');
    
    // Send to validation queue which then automatically queues for indexing
    await enqueueForValidation({
      urlId: url.id,
      link: url.link,
      campaignId: url.campaignId,
      userPriority: 2, // high priority for manual retries
      enqueueForIndexingAfter: true,
    });
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
    
    await Promise.all(
      failedUrls.map((url) => 
        enqueueForValidation({
          urlId: url.id,
          link: url.link,
          campaignId: url.campaignId,
          userPriority: 5, // normal priority for bulk retries
          enqueueForIndexingAfter: true,
        })
      )
    );

    return failedUrls.length;
  },

  async retryAllStuck() {
    const stuckUrls = await urlRepository.findAllStuck();
    if (stuckUrls.length === 0) {
      return 0;
    }

    const ids = stuckUrls.map((u) => u.id);
    const campaignIds = Array.from(new Set(stuckUrls.map((u) => u.campaignId)));

    await urlRepository.bulkResetForRetry(ids, campaignIds);

    await Promise.all(
      stuckUrls.map((url) =>
        enqueueForValidation({
          urlId: url.id,
          link: url.link,
          campaignId: url.campaignId,
          userPriority: url.priority ?? 5,
          enqueueForIndexingAfter: true,
        })
      )
    );

    return stuckUrls.length;
  },
};
