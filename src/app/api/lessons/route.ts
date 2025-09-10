import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GetLessonsQuerySchema, GetLessonsResponse } from "./schema";

export async function GET(request: NextRequest) {
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
          location: true,
        },
      },
    },
  });
  return NextResponse.json<GetLessonsResponse>({ data: lessons });
}
