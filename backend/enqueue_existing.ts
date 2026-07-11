import { prisma } from './src/prisma';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from './src/queue/queues';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const verificationQueue = new Queue(QUEUE_NAMES.VERIFICATION, { connection });

async function main() {
  console.log('Fetching URLs that are completed but not checked yet...');
  const urls = await prisma.url.findMany({
    where: {
      status: 'completed',
      lastIndexCheckAt: null,
    }
  });

  console.log(`Found ${urls.length} URLs to enqueue.`);

  let count = 0;
  for (const url of urls) {
    await verificationQueue.add('verify-index', {
      urlId: url.id,
      link: url.link,
      attemptNumber: 0
    }, {
      jobId: `verify-${url.id}`,
      // Distribute jobs over time to prevent hitting Google rate limits (1 job every 5 seconds)
      delay: count * 5000, 
    });
    count++;
  }

  console.log(`Successfully enqueued ${count} URLs for verification.`);
  
  await prisma.$disconnect();
  await connection.quit();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
