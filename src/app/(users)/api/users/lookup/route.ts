import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { UserLookupRequestSchema, UserLookupResponse } from "./schema";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const { query: q } = UserLookupRequestSchema.parse({ query });
    const users = await prisma.user.findMany({
      where: {
        OR: q ? [{ name: { contains: q } }, { contact: { contains: q } }] : [],
      },
      select: {
        id: true,
        name: true,
        contact: true,
        birth: true,
      },
    });
    return NextResponse.json<UserLookupResponse>({
      data: users,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
