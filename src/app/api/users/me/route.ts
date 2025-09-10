import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { SingleUserResponse } from "../schema";

export default async function GET(request: NextRequest) {
  const { userId } = await getSession();

  if (!userId) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      location: true,
      teacherInCharge: {
        select: {
          id: true,
          name: true,
        },
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

  return NextResponse.json<SingleUserResponse>({
    data: user,
  });
}
