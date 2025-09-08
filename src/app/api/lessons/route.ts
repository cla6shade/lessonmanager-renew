import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GetLessonsQuerySchema, GetLessonsResponse } from "./schema";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
    });
    return NextResponse.json<GetLessonsResponse>({ data: lessons });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
