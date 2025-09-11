import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getPaginationQuery, buildErrorResponse } from "@/app/utils";
import { UserLessonsQuerySchema, UserLessonsResponse } from "./schema";

export async function GET(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const resolvedParams = await params;
    let { id } = resolvedParams;
    const { searchParams } = new URL(request.url);

    const urlPath = request.url.split("/api/admin/users/")[1];
    const urlId = urlPath ? urlPath.split("/")[0] : null;

    id = urlId || id;

    if (!id || isNaN(Number(id))) {
      console.log("Invalid user ID:", id);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const rawQuery = Object.fromEntries(searchParams.entries());
    const { page, limit } = UserLessonsQuerySchema.parse({
      ...rawQuery,
      userId: id,
    });

    const whereConditions = {
      userId: Number(id),
    };

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where: whereConditions,
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
        orderBy: {
          dueDate: "desc",
        },
        ...getPaginationQuery(page, limit),
      }),
      prisma.lesson.count({
        where: whereConditions,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<UserLessonsResponse>({
      data: lessons,
      total,
      totalPages,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
