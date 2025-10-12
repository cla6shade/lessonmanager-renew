import { NextRequest, NextResponse } from "next/server";
import {
  UpdateTeacherRequestSchema,
  UpdateTeacherResponse,
  SingleTeacherResponse,
  RemoveTeacherResponse,
} from "../schema";
import { findTeacher, updateTeacher } from "../../../service";
import { removeTeacher } from "@/app/(teachers)/service";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import { toKstDate } from "@/utils/date";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, teacherId: sessionTeacherId } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const teacherId = parseInt(id);
    if (isNaN(teacherId) || teacherId === sessionTeacherId) {
      return NextResponse.json(
        { error: "유효하지 않은 선생님 ID입니다." },
        { status: 400 }
      );
    }
    const teacherLessons = await prisma.lesson.count({
      where: {
        teacherId,
        dueDate: {
          gte: toKstDate(new Date(new Date().setHours(0, 0, 0, 0))),
        },
      },
    });

    if (teacherLessons > 0) {
      return NextResponse.json(
        {
          error:
            "해당 선생님에게 예약된 레슨이 있습니다. 예약된 레슨을 모두 취소한 후 다시 시도해주세요.",
        },
        { status: 400 }
      );
    }

    const [updatedTeacher] = await removeTeacher(teacherId);

    return NextResponse.json<RemoveTeacherResponse>({
      data: updatedTeacher,
    });
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}

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
    const teacherId = parseInt(id);
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { error: "Invalid teacher ID" },
        { status: 400 }
      );
    }

    const teacher = await findTeacher(teacherId);

    return NextResponse.json<SingleTeacherResponse>({
      data: teacher,
    });
  } catch (error) {
    console.error(error);
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
    const teacherId = parseInt(id);
    if (isNaN(teacherId)) {
      return NextResponse.json(
        { error: "Invalid teacher ID" },
        { status: 400 }
      );
    }

    const requestData = UpdateTeacherRequestSchema.parse(await request.json());

    await updateTeacher(teacherId, requestData);
    const updatedTeacher = await findTeacher(teacherId);

    return NextResponse.json<UpdateTeacherResponse>({
      data: updatedTeacher,
    });
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}
