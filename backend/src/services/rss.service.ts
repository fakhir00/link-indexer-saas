import { prisma } from '../prisma';

function generateRssXml(title: string, description: string, urlPath: string, items: { title: string; link: string; date: Date }[]) {
  const baseUrl = process.env.BASE_URL || 'https://indexflow.com';
  
  const itemsXml = items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid>${item.link}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${baseUrl}${urlPath}</link>
    <description>${description}</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}${urlPath}" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;
}

export const rssService = {
  async getCampaignFeed(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        urls: {
          where: { status: 'completed' },
          orderBy: { discoveredAt: 'desc' },
          take: 50,
        }
      }
    });

    if (!campaign) {
      return null;
    }

    const items = campaign.urls.map(url => ({
      title: `Indexed: ${url.link}`,
      link: url.link,
      date: url.discoveredAt || url.createdAt,
    }));

    return generateRssXml(
      `Campaign Feed: ${campaign.name}`,
      `Recently indexed URLs for campaign ${campaign.name}`,
      `/rss/campaign/${campaignId}`,
      items
    );
  },

  async getDailyFeed() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const urls = await prisma.url.findMany({
      where: {
        status: 'completed',
        discoveredAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { discoveredAt: 'desc' },
      take: 100,
    });

    const items = urls.map(url => ({
      title: `Indexed: ${url.link}`,
      link: url.link,
      date: url.discoveredAt || url.createdAt,
    }));

    return generateRssXml(
      'Daily Indexed URLs',
      'URLs indexed in the last 24 hours',
      '/rss/daily',
      items
    );
  },

  async getWeeklyFeed() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const urls = await prisma.url.findMany({
      where: {
        status: 'completed',
        discoveredAt: { gte: sevenDaysAgo },
      },
      orderBy: { discoveredAt: 'desc' },
      take: 100,
    });

    const items = urls.map(url => ({
      title: `Indexed: ${url.link}`,
      link: url.link,
      date: url.discoveredAt || url.createdAt,
    }));

    return generateRssXml(
      'Weekly Indexed URLs',
      'URLs indexed in the last 7 days',
      '/rss/weekly',
      items
    );
  },

  async getMonthlyFeed() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const urls = await prisma.url.findMany({
      where: {
        status: 'completed',
        discoveredAt: { gte: thirtyDaysAgo },
      },
      orderBy: { discoveredAt: 'desc' },
      take: 100,
    });

    const items = urls.map(url => ({
      title: `Indexed: ${url.link}`,
      link: url.link,
      date: url.discoveredAt || url.createdAt,
    }));

    return generateRssXml(
      'Monthly Indexed URLs',
      'URLs indexed in the last 30 days',
      '/rss/monthly',
      items
    );
  },

  async getNewestFeed() {
    const urls = await prisma.url.findMany({
      where: { status: 'completed' },
      orderBy: { discoveredAt: 'desc' },
      take: 50,
    });

    const items = urls.map(url => ({
      title: `Indexed: ${url.link}`,
      link: url.link,
      date: url.discoveredAt || url.createdAt,
    }));

    return generateRssXml(
      'Newest Indexed URLs',
      'The 50 most recently indexed URLs',
      '/rss/newest',
      items
    );
  },
};
