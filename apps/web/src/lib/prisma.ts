import { prisma as databasePrisma } from "@scrapter/database";

// Global instantiation for Vercel
const globalForPrisma = global as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || databasePrisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
