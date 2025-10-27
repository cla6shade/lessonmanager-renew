import { vi } from 'vitest';
import { createPrismock } from 'prismock';
import { PrismaClient } from '@/generated/prisma';

vi.mock('@/generated/prisma', async () => {
  const actual = await vi.importActual('@/generated/prisma');
  return {
    ...actual,
    PrismaClient: createPrismock(actual.Prisma as any),
  };
});

vi.mock('@/lib/prisma', async () => {
  return { default: new PrismaClient() };
});
