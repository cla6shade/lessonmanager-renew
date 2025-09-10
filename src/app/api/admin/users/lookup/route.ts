import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { UserLookupRequestSchema, UserLookupResponse } from "./schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const { query: q } = UserLookupRequestSchema.parse({ query });
  const users = await prisma.user.findMany({
    where: {
      OR: [{ name: { contains: q } }, { contact: { contains: q } }],
    },
    select: {
      id: true,
      name: true,
      contact: true,
    },
  });
  return NextResponse.json<UserLookupResponse>({
    data: users,
  });
}
