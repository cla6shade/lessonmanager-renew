import prisma from "@/lib/prisma";
import {
  RawUserSearchResult,
  UserSearchFilter,
  UserSearchRequest,
  UserSearchSelectInput,
} from "./api/users/schema";
import { Prisma } from "@/generated/prisma";
import { getPaginationQuery } from "../utils";
import { toKstDate } from "@/utils/date";

export async function searchUsers({
  name,
  contact,
  locationId,
  filter,
  page,
  limit,
}: UserSearchRequest): Promise<[RawUserSearchResult[], number]> {
  let where = getUserWhereInput({ name, contact, locationId });
  const userSelectInput = getUserSelectInput({ page, limit });

  switch (filter) {
    case "ALL":
      return findUsers(where, userSelectInput);

    case "ACTIVE":
      where = {
        ...where,
        payments: {
          some: {
            AND: [
              { startDate: { lte: toKstDate(new Date().toISOString()) } },
              { endDate: { gte: toKstDate(new Date().toISOString()) } },
              { refunded: false },
            ],
          },
        },
      };
      return findUsers(where, userSelectInput);

    case "ONE_DAY_BEFORE_LESSON":
      where = {
        ...where,
        lessons: {
          some: {
            dueDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          },
        },
      };
      return findUsers(where, userSelectInput);

    case "ONE_WEEK_BEFORE_REREGISTER":
      where = {
        ...where,
        payments: {
          some: {
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            refunded: false,
          },
        },
      };
      return findUsers(where, userSelectInput);

    case "BIRTHDAY":
      return getBirthdayUsers(where, userSelectInput);

    case "STARTDATE_NON_SET":
      where = {
        ...where,
        payments: { some: { isStartDateNonSet: true } },
      };
      return findUsers(where, userSelectInput);

    case "MORE_THAN_6_MONTHS":
      return getLongTermUsers({ page, limit }, where);

    default:
      return findUsers(where, userSelectInput);
  }
}

export async function getLongTermUsers(
  { page, limit }: Pick<UserSearchRequest, "page" | "limit">,
  where: Prisma.UserWhereInput
): Promise<[RawUserSearchResult[], number]> {
  const payments = await prisma.payment.groupBy({
    by: ["userId"],
    _sum: { months: true },
    having: { months: { _sum: { gte: 6 } } },
  });

  const userIds = payments.map((p) => p.userId);
  where = {
    id: { in: userIds },
    ...where,
  };

  return findUsers(where, getUserSelectInput({ page, limit }));
}

export async function getBirthdayUsers(
  where: Prisma.UserWhereInput,
  selectInput: UserSearchSelectInput
): Promise<[RawUserSearchResult[], number]> {
  const limit = (selectInput as any).take ?? 20;
  const offset = (selectInput as any).skip ?? 0;

  const name = (where as any).name?.contains;
  const contact = (where as any).contact?.contains;
  const locationId = where.locationId;
  const hasLocationId = locationId !== undefined && locationId !== null;

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const [users, count] = await Promise.all([
    prisma.$queryRaw<RawUserSearchResult[]>`
      SELECT 
        u.userid,
        u.location,
        u.name,
        u.gender,
        u.birth,
        u.contact,
        u.address,
        u.loginid,
        u.email,
        u.ability,
        u.genre,
        u.howto,
        u.teacher_in_charge,
        u.latest_lessonid,
        u.lesson_count,
        u.lesson_count_used,
        u.payment_count,
        u.streak_count,
        u.registration,
        u.leaved,
        u.subscribed,
        u.point
      FROM users u
      WHERE u.leaved = 0
        ${
          hasLocationId
            ? Prisma.sql`AND u.location = ${locationId}`
            : Prisma.empty
        }
        ${name ? Prisma.sql`AND u.name LIKE ${"%" + name + "%"}` : Prisma.empty}
        ${
          contact
            ? Prisma.sql`AND u.contact LIKE ${"%" + contact + "%"}`
            : Prisma.empty
        }
        AND MONTH(u.birth) = ${month}
        AND DAY(u.birth) = ${day}
      ORDER BY u.registration DESC
      LIMIT ${limit} OFFSET ${offset};
    `,
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM users u
      WHERE u.leaved = 0
        ${
          hasLocationId
            ? Prisma.sql`AND u.location = ${locationId}`
            : Prisma.empty
        }
        ${name ? Prisma.sql`AND u.name LIKE ${"%" + name + "%"}` : Prisma.empty}
        ${
          contact
            ? Prisma.sql`AND u.contact LIKE ${"%" + contact + "%"}`
            : Prisma.empty
        }
        AND MONTH(u.birth) = ${month}
        AND DAY(u.birth) = ${day}
    `.then((res) => Number(res[0].count)),
  ]);

  return [users, count];
}

async function findUsers(
  where: Prisma.UserWhereInput,
  selectInput: UserSearchSelectInput
): Promise<[RawUserSearchResult[], number]> {
  return Promise.all([
    prisma.user.findMany({ where, ...selectInput }),
    getUserTotalCount(where),
  ]);
}

export function getUserTotalCount(where: Prisma.UserWhereInput) {
  return prisma.user.count({ where });
}

export function getUserSelectInput({
  page,
  limit,
}: Pick<UserSearchRequest, "page" | "limit">): UserSearchSelectInput {
  return {
    include: {
      location: true,
      teacherInCharge: {
        select: {
          id: true,
          name: true,
          major: true,
          location: true,
        },
      },
      latestLesson: true,
      payments: {
        orderBy: { endDate: "desc" as const },
        where: {
          isStartDateNonSet: false,
          refunded: false,
          startDate: {
            lte: toKstDate(new Date().toISOString()),
          },
          endDate: {
            gte: toKstDate(new Date().toISOString()),
          },
        },
        take: 1,
      },
    },
    omit: { password: true },
    orderBy: { registeredAt: "desc" as const },
    ...getPaginationQuery(page, limit),
  };
}

export function getUserWhereInput({
  name,
  contact,
  locationId,
}: Pick<UserSearchRequest, "name" | "contact" | "locationId">) {
  const whereInput: Prisma.UserWhereInput = { isLeaved: false };

  if (name) {
    whereInput.name = { contains: name };
  }
  if (contact) {
    whereInput.contact = { contains: contact };
  }
  if (locationId !== undefined) {
    whereInput.locationId = locationId;
  }
  return whereInput;
}

export async function setUserLatestLesson(userId: number, lessonId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      latestLessonId: lessonId,
    },
  });
}

export async function setTeacherInCharge(userId: number, teacherId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      teacherInChargeId: teacherId,
    },
  });
}

export async function hasLessonCount(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user && user.lessonCount > 0;
}

export async function addLessonCount(userId: number, count: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lessonCount: {
        increment: count,
      },
    },
  });
}

export async function restoreLessonCount(userId: number, count: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lessonCount: {
        increment: count,
      },
      usedLessonCount: {
        decrement: count,
      },
    },
  });
}

export async function useLessonCount(userId: number, count: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lessonCount: {
        decrement: count,
      },
      usedLessonCount: {
        increment: count,
      },
    },
  });
}
