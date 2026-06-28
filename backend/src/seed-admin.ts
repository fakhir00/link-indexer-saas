import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

dotenv.config();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'IndexFlow Admin';
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running seed:admin');
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(password, rounds);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: 'admin',
      isActive: true,
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'admin',
      isActive: true,
      credits: 5000,
    },
  });

  console.log(`Admin account ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
