import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { PublicUserDetailResponse, UpdateUserRequestSchema, UpdateUserResponse } from './schema';
import { findUser } from '@/app/(users)/service';
import { routeWrapper } from '@/lib/routeWrapper';
import { BadRequestError, NotFoundError } from '@/lib/errors';

export const GET = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { id } = await params;
    if (!id || isNaN(Number(id))) {
      throw new BadRequestError('Invalid user ID');
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
        teacherInCharge: {
          omit: { password: true },
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

    return NextResponse.json<PublicUserDetailResponse>({
      data: user,
    });
  },
  { requireAdmin: true },
);

export const PUT = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { id } = await params;
    if (!id || isNaN(Number(id))) {
      throw new BadRequestError('Invalid user ID');
    }
    const rawData = await request.json();
    console.log(rawData);

    const data = UpdateUserRequestSchema.parse(rawData);

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        contact: data.contact || undefined,
        birth: data.birth || undefined,
        address: data.address || undefined,
        email: data.email || undefined,
        ability: data.ability || undefined,
        genre: data.genre || undefined,
        locationId: data.locationId,
      },
    });
    const updatedUser = await findUser(Number(id));

    return NextResponse.json<UpdateUserResponse>({
      data: updatedUser,
    });
  },
  { requireAdmin: true },
);
