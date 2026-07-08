import { prisma } from '../prisma';
import { connection } from '../queue';
import { getAllQueueSnapshots } from '../queue/queues';
import { adapterRegistry } from '../adapters/adapter.registry';
import { env } from '../config/env';

// Legacy single-queue snapshot for /health endpoint
async function getLegacyQueueSnapshot() {
  try {
    const snapshots = await getAllQueueSnapshots();
    return snapshots.reduce(
      (acc, q) => ({
        waiting: acc.waiting + q.waiting,
        active: acc.active + q.active,
        completed: acc.completed + q.completed,
        failed: acc.failed + q.failed,
        delayed: acc.delayed + q.delayed,
        paused: 0,
        total: acc.total + q.total,
      }),
      { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0, total: 0 },
    );
  } catch {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0, total: 0 };
  }
}

export const systemService = {
  async getHealth() {
    let dbConnected = false;
    let redisConnected = false;

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

    const queue = redisConnected ? await getLegacyQueueSnapshot() : {
      waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0, total: 0,
    };

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
    const [queueSnapshots, dbStatus, redisStatus] = await Promise.all([
      getAllQueueSnapshots(),
      prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      connection.ping().then((v) => v === 'PONG').catch(() => false),
    ]);

    const totalActive = queueSnapshots.reduce((s, q) => s + q.active, 0);
    const apiStatus = dbStatus && redisStatus ? 'healthy' : 'degraded';

    // Aggregate for backwards-compat legacy 'queue' field
    const queue = queueSnapshots.reduce(
      (acc, q) => ({
        waiting: acc.waiting + q.waiting,
        active: acc.active + q.active,
        completed: acc.completed + q.completed,
        failed: acc.failed + q.failed,
        delayed: acc.delayed + q.delayed,
        paused: 0,
        total: acc.total + q.total,
      }),
      { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0, total: 0 },
    );

    return {
      queue,
      queues: queueSnapshots,   // New: per-queue breakdown
      activeJobs: totalActive,
      workerConcurrency: env.workerConcurrency,
      enabledIndexingStrategies: adapterRegistry.getEnabledAdapters(),
      indexingReady: adapterRegistry.hasEnabledAdapters(),
      dryRunEnabled: adapterRegistry.isUsingDryRun(),
      dbConnected: dbStatus,
      redisConnected: redisStatus,
      averageProcessingTime: 2.4,
      apiStatus,
    };
  },
};
