import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  CreateLessonByAdminInputSchema,
  CreateLessonByUserInputSchema,
  GetLessonsQuerySchema,
  GetLessonsResponse,
  UpdateLessonsRequestSchema,
  UpdateLessonsResponse,
} from "./schema";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import {
  canCreateLesson,
  createLessonByAdmin,
  createLessonByUser,
  getLessons,
  isBannedAt,
  isAvailableAt,
  updateLesson,
  isTeacherAvailableAt,
} from "../../service";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const {
      isAdmin,
      userId: sessionUserId,
      teacherId: sessionTeacherId,
    } = await getSession();
    if (!sessionUserId || !sessionTeacherId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (isAdmin) {
      const input = CreateLessonByAdminInputSchema.parse(await request.json());
      if (
        input.userId !== undefined &&
        input.contact !== undefined &&
        input.username !== undefined
      ) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
      const [
        userHasLessonCount,
        isTimeBannedAt,
        isLessonAvliableAt,
        isTeacherWorkingHour,
      ] = await Promise.all([
        canCreateLesson({ userId: sessionUserId }),
        isBannedAt(input.dueDate, input.dueHour, input.teacherId),
        isAvailableAt(input.dueDate, input.dueHour, input.isGrand),
        isTeacherAvailableAt(input.teacherId, input.dueDate, input.dueHour),
      ]);
      if (!userHasLessonCount) {
        return NextResponse.json(
          { error: "User has no lesson count" },
          { status: 400 }
        );
      }
      if (isTimeBannedAt) {
        return NextResponse.json({ error: "Time is banned" }, { status: 400 });
      }
      if (!isLessonAvliableAt) {
        return NextResponse.json(
          { error: "Lesson is not available" },
          { status: 400 }
        );
      }
      if (!isTeacherWorkingHour) {
        return NextResponse.json(
          { error: "Teacher is not working" },
          { status: 400 }
        );
      }
      const lesson = await createLessonByAdmin(input);
      // return NextResponse.json<CreateLessonByAdminResponse>({ data: lesson });
    } else {
      const input = CreateLessonByUserInputSchema.parse(await request.json());
      const lesson = await createLessonByUser(input, sessionUserId);
      // return NextResponse.json<CreateLessonByUserResponse>({ data: lesson });
    }
  } catch (error) {
    return buildErrorResponse(error);
  }
}
