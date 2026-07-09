import { campaignRepository } from '../repositories';
import { prisma } from '../prisma';
import { HttpError } from '../utils';
import { enqueueForValidation } from '../queue/producers/validation.producer';
import { uniqueNormalizedUrls } from '../utils';


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

  async getById(id: string) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new HttpError(404, 'Campaign not found');
    }
    
    const urls = await prisma.url.findMany({
      where: { campaignId: id },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    const completedUrls = urls.filter((u) => u.status === 'completed').length;
    const failedUrls = urls.filter((u) => u.status === 'failed').length;
    const totalUrls = urls.length;
    const progress = totalUrls > 0 ? Math.round((completedUrls / totalUrls) * 100) : 0;

    return {
      ...campaign,
      totalUrls,
      completedUrls,
      failedUrls,
      progress,
      urls,
    };
  },

  async create(input: { name: string; urls: string[]; dripPerDay?: number; priority?: number; tags?: string[] }) {
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

        return enqueueForValidation(
          {
            urlId: url.id,
            link: url.link,
            campaignId: campaign.id,
            userPriority: priority,
            enqueueForIndexingAfter: true,
          },
          delayMs > 0 ? { delayMs } : undefined,
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
