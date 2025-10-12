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
  birthDate,
  filter,
  page,
  limit,
}: UserSearchRequest): Promise<[RawUserSearchResult[], number]> {
  let where = getUserWhereInput({ name, contact, locationId, birthDate });
  const userSelectInput = getUserSelectInput();
  const paginationInput = getPaginationInput({ page, limit });

  switch (filter) {
    case "ALL":
      return findUsers(where, userSelectInput, paginationInput);

    case "ACTIVE":
      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 0);
      where = {
        ...where,
        payments: {
          some: {
            AND: [
              { endDate: { gte: toKstDate(yesterdayEnd) } },
              { refunded: false },
              { isStartDateNonSet: false },
            ],
          },
        },
      };
      return findUsers(where, userSelectInput, paginationInput);

    case "ONE_DAY_BEFORE_LESSON":
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      where = {
        ...where,
        lessons: {
          some: {
            dueDate: toKstDate(tomorrow),
          },
        },
      };
      return findUsers(where, userSelectInput, paginationInput);

    case "ONE_WEEK_BEFORE_REREGISTER":
      const oneWeekAfter = new Date();
      oneWeekAfter.setDate(oneWeekAfter.getDate() + 7);
      oneWeekAfter.setHours(0, 0, 0, 0);
      where = {
        ...where,
        payments: {
          some: {
            endDate: toKstDate(oneWeekAfter),
            refunded: false,
          },
        },
      };
      return findUsers(where, userSelectInput, paginationInput);

    case "BIRTHDAY":
      const userIds = await getBirthdayUserIds();
      where = {
        ...where,
        id: { in: userIds },
      };
      return findUsers(where, userSelectInput, paginationInput);

    case "STARTDATE_NON_SET":
      where = {
        ...where,
        payments: { some: { isStartDateNonSet: true } },
      };
      return findUsers(where, userSelectInput, paginationInput);

    case "MORE_THAN_6_MONTHS":
      return getLongTermUsers({ page, limit }, where);

    default:
      return findUsers(where, userSelectInput, paginationInput);
  }
}

export async function getBirthdayUserIds(): Promise<number[]> {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const rows = await prisma.$queryRaw<{ userid: number }[]>`
  SELECT userid
  FROM users
  WHERE MONTH(birth) = ${month} AND DAY(birth) = ${day}
`;

  return rows.map((r) => r.userid);
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

  return findUsers(
    where,
    getUserSelectInput(),
    getPaginationInput({ page, limit })
  );
}

async function findUsers(
  where: Prisma.UserWhereInput,
  selectInput: Omit<UserSearchSelectInput, "skip" | "take">,
  paginationInput: { skip: number; take: number }
): Promise<[RawUserSearchResult[], number]> {
  return Promise.all([
    prisma.user.findMany({ where, ...selectInput, ...paginationInput }),
    getUserTotalCount(where),
  ]);
}

export async function findUser(id: number) {
  return prisma.user.findFirstOrThrow({
    where: { id },
    ...getUserSelectInput(),
  });
}

export function getUserTotalCount(where: Prisma.UserWhereInput) {
  return prisma.user.count({ where });
}

export function getUserSelectInput(): Omit<
  UserSearchSelectInput,
  "skip" | "take"
> {
  const yesterdayEnd = new Date();
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 0);
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
          // isStartDateNonSet: false,
          OR: [
            { isStartDateNonSet: true },
            {
              AND: {
                refunded: false,
                endDate: {
                  gte: toKstDate(yesterdayEnd),
                },
              },
            },
          ],
        },
        take: 1,
      },
    },
    omit: { password: true },
    orderBy: { registeredAt: "desc" as const },
  };
}

export function getPaginationInput({
  page,
  limit,
}: Pick<UserSearchRequest, "page" | "limit">) {
  return getPaginationQuery(page, limit);
}

export function getUserWhereInput({
  name,
  contact,
  locationId,
  birthDate,
}: Partial<UserSearchRequest>) {
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
  if (birthDate) {
    whereInput.birth = birthDate;
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

export async function getUserPaymentsInRange(
  startDate: Date,
  endDate: Date,
  userIds?: number[]
) {
  return prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
      payments: {
        some: getRangedPaymentWhereInput(startDate, endDate),
      },
    },
    include: {
      payments: {
        where: getRangedPaymentWhereInput(startDate, endDate),
        orderBy: {
          endDate: "desc",
        },
        take: 1,
      },
    },
  });
}

function getRangedPaymentWhereInput(startDate: Date, endDate: Date) {
  return {
    refunded: false,
    OR: [
      {
        AND: [
          { startDate: { gte: startDate } },
          { startDate: { lte: endDate } },
        ],
      },
      {
        AND: [{ endDate: { gte: startDate } }, { endDate: { lte: endDate } }],
      },
      {
        AND: [{ startDate: { lte: startDate } }, { endDate: { gte: endDate } }],
      },
    ],
  };
}
