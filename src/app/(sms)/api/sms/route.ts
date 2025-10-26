import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { GetSMSTargetRequestSchema, SendSMSRequestSchema } from "./schema";
// import { sendMessage } from "./service";

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const {
      receiverType,
      message,
      targets,
      isTotalSelected,
      selectedLocationId,
    } = SendSMSRequestSchema.parse(request.body);
    // const sendResult = await sendMessage({
    //   receiverType,
    //   message,
    //   targets,
    //   isTotalSelected,
    //   selectedLocationId,
    // });
    // console.log(sendResult);
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { receiverType, selectedLocationId } =
      GetSMSTargetRequestSchema.parse(request.body);
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}
