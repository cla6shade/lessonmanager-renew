import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getPaginationQuery } from '@/app/utils';
import { UserLessonsQuerySchema, UserLessonsResponse } from './schema';
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
    const { page, limit } = UserLessonsQuerySchema.parse({
      ...rawQuery,
      userId: id,
    });

    const whereConditions = {
      userId: Number(id),
    };

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where: whereConditions,
        include: {
          location: true,
          teacher: {
            select: {
              id: true,
              name: true,
              major: true,
              location: true,
            },
          },
        },
        orderBy: {
          dueDate: 'desc',
        },
        ...getPaginationQuery(page, limit),
      }),
      prisma.lesson.count({
        where: whereConditions,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<UserLessonsResponse>({
      data: lessons,
      total,
      totalPages,
    });
  },
  { requireAdmin: true },
);
