import { prisma } from '../index.js';
import bcrypt from 'bcrypt';

// Use the singleton instance from index.ts

async function main() {
  const email = 'admin@scrapter.com';
  const password = 'admin@password123';
  const name = 'Admin User';

  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert admin user (Create if not exists, update if exists)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      emailVerified: new Date(), // Auto-verify admin
    },
    create: {
      email,
      password: hashedPassword,
      name,
      emailVerified: new Date(),
      subscription: {
        create: {
          plan: 'PRO',
          status: 'ACTIVE'
        }
      }
    },
  });

  console.log(`Admin user seeded: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });