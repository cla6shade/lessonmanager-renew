import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { SendSMSRequestSchema } from "./schema";

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { receiverType, message, targets, selectAll } =
      SendSMSRequestSchema.parse(request.body);
  } catch (error) {
    return buildErrorResponse(error);
  }
}
