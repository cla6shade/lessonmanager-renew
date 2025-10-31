import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import {
  CreateLessonByAdminInputSchema,
  CreateLessonByAdminResponse,
  CreateLessonByUserInputSchema,
  CreateLessonByUserResponse,
  GetLessonsQuerySchema,
  GetLessonsResponse,
  UpdateLessonsRequestSchema,
  UpdateLessonsResponse,
} from './schema';
import {
  createLessonByAdmin,
  createLessonByUser,
  getLessons,
  isBannedAt,
  isAvailableAt,
  updateLesson,
  isTeacherAvailableAt,
} from '../../service';
import { hasLessonCount, consumeLessonCount } from '@/app/(users)/service';
import { Lesson, PrismaPromise, User } from '@/generated/prisma';
import { isLessonDueInPayment } from '@/app/(payments)/service';
import { createModifyHistory } from '@/app/(history)/service';
import { LessonModifyType } from '@/utils/constants';
import { routeWrapper } from '@/lib/routeWrapper';
import { BadRequestError, NotFoundError, AuthorizationError } from '@/lib/errors';
import { SessionData } from '@/lib/session';

export const GET = routeWrapper(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const rawQuery = Object.fromEntries(searchParams.entries());
  const { startDate, endDate, teacherId, locationId } = GetLessonsQuerySchema.parse(rawQuery);
  const lessons = await getLessons({
    startDate,
    endDate,
    selectedTeacherId: teacherId,
    selectedLocationId: locationId,
  });
  return NextResponse.json<GetLessonsResponse>({ data: lessons });
});

export const PUT = routeWrapper(
  async (request: NextRequest) => {
    const { lessons } = UpdateLessonsRequestSchema.parse(await request.json());
    const updatedLessons = await Promise.all(
      lessons.map((lesson) => {
        return updateLesson(lesson.id, {
          note: lesson.note,
          isDone: lesson.isDone,
        });
      }),
    );
    return NextResponse.json<UpdateLessonsResponse>({ data: updatedLessons });
  },
  { requireAdmin: true },
);

export const POST = routeWrapper(
  async (request: NextRequest, session: SessionData) => {
    let { isAdmin, userId: sessionUserId, teacherId: sessionTeacherId } = session;
    if (!sessionUserId && !sessionTeacherId) {
      throw new AuthorizationError('인증되지 않음');
    }

    if (isAdmin) {
      sessionTeacherId = sessionTeacherId!;
      const input = CreateLessonByAdminInputSchema.parse(await request.json());
      if (
        input.userId === undefined &&
        (input.contact === undefined || input.username === undefined)
      ) {
        throw new BadRequestError('잘못된 요청');
      }
      const [isLessonCountLeft, isTimeBannedAt, isLessonAvliableAt, isTeacherWorkingHour] =
        await Promise.all([
          hasLessonCount(input.userId!),
          isBannedAt(input.dueDate, input.dueHour, input.teacherId),
          isAvailableAt(
            input.dueDate,
            input.dueHour,
            input.teacherId,
            input.locationId,
            input.isGrand,
          ),
          isTeacherAvailableAt(input.teacherId, input.dueDate, input.dueHour),
        ]);
      if (!isLessonCountLeft) {
        throw new BadRequestError('사용자의 레슨 횟수가 부족합니다');
      }
      if (isTimeBannedAt) {
        throw new BadRequestError(
          '해당 시간은 예약이 제한되어 있습니다. 다른 시간으로 다시 시도해주세요',
        );
      }
      if (!isLessonAvliableAt) {
        throw new BadRequestError('다른 레슨과 예약 시간이 겹칩니다');
      }
      if (!isTeacherWorkingHour) {
        throw new BadRequestError('강사가 근무하지 않는 시간입니다');
      }
      const targetUser = input.userId
        ? await prisma.user.findUnique({
            where: { id: input.userId },
          })
        : null;
      const tx: PrismaPromise<any>[] = [
        createLessonByAdmin({
          username: targetUser?.name,
          ...input,
        }) as PrismaPromise<Lesson>,
      ];
      if (targetUser) {
        tx.push(consumeLessonCount(targetUser.id, 1) as PrismaPromise<User>);
      }
      const [lessonCreation, lessonCountUpdate] = await prisma.$transaction(tx);
      await createModifyHistory({
        isAdmin,
        userId: targetUser?.id,
        teacherId: input.teacherId,
        lesson: lessonCreation,
        createdById: sessionTeacherId,
        type: LessonModifyType.CREATE_LESSON,
      });

      return NextResponse.json<CreateLessonByAdminResponse>({
        data: lessonCreation,
      });
    }

    sessionUserId = sessionUserId!;
    const sessionUser = await prisma.user.findUnique({
      where: { id: sessionUserId },
    });
    if (!sessionUser) {
      throw new NotFoundError('사용자를 찾을 수 없습니다');
    }
    const input = CreateLessonByUserInputSchema.parse(await request.json());
    const [
      isLessonCountLeft,
      isLessonInPayment,
      isTimeBannedAt,
      isLessonAvailableAt,
      isTeacherWorkingHour,
    ] = await Promise.all([
      hasLessonCount(sessionUserId),
      isLessonDueInPayment(input.dueDate, sessionUserId),
      isBannedAt(input.dueDate, input.dueHour, input.teacherId),
      isAvailableAt(input.dueDate, input.dueHour, input.teacherId, input.locationId, input.isGrand),
      isTeacherAvailableAt(input.teacherId, input.dueDate, input.dueHour),
    ]);
    if (!isLessonCountLeft) {
      throw new BadRequestError('레슨 횟수가 부족합니다');
    }
    if (!isLessonInPayment) {
      throw new BadRequestError('결제 기간을 벗어난 날짜입니다. 다른 날짜로 다시 시도해주세요');
    }
    if (isTimeBannedAt) {
      throw new BadRequestError('해당 시간은 예약이 제한되어 있습니다');
    }
    if (!isLessonAvailableAt) {
      throw new BadRequestError('다른 레슨과 예약 시간이 겹칩니다');
    }
    if (!isTeacherWorkingHour) {
      throw new BadRequestError('강사가 근무하지 않는 시간입니다');
    }

    const tx: PrismaPromise<any>[] = [
      createLessonByUser(input, sessionUserId, sessionUser.name) as PrismaPromise<Lesson>,
      consumeLessonCount(sessionUserId, 1) as PrismaPromise<User>,
    ];
    const [lessonCreation, lessonCountUpdate] = await prisma.$transaction(tx);
    await createModifyHistory({
      isAdmin,
      userId: sessionUserId,
      teacherId: input.teacherId,
      lesson: lessonCreation,
      createdById: sessionUserId,
      type: LessonModifyType.CREATE_LESSON,
    });
    return NextResponse.json<CreateLessonByUserResponse>({
      data: lessonCreation,
    });
  },
  { requireSession: true },
);
