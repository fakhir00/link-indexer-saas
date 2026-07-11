import { prisma } from '../prisma';

export const directoryService = {
  async getPaginated(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where: { status: 'completed' },
        orderBy: { discoveredAt: 'desc' },
        take: limit,
        skip: offset,
        select: { id: true, link: true, discoveredAt: true, healthScore: true, isIndexed: true, lastIndexCheckAt: true },
      }),
      prisma.url.count({ where: { status: 'completed' } }),
    ]);

    return {
      urls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getRecent() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return prisma.url.findMany({
      where: {
        status: 'completed',
        discoveredAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { discoveredAt: 'desc' },
      take: 100,
      select: { id: true, link: true, discoveredAt: true, healthScore: true, isIndexed: true, lastIndexCheckAt: true },
    });
  },

  async getPopular() {
    // In a real app this might use analytics. For now we use healthScore as a proxy for "popular"
    return prisma.url.findMany({
      where: { status: 'completed' },
      orderBy: { healthScore: 'desc' },
      take: 50,
      select: { id: true, link: true, discoveredAt: true, healthScore: true, isIndexed: true, lastIndexCheckAt: true },
    });
  },

  async getArchiveByDate(startDate: Date, endDate: Date) {
    return prisma.url.findMany({
      where: {
        status: 'completed',
        discoveredAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { discoveredAt: 'desc' },
      select: { id: true, link: true, discoveredAt: true, isIndexed: true, lastIndexCheckAt: true },
    });
  },

  async getByCategory(slug: string) {
    // Basic implementation: filtering by top-level domain if slug represents TLD like "com", "org"
    return prisma.url.findMany({
      where: {
        status: 'completed',
        link: { endsWith: `.${slug}` },
      },
      orderBy: { discoveredAt: 'desc' },
      take: 50,
      select: { id: true, link: true, discoveredAt: true, isIndexed: true, lastIndexCheckAt: true },
    });
  },
};
