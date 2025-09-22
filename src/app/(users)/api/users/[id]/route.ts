import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  PublicUserDetailResponse,
  UpdateUserRequestSchema,
  UpdateUserResponse,
} from "./schema";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import { findUser } from "@/app/(users)/service";

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

export async function PUT(
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
    const rawData = await request.json();
    console.log(rawData);

    const data = UpdateUserRequestSchema.parse(rawData);

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        contact: data.contact || undefined,
        birth: data.birth || undefined,
        address: data.address || undefined,
        email: data.email || undefined,
        ability: data.ability || undefined,
        genre: data.genre || undefined,
        locationId: data.locationId,
      },
    });
    const updatedUser = await findUser(Number(id));

    return NextResponse.json<UpdateUserResponse>({
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}
