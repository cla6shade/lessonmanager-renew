import { buildErrorResponse } from "@/app/utils";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  CancelLessonResponse,
  GetLessonDetailResponse,
  UpdateLessonRequestSchema,
  UpdateLessonResponse,
} from "./schema";
import { getSession } from "@/lib/session";
import {
  cancelLesson,
  isBeforeCancelDeadline,
  isOwnLesson,
  updateLesson,
} from "@/app/(lessons)/service";
import { Lesson, PrismaPromise, User } from "@/generated/prisma";
import { restoreLessonCount } from "@/app/(users)/service";
import { LessonModifyType } from "@/utils/constants";
import { createModifyHistory } from "@/app/(history)/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin, userId } = await getSession();
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
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    if (!isAdmin && lesson.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json<GetLessonDetailResponse>({
      data: lesson,
    });
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { note, isDone } = UpdateLessonRequestSchema.parse(
      await request.json()
    );
    const lesson = await updateLesson(Number(id), { note, isDone });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    return NextResponse.json<UpdateLessonResponse>({
      data: lesson,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let { isAdmin, userId, teacherId } = await getSession();
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
    });
    if (!lesson) {
      return NextResponse.json(
        { error: "레슨을 찾을 수 없습니다. 이미 취소된 레슨인지 확인하세요" },
        { status: 404 }
      );
    }
    if (isAdmin) {
      const tx: PrismaPromise<any>[] = [
        cancelLesson(Number(id)) as PrismaPromise<Lesson>,
      ];
      if (lesson.userId) {
        tx.push(restoreLessonCount(lesson.userId, 1) as PrismaPromise<User>);
      }
      const [lessonCancellation, lessonCountUpdate] = await prisma.$transaction(
        tx
      );
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
        return NextResponse.json(
          { error: "다른 회원의 예약은 취소할 수 없습니다." },
          { status: 401 }
        );
      }
      if (
        !isBeforeCancelDeadline({
          lesson,
          requestedAt: new Date(),
        })
      ) {
        return NextResponse.json(
          { error: "레슨 취소가 가능한 기한이 지났습니다 (전일 21시)" },
          { status: 400 }
        );
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
  } catch (error) {
    return buildErrorResponse(error);
  }
}
