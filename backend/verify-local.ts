import { prisma } from './src/prisma';
import { checkIndexStatus } from './src/services/verification.service';

async function main() {
  const urls = await prisma.url.findMany({
    where: {
      status: 'completed',
      lastIndexCheckAt: null
    }
  });

  console.log(`Found ${urls.length} URLs to verify.`);

  for (const url of urls) {
    try {
      console.log(`Verifying ${url.link}...`);
      const isIndexed = await checkIndexStatus(url.link);
      
      await prisma.url.update({
        where: { id: url.id },
        data: {
          isIndexed,
          lastIndexCheckAt: new Date()
        }
      });
      console.log(`✅ Updated: Indexed = ${isIndexed}`);
    } catch (err: any) {
      console.error(`❌ Error verifying ${url.link}:`, err.message);
    }
  }

  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
