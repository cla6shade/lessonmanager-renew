import { NextRequest, NextResponse } from "next/server";
import {
  CreateUserRequestSchema,
  CreateUserResponse,
  UserSearchRequestSchema,
  UserSearchResponse,
} from "./schema";
import { searchUsers } from "../../service";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { encryptPassword } from "@/app/(auth)/login/service";

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const queryParams = {
      name: searchParams.get("name") || undefined,
      contact: searchParams.get("contact") || undefined,
      birthDate: searchParams.get("birthDate") || undefined,
      locationId:
        searchParams.get("locationId") === null
          ? undefined
          : searchParams.get("locationId"),
      filter: searchParams.get("filter") || "ALL",
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    };

    const validatedParams = UserSearchRequestSchema.parse(queryParams);
    const { name, contact, birthDate, locationId, filter, page, limit } =
      validatedParams;

    let [users, total] = await searchUsers({
      name,
      contact,
      birthDate,
      locationId,
      filter,
      page,
      limit,
    });

    const totalPages = Math.ceil(limit ? total / limit : 1);

    return NextResponse.json<UserSearchResponse>({
      data: users,
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
    let requestData = CreateUserRequestSchema.parse(await request.json());
    const { password, passwordConfirm } = requestData;
    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: "패스워드가 일치하지 않습니다." },
        { status: 400 }
      );
    }
    const creationData = {
      ...requestData,
      teacherInChargeId: null,
      latestLessonId: null,
      lessonCount: 0,
      usedLessonCount: 0,
      paymentCount: 0,
      streakCount: 0,
      isLeaved: false,
      isSubscribed: true,
      point: 0,

      password: await encryptPassword(password),
      passwordConfirm: undefined,
    };
    const { id } = await prisma.user.create({
      data: creationData,
    });
    return NextResponse.json<CreateUserResponse>({
      data: {
        id,
      },
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
