import { PrismaClient } from "@scrapter/database";

// Global instantiation for Vercel
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // Reduce log overhead
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
