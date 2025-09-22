import { NextRequest, NextResponse } from "next/server";
import { UserSearchRequestSchema, UserSearchResponse } from "./schema";
import { searchUsers } from "../../service";
import { buildErrorResponse } from "@/app/utils";
import { getSession } from "@/lib/session";

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
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
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

    const totalPages = Math.ceil(total / limit);

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
