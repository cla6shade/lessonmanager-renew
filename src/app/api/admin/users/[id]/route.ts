import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { PublicUserDetailResponse } from "./schema";

export default async function GET(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
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
}
