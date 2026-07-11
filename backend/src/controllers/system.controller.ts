import { Request, Response } from 'express';
import { systemService } from '../services';
import { verificationQueue } from '../queue/queues';
import { prisma } from '../prisma';

export const systemController = {
  async getDetails(_req: Request, res: Response) {
    const details = await systemService.getSystemDetails();
    res.json(details);
  },

  async enqueueOld(_req: Request, res: Response) {
    try {
      const urls = await prisma.url.findMany({
        where: {
          isIndexed: false,
          lastIndexCheckAt: null,
          validationStatus: 'completed'
        }
      });

      for (const url of urls) {
        await verificationQueue.add('verify-index', {
          urlId: url.id,
          link: url.link,
          attemptNumber: 1
        });
      }

      res.json({ message: `Enqueued ${urls.length} URLs for verification.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
