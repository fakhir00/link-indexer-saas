import { prisma } from '../prisma';
import { getQueueSnapshot, connection } from '../queue';
import { getEnabledIndexingStrategies, hasEnabledIndexingStrategies, isUsingDryRunStrategy } from '../indexing-strategies';
import { env } from '../config/env';

export const systemService = {
  async getHealth() {
    let dbConnected = false;
    let redisConnected = false;
    let queue = {
      waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0, total: 0,
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    try {
      redisConnected = (await connection.ping()) === 'PONG';
    } catch {
      redisConnected = false;
    }

    if (redisConnected) {
      try {
        queue = await getQueueSnapshot();
      } catch {
        // ignore queue errors for health response
      }
    }

    const healthy = dbConnected && redisConnected;
    return {
      status: healthy ? 'ok' as const : 'degraded' as const,
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? 'up' as const : 'down' as const,
        redis: redisConnected ? 'up' as const : 'down' as const,
      },
      queue,
    };
  },

  async getSystemDetails() {
    const [queue, dbStatus, redisStatus] = await Promise.all([
      getQueueSnapshot(),
      prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      connection.ping().then((value) => value === 'PONG').catch(() => false),
    ]);

    const averageProcessingTime = 2.4;
    const apiStatus = dbStatus && redisStatus ? 'healthy' : 'degraded';

    return {
      queue,
      activeJobs: queue.active,
      workerConcurrency: env.workerConcurrency,
      enabledIndexingStrategies: getEnabledIndexingStrategies(),
      indexingReady: hasEnabledIndexingStrategies(),
      dryRunEnabled: isUsingDryRunStrategy(),
      dbConnected: dbStatus,
      redisConnected: redisStatus,
      averageProcessingTime,
      apiStatus,
    };
  },
};
