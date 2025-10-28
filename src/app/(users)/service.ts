import prisma from '@/lib/prisma';
import { UserSearchRequest, UserSearchResult } from './api/users/schema';
import { Prisma } from '@/generated/prisma';
import { getPaginationQuery } from '../utils';
import { getOneWeekAfterStart, getTomorrowStart, getYesterdayEnd, toKstDate } from '@/utils/date';

export function findUser(userId: number) {
  const { include, omit } = getUserSelectInput();
  return prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include,
    omit,
  });
}

export async function checkDuplicateUser(loginId: string, email: string) {
  const [loginIdExists, emailExists] = await Promise.all([
    prisma.user.findFirst({
      where: { loginId },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { email },
      select: { id: true },
    }),
  ]);

  return {
    loginIdExists: !!loginIdExists,
    emailExists: !!emailExists,
  };
}

export type UserSearchArgs = UserSearchRequest;

export async function searchUsers(req: UserSearchArgs): Promise<[UserSearchResult[], number]> {
  const strategy = userFilterStrategies[req.filter] ?? userFilterStrategies.ALL;
  const where = await strategy(req);
  const select = getUserSelectInput();
  const pagination = getPaginationInput(req);
  return findUsers(where, select, pagination);
}

const userFilterStrategies: Record<
  NonNullable<UserSearchArgs['filter']>,
  (req: UserSearchArgs) => Promise<Prisma.UserWhereInput>
> = {
  ALL: async (req) => getUserWhereInput(req),

  ACTIVE: async (req) => ({
    ...getUserWhereInput(req),
    payments: {
      some: {
        AND: [
          { endDate: { gte: toKstDate(getYesterdayEnd()) } },
          { refunded: false },
          { isStartDateNonSet: false },
        ],
      },
    },
  }),

  ONE_DAY_BEFORE_LESSON: async (req) => ({
    ...getUserWhereInput(req),
    lessons: { some: { dueDate: toKstDate(getTomorrowStart()) } },
  }),

  ONE_WEEK_BEFORE_REREGISTER: async (req) => ({
    ...getUserWhereInput(req),
    payments: {
      some: { endDate: toKstDate(getOneWeekAfterStart()), refunded: false },
    },
  }),

  BIRTHDAY: async (req) => {
    const userIds = await getBirthdayUserIds();
    return { ...getUserWhereInput(req), id: { in: userIds } };
  },

  STARTDATE_NON_SET: async (req) => ({
    ...getUserWhereInput(req),
    payments: { some: { isStartDateNonSet: true } },
  }),

  MORE_THAN_6_MONTHS: async (req) => {
    const userIds = await getUserIdsByTotalMonths(6);
    return { ...getUserWhereInput(req), id: { in: userIds } };
  },
};

async function findUsers(
  where: Prisma.UserWhereInput,
  selectInput: ReturnType<typeof getUserSelectInput>,
  pagination?: { skip: number; take: number },
): Promise<[UserSearchResult[], number]> {
  return Promise.all([
    prisma.user.findMany({ where, ...selectInput, ...(pagination ?? {}) }),
    prisma.user.count({ where }),
  ]);
}

export async function getBirthdayUserIds(): Promise<number[]> {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const rows = await prisma.$queryRaw<{ userid: number }[]>`
    SELECT userid FROM users WHERE MONTH(birth) = ${month} AND DAY(birth) = ${day}
  `;
  return rows.map((r) => r.userid);
}

export async function getUserIdsByTotalMonths(minMonths: number) {
  const payments = await prisma.payment.groupBy({
    by: ['userId'],
    _sum: { months: true },
    having: { months: { _sum: { gte: minMonths } } },
  });
  return payments.map((p) => p.userId);
}

export function getUserSelectInput() {
  const yesterdayEnd = getYesterdayEnd();
  return {
    include: {
      location: true,
      teacherInCharge: {
        select: { id: true, name: true, major: true, location: true },
      },
      latestLesson: true,
      payments: {
        orderBy: { endDate: 'desc' as const },
        where: {
          OR: [
            { isStartDateNonSet: true },
            {
              AND: {
                refunded: false,
                endDate: { gte: toKstDate(yesterdayEnd) },
              },
            },
          ],
        },
        take: 1,
      },
    },
    omit: { password: true },
    orderBy: { registeredAt: 'desc' as const },
  };
}

export function getPaginationInput({
  page,
  limit,
}: Partial<Pick<UserSearchRequest, 'page' | 'limit'>> = {}) {
  return page && limit ? getPaginationQuery(page, limit) : undefined;
}

export function getUserWhereInput({
  name,
  contact,
  locationId,
  birthDate,
}: Partial<UserSearchArgs>): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { isLeaved: false };
  if (name) where.name = { contains: name };
  if (contact) where.contact = { contains: contact };
  if (locationId !== undefined) where.locationId = locationId;
  if (birthDate) where.birth = birthDate;
  return where;
}

export function setUserLatestLesson(userId: number, lessonId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      latestLessonId: lessonId,
    },
  });
}

export function setTeacherInCharge(userId: number, teacherId: number) {
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

export function addLessonCount(userId: number, count: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lessonCount: {
        increment: count,
      },
    },
  });
}

export function restoreLessonCount(userId: number, count: number) {
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

export function consumeLessonCount(userId: number, count: number) {
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

export function getUserPaymentsInRange(startDate: Date, endDate: Date, userIds?: number[]) {
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
          endDate: 'desc',
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
        AND: [{ startDate: { gte: startDate } }, { startDate: { lte: endDate } }],
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
