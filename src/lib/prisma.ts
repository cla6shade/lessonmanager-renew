import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

export default prisma;
