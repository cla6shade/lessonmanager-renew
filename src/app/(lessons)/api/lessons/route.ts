import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  GetLessonsQuerySchema,
  GetLessonsResponse,
  UpdateLessonsRequestSchema,
  UpdateLessonsResponse,
} from "./schema";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import { getLessons, updateLesson } from "../../service";

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
