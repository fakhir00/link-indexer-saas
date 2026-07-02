import { campaignRepository } from '../repositories';
import { indexQueue } from '../queue';
import { HttpError, uniqueNormalizedUrls } from '../utils';
import { hasEnabledIndexingStrategies } from '../indexing-strategies';

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
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        totalUrls,
        completedUrls,
        progress,
      };
    });
  },

  async create(input: { name: string; urls: string[]; dripPerDay?: number }) {
    requireIndexingProvider();

    const urls = uniqueNormalizedUrls(input.urls);
    if (urls.length === 0) {
      throw new HttpError(400, 'No valid URLs provided');
    }

    const campaign = await campaignRepository.create({
      name: input.name,
      dripPerDay: input.dripPerDay ?? 30,
      urls,
    });

    await indexQueue.addBulk(
      campaign.urls.map((url) => ({
        name: 'index-url',
        data: { urlId: url.id, url: url.link },
        opts: {
          jobId: url.id,
          attempts: 3,
          backoff: { type: 'exponential' as const, delay: 2000 },
          removeOnComplete: true,
        },
      })),
    );

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
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
