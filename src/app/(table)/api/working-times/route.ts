import { NextRequest, NextResponse } from "next/server";
import {
  GetWorkingTimesResponse,
  UpdateWorkingTimeRequestSchema,
  UpdateWorkingTimeResponse,
} from "./schema";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import { getWorkingTimes, updateWorkingTime } from "../../service";

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = UpdateWorkingTimeRequestSchema.parse(
      await request.json()
    );

    const times = await updateWorkingTime(requestData);

    return NextResponse.json<UpdateWorkingTimeResponse>({ data: times });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const times = await getWorkingTimes();

    return NextResponse.json<GetWorkingTimesResponse>({ data: times });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
