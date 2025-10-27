import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getPaginationQuery, buildErrorResponse } from '@/app/utils';
import { UserPaymentsQuerySchema, UserPaymentsResponse } from './schema';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
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
  } catch (error) {
    return buildErrorResponse(error);
  }
}
