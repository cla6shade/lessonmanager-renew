import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  CreateLessonByAdminInputSchema,
  CreateLessonByAdminResponse,
  CreateLessonByUserInputSchema,
  CreateLessonByUserResponse,
  GetLessonsQuerySchema,
  GetLessonsResponse,
  UpdateLessonsRequestSchema,
  UpdateLessonsResponse,
} from "./schema";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import {
  createLessonByAdmin,
  createLessonByUser,
  getLessons,
  isBannedAt,
  isAvailableAt,
  updateLesson,
  isTeacherAvailableAt,
} from "../../service";
import { hasLessonCount, useLessonCount } from "@/app/(users)/service";
import { Lesson, PrismaPromise, User } from "@/generated/prisma";
import { isLessonDueInPayment } from "@/app/(payments)/service";
import { createModifyHistory } from "@/app/(history)/service";
import { LessonModifyType } from "@/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const { startDate, endDate, teacherId, locationId } =
      GetLessonsQuerySchema.parse(rawQuery);
    const lessons = await getLessons({
      startDate,
      endDate,
      selectedTeacherId: teacherId,
      selectedLocationId: locationId,
    });
    return NextResponse.json<GetLessonsResponse>({ data: lessons });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "인증되지 않음" }, { status: 401 });
    }
    const { lessons } = UpdateLessonsRequestSchema.parse(await request.json());
    const updatedLessons = await Promise.all(
      lessons.map((lesson) => {
        return updateLesson(lesson.id, {
          note: lesson.note,
          isDone: lesson.isDone,
        });
      })
    );
    return NextResponse.json<UpdateLessonsResponse>({ data: updatedLessons });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    let {
      isAdmin,
      userId: sessionUserId,
      teacherId: sessionTeacherId,
    } = await getSession();
    if (!sessionUserId && !sessionTeacherId) {
      return NextResponse.json({ error: "인증되지 않음" }, { status: 401 });
    }
    if (isAdmin) {
      sessionTeacherId = sessionTeacherId!;
      const input = CreateLessonByAdminInputSchema.parse(await request.json());
      if (
        input.userId === undefined &&
        (input.contact === undefined || input.username === undefined)
      ) {
        return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
      }
      const [
        isLessonCountLeft,
        isTimeBannedAt,
        isLessonAvliableAt,
        isTeacherWorkingHour,
      ] = await Promise.all([
        hasLessonCount(input.userId!),
        isBannedAt(input.dueDate, input.dueHour, input.teacherId),
        isAvailableAt(
          input.dueDate,
          input.dueHour,
          input.teacherId,
          input.locationId,
          input.isGrand
        ),
        isTeacherAvailableAt(input.teacherId, input.dueDate, input.dueHour),
      ]);
      if (!isLessonCountLeft) {
        return NextResponse.json(
          { error: "사용자의 레슨 횟수가 부족합니다" },
          { status: 400 }
        );
      }
      if (isTimeBannedAt) {
        return NextResponse.json(
          {
            error:
              "해당 시간은 예약이 제한되어 있습니다. 다른 시간으로 다시 시도해주세요",
          },
          { status: 400 }
        );
      }
      if (!isLessonAvliableAt) {
        return NextResponse.json(
          { error: "다른 레슨과 예약 시간이 겹칩니다" },
          { status: 400 }
        );
      }
      if (!isTeacherWorkingHour) {
        return NextResponse.json(
          { error: "강사가 근무하지 않는 시간입니다" },
          { status: 400 }
        );
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
        tx.push(useLessonCount(targetUser.id, 1) as PrismaPromise<User>);
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
    } else {
      sessionUserId = sessionUserId!;
      const sessionUser = await prisma.user.findUnique({
        where: { id: sessionUserId },
      });
      if (!sessionUser) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다" },
          { status: 404 }
        );
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
        isAvailableAt(
          input.dueDate,
          input.dueHour,
          input.teacherId,
          input.locationId,
          input.isGrand
        ),
        isTeacherAvailableAt(input.teacherId, input.dueDate, input.dueHour),
      ]);
      if (!isLessonCountLeft) {
        return NextResponse.json(
          { error: "레슨 횟수가 부족합니다" },
          { status: 400 }
        );
      }
      if (!isLessonInPayment) {
        return NextResponse.json(
          {
            error:
              "결제 기간을 벗어난 날짜입니다. 다른 날짜로 다시 시도해주세요",
          },
          { status: 400 }
        );
      }
      if (isTimeBannedAt) {
        return NextResponse.json(
          { error: "해당 시간은 예약이 제한되어 있습니다" },
          { status: 400 }
        );
      }
      if (!isLessonAvailableAt) {
        return NextResponse.json(
          { error: "다른 레슨과 예약 시간이 겹칩니다" },
          { status: 400 }
        );
      }
      if (!isTeacherWorkingHour) {
        return NextResponse.json(
          { error: "강사가 근무하지 않는 시간입니다" },
          { status: 400 }
        );
      }

      const tx: PrismaPromise<any>[] = [
        createLessonByUser(
          input,
          sessionUserId,
          sessionUser.name
        ) as PrismaPromise<Lesson>,
        useLessonCount(sessionUserId, 1) as PrismaPromise<User>,
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
    }
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}
