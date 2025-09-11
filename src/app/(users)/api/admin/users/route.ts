import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getPaginationQuery, buildErrorResponse } from "@/app/utils";
import { UserSearchRequestSchema, UserSearchResponse } from "./schema";
import { Prisma } from "@/generated/prisma";

export default async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      name: searchParams.get("name") || undefined,
      contact: searchParams.get("contact") || undefined,
      locationId: searchParams.get("locationId") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    const validatedParams = UserSearchRequestSchema.parse(queryParams);
    const { name, contact, locationId, page, limit } = validatedParams;
    const whereConditions = getWhereConditions(name, contact, locationId);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        include: {
          location: true,
          teacherInCharge: {
            omit: {
              password: true,
            },
          },
          latestLesson: true,
        },
        omit: {
          password: true,
        },
        orderBy: {
          registeredAt: "desc",
        },
        ...getPaginationQuery(page, limit),
      }),
      prisma.user.count({
        where: whereConditions,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<UserSearchResponse>({
      data: users,
      total,
      totalPages,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

function getWhereConditions(
  name?: string,
  contact?: string,
  locationId?: number
) {
  const whereConditions: Prisma.UserWhereInput = {
    isLeaved: false,
  };

  if (name !== undefined) {
    whereConditions.name = {
      contains: name,
    };
  }

  if (contact !== undefined) {
    whereConditions.contact = {
      contains: contact,
    };
  }

  if (locationId !== undefined) {
    whereConditions.locationId = locationId;
  }
  return whereConditions;
}
