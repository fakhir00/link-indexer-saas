import { campaignRepository } from '../repositories';
import { HttpError, uniqueNormalizedUrls } from '../utils';
import { hasEnabledIndexingStrategies } from '../indexing-strategies';
import { getQueueForPriority } from '../queue/queues';
import { enqueueForValidation } from '../queue/producers/validation.producer';

function requireIndexingProvider() {
  if (!hasEnabledIndexingStrategies()) {
    throw new HttpError(
      503,
      'No live indexing provider configured. Add INDEXNOW_KEY and INDEXNOW_HOST, or configure PING_ENDPOINTS. Set INDEXING_DRY_RUN=true only for local testing.',
    );
  }
}

export const campaignService = {
  async list() {
    const campaigns = await campaignRepository.findAll();
    const campaignIds = campaigns.map((c) => c.id);
    const completedGroups = await campaignRepository.getCompletedUrlCounts(campaignIds);
    const completedMap = new Map(completedGroups.map((g) => [g.campaignId, g._count._all]));

    return campaigns.map((campaign) => {
      const totalUrls = campaign._count.urls;
      const completedUrls = completedMap.get(campaign.id) ?? 0;
      const progress = totalUrls > 0 ? Math.round((completedUrls / totalUrls) * 100) : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        dripPerDay: campaign.dripPerDay,
        priority: campaign.priority,
        tags: campaign.tags,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        totalUrls,
        completedUrls,
        progress,
      };
    });
  },

  async create(input: { name: string; urls: string[]; dripPerDay?: number; priority?: number; tags?: string[] }) {
    requireIndexingProvider();

    const urls = uniqueNormalizedUrls(input.urls);
    if (urls.length === 0) {
      throw new HttpError(400, 'No valid URLs provided');
    }

    const priority = Math.min(10, Math.max(1, input.priority ?? 5));

    const campaign = await campaignRepository.create({
      name: input.name,
      dripPerDay: input.dripPerDay ?? 30,
      priority,
      tags: input.tags ?? [],
      urls,
    });

    const dripPerDay = campaign.dripPerDay > 0 ? campaign.dripPerDay : 30;

    // Validate first → indexing follows automatically after validation passes
    await Promise.all(
      campaign.urls.map((url, index) => {
        const dayOffset = Math.floor(index / dripPerDay);
        const delayMs = dayOffset * 24 * 60 * 60 * 1000;

        // Note: validation queue doesn't support delay natively,
        // so first batch validates immediately, later batches go straight to indexing with delay
        if (delayMs === 0) {
          return enqueueForValidation({
            urlId: url.id,
            link: url.link,
            campaignId: campaign.id,
            userPriority: priority,
            enqueueForIndexingAfter: true,
          });
        }

        // Delayed URLs skip validation and go straight to indexing queue
        const queue = getQueueForPriority(priority);
        return queue.add(
          'index-url',
          { urlId: url.id, campaignId: campaign.id, link: url.link, strategy: 'auto', priority, attemptNumber: 0 },
          { priority, jobId: `url:${url.id}:attempt:0`, delay: delayMs },
        );
      }),
    );

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      priority: campaign.priority,
      tags: campaign.tags,
      totalUrls: campaign.urls.length,
      createdAt: campaign.createdAt,
    };
  },

  async updateStatus(id: string, status: string) {
    const updated = await campaignRepository.updateStatus(id, status);
    if (updated.count === 0) {
      throw new HttpError(404, 'Campaign not found');
    }
  },

  async delete(id: string) {
    const deleted = await campaignRepository.delete(id);
    if (deleted.count === 0) {
      throw new HttpError(404, 'Campaign not found');
    }
  },
};
