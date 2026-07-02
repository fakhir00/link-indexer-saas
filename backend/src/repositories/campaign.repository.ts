import { prisma } from '../prisma';

export const campaignRepository = {
  findAll() {
    return prisma.campaign.findMany({
      include: { _count: { select: { urls: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: { _count: { select: { urls: true } } },
    });
  },

  create(data: { name: string; dripPerDay: number; urls: string[] }) {
    return prisma.campaign.create({
      data: {
        name: data.name,
        status: 'processing',
        dripPerDay: data.dripPerDay,
        urls: {
          create: data.urls.map((link) => ({ link, status: 'queued' })),
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
