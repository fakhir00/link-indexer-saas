import { prisma } from '../prisma';

export const campaignRepository = {
  findAll() {
    return prisma.campaign.findMany({
      include: { _count: { select: { urls: true } } },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  },

  findById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: { _count: { select: { urls: true } } },
    });
  },

  create(data: { name: string; dripPerDay: number; priority?: number; tags?: string[]; urls: string[] }) {
    const urlCount = data.urls.length;
    return prisma.campaign.create({
      data: {
        name: data.name,
        status: 'processing',
        dripPerDay: data.dripPerDay,
        priority: data.priority ?? 5,
        tags: data.tags ?? [],
        totalUrls: urlCount,
        submittedUrls: 0,
        completedUrls: 0,
        failedUrls: 0,
        urls: {
          create: data.urls.map((link, index) => {
            const dayOffset = Math.floor(index / data.dripPerDay);
            const delayMs = dayOffset * 24 * 60 * 60 * 1000;
            return {
              link,
              status: 'queued',
              priority: data.priority ?? 5,
              scheduledAt: new Date(Date.now() + delayMs),
            };
          }),
        },
      },
      include: { urls: true },
    });
  },

  updateStatus(id: string, status: string) {
    return prisma.campaign.updateMany({
      where: { id },
      data: { status },
    });
  },

  delete(id: string) {
    return prisma.campaign.deleteMany({
      where: { id },
    });
  },

  getCompletedUrlCounts(campaignIds: string[]) {
    if (campaignIds.length === 0) return Promise.resolve([]);
    return prisma.url.groupBy({
      by: ['campaignId'],
      where: {
        campaignId: { in: campaignIds },
        status: 'completed',
      },
      _count: { _all: true },
    });
  },

  count() {
    return prisma.campaign.count();
  },

  findRecent(take: number) {
    return prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { _count: { select: { urls: true } } },
    });
  },
};
