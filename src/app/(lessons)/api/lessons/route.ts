import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GetLessonsQuerySchema, GetLessonsResponse } from "./schema";
import { buildErrorResponse } from "@/app/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const { startDate, endDate, teacherId, locationId } =
      GetLessonsQuerySchema.parse(rawQuery);
    const lessons = await prisma.lesson.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
        ...(teacherId !== undefined ? { teacherId } : {}),
        ...(locationId !== undefined ? { locationId } : {}),
      },
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
      omit: {
        contact: true,
        note: true,
      },
    });
    return NextResponse.json<GetLessonsResponse>({ data: lessons });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
