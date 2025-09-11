import { buildErrorResponse } from "@/app/utils";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  GetLessonDetailResponse,
  UpdateLessonRequestSchema,
  UpdateLessonResponse,
} from "./schema";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin, userId } = await getSession();
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
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
    });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    if (!isAdmin && lesson.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json<GetLessonDetailResponse>({
      data: lesson,
    });
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { note, isDone } = UpdateLessonRequestSchema.parse(
      await request.json()
    );
    const lesson = await prisma.lesson.update({
      where: { id: Number(id) },
      data: { note, isDone },
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
    });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    return NextResponse.json<UpdateLessonResponse>({
      data: lesson,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const { isAdmin, userId } = await getSession();
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
    });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    if (!isAdmin && lesson.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    return buildErrorResponse(error);
  }
}
