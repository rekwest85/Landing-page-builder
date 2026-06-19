import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("placeholder")) {
    // Allow build to complete without a real DB; routes that need DB will fail gracefully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return null as any;
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const prisma = (globalForPrisma.prisma ?? createPrisma()) as PrismaClient | null;

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalForPrisma.prisma = prisma as any;
}
