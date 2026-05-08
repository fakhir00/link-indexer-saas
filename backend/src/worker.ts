import { Worker, Job } from 'bullmq';
import { connection } from './queue';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This simulates pinging endpoints or calling IndexNow
async function indexUrlStrategy(url: string): Promise<{ success: boolean; message: string }> {
  // Simulate network latency (0.5 to 1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Simulate 90% success rate
  const isSuccess = Math.random() > 0.1;
  if (isSuccess) {
    return { success: true, message: 'Successfully pinged endpoints' };
  } else {
    throw new Error('Network timeout reaching ping endpoints');
  }
}

const worker = new Worker('url-indexing-queue', async (job: Job) => {
  const { urlId, url } = job.data;
  console.log(`[Worker] Processing URL: ${url}`);

  try {
    // 1. Mark as processing
    await prisma.url.update({
      where: { id: urlId },
      data: { status: 'processing', lastAttemptAt: new Date() }
    });

    // 2. Execute indexing strategy
    const result = await indexUrlStrategy(url);

    // 3. Mark as completed
    await prisma.url.update({
      where: { id: urlId },
      data: { 
        status: 'completed', 
        discoveredAt: new Date(),
        strategy: 'Ping Strategy',
        errorMessage: null
      }
    });

    console.log(`[Worker] ✅ Success: ${url}`);

  } catch (error: any) {
    console.error(`[Worker] ❌ Failed: ${url}`, error.message);
    
    // Increment retry count and check if we hit max
    const currentUrl = await prisma.url.findUnique({ where: { id: urlId } });
    if (currentUrl) {
      const newRetryCount = currentUrl.retryCount + 1;
      const isFailed = newRetryCount >= currentUrl.maxRetries;

      await prisma.url.update({
        where: { id: urlId },
        data: {
          status: isFailed ? 'failed' : 'queued',
          retryCount: newRetryCount,
          errorMessage: error.message
        }
      });
      
      // If not permanently failed, throw error to trigger BullMQ retry
      if (!isFailed) throw error; 
    }
  }
}, { connection, concurrency: 5 });

worker.on('ready', () => console.log('👷 Worker is ready and listening to queue...'));

export { worker };
