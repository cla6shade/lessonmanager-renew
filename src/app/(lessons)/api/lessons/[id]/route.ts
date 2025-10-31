import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import {
  CancelLessonResponse,
  GetLessonDetailResponse,
  UpdateLessonRequestSchema,
  UpdateLessonResponse,
} from './schema';
import {
  cancelLesson,
  isBeforeCancelDeadline,
  isOwnLesson,
  updateLesson,
} from '@/app/(lessons)/service';
import { Lesson, PrismaPromise, User } from '@/generated/prisma';
import { restoreLessonCount } from '@/app/(users)/service';
import { LessonModifyType } from '@/utils/constants';
import { createModifyHistory } from '@/app/(history)/service';
import { routeWrapper } from '@/lib/routeWrapper';
import { NotFoundError, AuthorizationError, BadRequestError } from '@/lib/errors';

export const GET = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { id } = await params;
    const { isAdmin, userId } = session;
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
        teacher: {
          select: {
            id: true,
            name: true,
            major: true,
          },
        },
      },
    });
    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }
    if (!isAdmin && lesson.userId !== userId) {
      throw new AuthorizationError();
    }
    return NextResponse.json<GetLessonDetailResponse>({
      data: lesson,
    });
  },
  { requireSession: true },
);

export const PUT = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { id } = await params;
    const { note, isDone } = UpdateLessonRequestSchema.parse(await request.json());
    const lesson = await updateLesson(Number(id), { note, isDone });
    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }
    return NextResponse.json<UpdateLessonResponse>({
      data: lesson,
    });
  },
  { requireAdmin: true },
);

export const DELETE = routeWrapper<{ id: string }>(
  async (request, session, { params }) => {
    const { id } = await params;
    let { isAdmin, userId, teacherId } = session;
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
    });
    if (!lesson) {
      throw new NotFoundError('레슨을 찾을 수 없습니다. 이미 취소된 레슨인지 확인하세요');
    }
    if (isAdmin) {
      const tx: PrismaPromise<any>[] = [cancelLesson(Number(id)) as PrismaPromise<Lesson>];
      if (lesson.userId) {
        tx.push(restoreLessonCount(lesson.userId, 1) as PrismaPromise<User>);
      }
      const [lessonCancellation, lessonCountUpdate] = await prisma.$transaction(tx);
      await createModifyHistory({
        isAdmin,
        userId: lesson.userId || undefined,
        teacherId: lesson.teacherId,
        lesson: lesson,
        createdById: teacherId!,
        type: LessonModifyType.CANCEL_LESSON,
      });
      return NextResponse.json<CancelLessonResponse>({
        data: lessonCancellation,
      });
    } else {
      userId = userId!;
      if (
        !isOwnLesson({
          lesson,
          userId,
        })
      ) {
        throw new AuthorizationError('다른 회원의 예약은 취소할 수 없습니다.');
      }
      if (
        !isBeforeCancelDeadline({
          lesson,
          requestedAt: new Date(),
        })
      ) {
        throw new BadRequestError('레슨 취소가 가능한 기한이 지났습니다 (전일 21시)');
      }
      const tx: PrismaPromise<any>[] = [
        cancelLesson(Number(id)) as PrismaPromise<Lesson>,
        restoreLessonCount(userId, 1) as PrismaPromise<User>,
      ];
      const [lessonCancellation] = await prisma.$transaction(tx);
      await createModifyHistory({
        isAdmin,
        userId: lesson.userId || undefined,
        teacherId: lesson.teacherId,
        lesson: lesson,
        createdById: userId,
        type: LessonModifyType.CANCEL_LESSON,
      });
      return NextResponse.json<CancelLessonResponse>({
        data: lessonCancellation,
      });
    }
  },
  { requireSession: true },
);
