import { NextRequest, NextResponse } from 'next/server';
import {
  UpdateTeacherRequestSchema,
  UpdateTeacherResponse,
  SingleTeacherResponse,
  RemoveTeacherResponse,
} from '../schema';
import { findTeacher, updateTeacher } from '../../../service';
import { removeTeacher } from '@/app/(teachers)/service';
import { toKstDate } from '@/utils/date';
import prisma from '@/lib/prisma';
import { routeWrapper } from '@/lib/routeWrapper';
import { BadRequestError } from '@/lib/errors';

export const DELETE = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { teacherId: sessionTeacherId } = session;
    const { id } = await params;
    const teacherId = parseInt(id);

    if (isNaN(teacherId) || teacherId === sessionTeacherId) {
      throw new BadRequestError('유효하지 않은 선생님 ID입니다.');
    }

    const teacherLessons = await prisma.lesson.count({
      where: {
        teacherId,
        dueDate: {
          gte: toKstDate(new Date(new Date().setHours(0, 0, 0, 0))),
        },
      },
    });

    if (teacherLessons > 0) {
      throw new BadRequestError(
        '해당 선생님에게 예약된 레슨이 있습니다. 예약된 레슨을 모두 취소한 후 다시 시도해주세요.',
      );
    }

    const [updatedTeacher] = await removeTeacher(teacherId);

    return NextResponse.json<RemoveTeacherResponse>({
      data: updatedTeacher,
    });
  },
  { requireAdmin: true },
);

export const GET = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { id } = await params;
    const teacherId = parseInt(id);
    if (isNaN(teacherId)) {
      throw new BadRequestError('Invalid teacher ID');
    }

    const teacher = await findTeacher(teacherId);

    return NextResponse.json<SingleTeacherResponse>({
      data: teacher,
    });
  },
  { requireAdmin: true },
);

export const PUT = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { id } = await params;
    const teacherId = parseInt(id);
    if (isNaN(teacherId)) {
      throw new BadRequestError('Invalid teacher ID');
    }

    const requestData = UpdateTeacherRequestSchema.parse(await request.json());

    await updateTeacher(teacherId, requestData);
    const updatedTeacher = await findTeacher(teacherId);

    return NextResponse.json<UpdateTeacherResponse>({
      data: updatedTeacher,
    });
  },
  { requireAdmin: true },
);
