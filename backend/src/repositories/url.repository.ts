import { prisma } from '../prisma';

export interface UrlQueryParams {
  status: string;
  limit: number;
  offset: number;
  search?: string;
  campaignId?: string;
}

export const urlRepository = {
  findMany(params: UrlQueryParams) {
    const whereClause = {
      ...(params.status !== 'all' ? { status: params.status } : {}),
      ...(params.search
        ? { link: { contains: params.search, mode: 'insensitive' as const } }
        : {}),
      ...(params.campaignId ? { campaignId: params.campaignId } : {}),
    };

    return Promise.all([
      prisma.url.findMany({
        where: whereClause,
        take: params.limit,
        skip: params.offset,
        orderBy: { createdAt: 'desc' },
        include: { campaign: { select: { id: true, name: true, status: true } } },
      }),
      prisma.url.count({ where: whereClause }),
    ]);
  },

  findById(id: string) {
    return prisma.url.findFirst({ where: { id } });
  },

  findByIdWithCampaign(id: string) {
    return prisma.url.findUnique({
      where: { id },
      include: { campaign: { select: { id: true, status: true } } },
    });
  },

  updateStatus(id: string, data: { status: string; retryCount?: number; errorMessage?: string | null }) {
    return prisma.url.update({ where: { id }, data });
  },

  markProcessing(id: string) {
    return prisma.url.update({
      where: { id },
      data: { status: 'processing', lastAttemptAt: new Date() },
    });
  },

  markCompleted(id: string, strategy: string) {
    return prisma.url.update({
      where: { id },
      data: {
        status: 'completed',
        discoveredAt: new Date(),
        strategy,
        errorMessage: null,
      },
    });
  },

  markFailed(id: string, retryCount: number, errorMessage: string, permanentlyFailed: boolean) {
    return prisma.url.update({
      where: { id },
      data: {
        status: permanentlyFailed ? 'failed' : 'queued',
        retryCount,
        errorMessage,
      },
    });
  },

  resetForRetry(id: string) {
    return prisma.url.update({
      where: { id },
      data: { status: 'queued', retryCount: 0, errorMessage: null },
    });
  },

  findAllFailed() {
    return prisma.url.findMany({
      where: { status: 'failed' },
      select: { id: true, link: true, campaignId: true },
    });
  },

  bulkResetForRetry(ids: string[], campaignIds: string[]) {
    return prisma.$transaction([
      prisma.url.updateMany({
        where: { id: { in: ids } },
        data: { status: 'queued', retryCount: 0, errorMessage: null },
      }),
      prisma.campaign.updateMany({
        where: { id: { in: campaignIds } },
        data: { status: 'processing' },
      }),
    ]);
  },

  count(where?: { status?: string; createdAt?: { gte?: Date; lt?: Date } }) {
    return prisma.url.count({ where });
  },

  findCompletedForSitemap(limit: number) {
    return prisma.url.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { link: true, discoveredAt: true },
    });
  },

  findByCampaignForSitemap(campaignId: string) {
    return prisma.url.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      select: { link: true, discoveredAt: true, status: true },
    });
  },

  findRecentByDateRange(start: Date) {
    return prisma.url.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  countByStatus(campaignId: string) {
    return Promise.all([
      prisma.url.count({ where: { campaignId } }),
      prisma.url.count({ where: { campaignId, status: 'completed' } }),
      prisma.url.count({ where: { campaignId, status: 'failed' } }),
      prisma.url.count({ where: { campaignId, status: 'processing' } }),
      prisma.url.count({ where: { campaignId, status: 'queued' } }),
    ]);
  },
};
