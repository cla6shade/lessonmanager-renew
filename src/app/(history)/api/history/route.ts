import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getPaginationQuery, buildErrorResponse } from '@/app/utils';
import { GetHistoryQuerySchema, GetHistoryResponse } from './schema';
import { getSession } from '@/lib/session';
import { Prisma } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const { page, limit, userId, teacherId, type, createdByType } =
      GetHistoryQuerySchema.parse(rawQuery);

    const whereConditions = getWhereConditions(userId, teacherId, type, createdByType);

    const [histories, total] = await Promise.all([
      prisma.lessonModifyHistory.findMany({
        where: whereConditions,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          modifiedAt: 'desc',
        },
        ...getPaginationQuery(page, limit),
      }),
      prisma.lessonModifyHistory.count({
        where: whereConditions,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<GetHistoryResponse>({
      data: histories,
      total,
      totalPages,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

function getWhereConditions(
  userId?: number,
  teacherId?: number,
  type?: number,
  createdByType?: number,
): Prisma.LessonModifyHistoryWhereInput {
  const conditions: Prisma.LessonModifyHistoryWhereInput = {};

  if (userId !== undefined) {
    conditions.userId = userId;
  }

  if (teacherId !== undefined) {
    conditions.teacherId = teacherId;
  }

  if (type !== undefined) {
    conditions.type = type;
  }

  if (createdByType !== undefined) {
    conditions.createdByType = createdByType;
  }

  return conditions;
}
