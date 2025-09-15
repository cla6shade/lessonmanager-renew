import { NextRequest, NextResponse } from "next/server";
import {
  GetBannedTimesQuerySchema,
  GetBannedTimesResponse,
  CreateBannedTimeRequestSchema,
  CreateBannedTimeResponse,
  UpdateBannedTimesRequestSchema,
  UpdateBannedTimesResponse,
} from "./schema";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import {
  getBannedTimes,
  createBannedTime,
  updateBannedTimes,
} from "../../service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const { startDate, endDate, teacherId } =
      GetBannedTimesQuerySchema.parse(rawQuery);

    const bannedTimes = await getBannedTimes({
      startDate,
      endDate,
      teacherId,
    });

    return NextResponse.json<GetBannedTimesResponse>({ data: bannedTimes });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = CreateBannedTimeRequestSchema.parse(
      await request.json()
    );
    const bannedTime = await createBannedTime(requestData);

    return NextResponse.json<CreateBannedTimeResponse>({ data: bannedTime });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = UpdateBannedTimesRequestSchema.parse(
      await request.json()
    );
    const bannedTimes = await updateBannedTimes(requestData);

    return NextResponse.json<UpdateBannedTimesResponse>({ data: bannedTimes });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
