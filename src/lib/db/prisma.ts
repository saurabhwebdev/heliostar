// Prisma Client singleton for use across the app
import { PrismaClient } from "@prisma/client";

// Prevent creating multiple instances in dev/hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
