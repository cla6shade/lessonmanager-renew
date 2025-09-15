import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PublicUserDetailResponse } from "./schema";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
        teacherInCharge: {
          omit: { password: true },
        },
        latestLesson: true,
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json<PublicUserDetailResponse>({
      data: user,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
