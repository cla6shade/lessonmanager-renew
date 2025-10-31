import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { SingleUserResponse } from '../schema';
import { routeWrapper } from '@/lib/routeWrapper';
import { BadRequestError, NotFoundError } from '@/lib/errors';

export const GET = routeWrapper(
  async (request, session) => {
    const { userId } = session;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        location: true,
        teacherInCharge: {
          select: {
            id: true,
            name: true,
          },
        },
        latestLesson: true,
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return NextResponse.json<SingleUserResponse>({
      data: user,
    });
  },
  { requireSession: true },
);
