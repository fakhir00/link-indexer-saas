import { campaignRepository } from '../repositories';
import { urlRepository } from '../repositories';

export const analyticsService = {
  async getDashboard() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);

    const [totalCampaigns, totalUrls, successUrls, failedUrls, recentCampaigns, recentUrls] = await Promise.all([
      campaignRepository.count(),
      urlRepository.count(),
      urlRepository.count({ status: 'completed' }),
      urlRepository.count({ status: 'failed' }),
      campaignRepository.findRecent(5),
      urlRepository.findRecentByDateRange(start),
    ]);

    const trendMap = new Map<string, { submitted: number; crawled: number; failed: number }>();
    for (let i = 0; i < 14; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      trendMap.set(key, { submitted: 0, crawled: 0, failed: 0 });
    }

    for (const item of recentUrls) {
      const key = item.createdAt.toISOString().slice(0, 10);
      const target = trendMap.get(key);
      if (!target) continue;
      target.submitted += 1;
      if (item.status === 'completed') target.crawled += 1;
      if (item.status === 'failed') target.failed += 1;
    }

    const trends = Array.from(trendMap.entries()).map(([key, value]) => {
      const d = new Date(`${key}T00:00:00Z`);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submitted: value.submitted,
        crawled: value.crawled,
        failed: value.failed,
      };
    });

    const successRate = totalUrls > 0 ? Number(((successUrls / totalUrls) * 100).toFixed(1)) : 0;

    return {
      totalCampaigns,
      totalUrls,
      successUrls,
      failedUrls,
      successRate,
      trends,
      recentCampaigns: recentCampaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.createdAt,
        totalUrls: campaign._count.urls,
      })),
    };
  },
};
