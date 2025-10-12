// @ts-nocheck

import { PrismaClient } from "@/generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  var __prismaQueryLoggerAttached__: boolean | undefined;
}

const prisma =
  global.prisma ??
  new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "warn", emit: "stdout" },
      { level: "error", emit: "stdout" },
    ],
  });
export default prisma;

if (!global.__prismaQueryLoggerAttached__) {
  const PRISMA_LOG_LEVEL = process.env.PRISMA_LOG_LEVEL;
  prisma.$on("query", (e) => {
    let params: unknown;
    try {
      params = e.params ? JSON.parse(e.params) : [];
    } catch {
      params = e.params;
    }
    if (PRISMA_LOG_LEVEL === "debug") {
      console.log("--- PRISMA QUERY ---");
      console.log(e.query);
      console.log("PARAMS:", params);
      console.log("DURATION:", e.duration, "ms");
      console.log("--------------------\n");
    }
  });
  global.__prismaQueryLoggerAttached__ = true;
}

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
