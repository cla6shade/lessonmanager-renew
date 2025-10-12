import { NextRequest, NextResponse } from "next/server";
import {
  CreateTeacherRequestSchema,
  CreateTeacherResponse,
  TeacherSearchRequestSchema,
  TeacherSearchResponse,
} from "./schema";
import { searchTeachers, createTeacher } from "../../service";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import { encryptPassword } from "@/app/(auth)/login/service";

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    const validatedParams = TeacherSearchRequestSchema.parse(queryParams);
    const { startDate, endDate, page, limit } = validatedParams;

    let [teachers, total] = await searchTeachers({
      startDate,
      endDate,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<TeacherSearchResponse>({
      data: teachers,
      total,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requestData = CreateTeacherRequestSchema.parse(await request.json());
    const { password, passwordConfirm } = requestData;

    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    const {
      locationId,
      majorId,
      passwordConfirm: _,
      ...otherData
    } = requestData;

    const creationData = {
      ...otherData,
      lessonReservedCount: 0,
      registeredAt: new Date(),
      isLeaved: false,
      password: await encryptPassword(password),
      location: {
        connect: { id: locationId },
      },
      major: {
        connect: { id: majorId },
      },
    };

    const { id } = await createTeacher(creationData);

    return NextResponse.json<CreateTeacherResponse>({
      data: {
        id,
      },
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
