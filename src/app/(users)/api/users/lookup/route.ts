import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { UserLookupRequestSchema, UserLookupResponse } from './schema';
import { routeWrapper } from '@/lib/routeWrapper';

export const GET = routeWrapper(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const { query: q } = UserLookupRequestSchema.parse({ query });
    const users = await prisma.user.findMany({
      where: {
        OR: q ? [{ name: { contains: q } }, { contact: { contains: q } }] : [],
      },
      select: {
        id: true,
        name: true,
        contact: true,
        birth: true,
      },
    });
    return NextResponse.json<UserLookupResponse>({
      data: users,
    });
  },
  { requireAdmin: true },
);
