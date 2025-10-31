import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getPaginationQuery } from '@/app/utils';
import { UserPaymentsQuerySchema, UserPaymentsResponse } from './schema';
import { routeWrapper } from '@/lib/routeWrapper';
import { BadRequestError } from '@/lib/errors';

export const GET = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    if (!id || isNaN(Number(id))) {
      throw new BadRequestError('Invalid user ID');
    }

    const rawQuery = Object.fromEntries(searchParams.entries());
    const { page, limit } = UserPaymentsQuerySchema.parse({
      ...rawQuery,
    });

    const whereConditions = {
      userId: Number(id),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereConditions,
        orderBy: {
          createdAt: 'desc',
        },
        ...getPaginationQuery(page, limit),
      }),
      prisma.payment.count({
        where: whereConditions,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<UserPaymentsResponse>({
      data: payments,
      total,
      totalPages,
    });
  },
  { requireAdmin: true },
);
