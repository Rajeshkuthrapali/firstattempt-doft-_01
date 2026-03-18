import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

/**
 * Singleton Prisma client instance.
 * In development, stores the client on `globalThis` to survive HMR restarts.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
