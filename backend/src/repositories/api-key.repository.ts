import { prisma } from '../prisma';

export const apiKeyRepository = {
  findAll() {
    return prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
  },

  create(data: { label: string; keyHash: string }) {
    return prisma.apiKey.create({ data });
  },

  deactivate(id: string) {
    return prisma.apiKey.updateMany({
      where: { id },
      data: { isActive: false },
    });
  },

  findByHash(keyHash: string) {
    return prisma.apiKey.findUnique({ where: { keyHash } });
  },
};
