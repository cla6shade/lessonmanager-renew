import prisma from '@/lib/prisma';
import {
  RawTeacherSearchResult,
  TeacherSearchRequest,
  TeacherSearchResult,
  TeacherSearchSelectInput,
} from './api/teachers/schema';
import { Prisma } from '@/generated/prisma';
import { getPaginationQuery } from '../utils';
import { getLessons } from '../(lessons)/service';
import { getUserPaymentsInRange } from '../(users)/service';

export async function searchTeachers({
  startDate,
  endDate,
  page,
  limit,
}: TeacherSearchRequest): Promise<[TeacherSearchResult[], number]> {
  let where: Prisma.TeacherWhereInput = { isLeaved: false };

  const teacherSelectInput = getTeacherSelectInput();
  const paginationInput = getPaginationInput({ page, limit });

  return findTeachers(where, teacherSelectInput, paginationInput, startDate, endDate);
}

async function findTeachers(
  where: Prisma.TeacherWhereInput,
  selectInput: Omit<TeacherSearchSelectInput, 'skip' | 'take'>,
  paginationInput: { skip: number; take: number },
  startDate?: Date,
  endDate?: Date,
): Promise<[TeacherSearchResult[], number]> {
  const [rawTeachers, total] = await Promise.all([
    prisma.teacher.findMany({ where, ...selectInput, ...paginationInput }),
    getTeacherTotalCount(where),
  ]);

  const teachersWithReregisterRate = await combineFractions(rawTeachers, startDate, endDate);

  return [teachersWithReregisterRate, total];
}

export async function findTeacher(id: number) {
  return prisma.teacher.findFirstOrThrow({
    where: { id },
    ...getTeacherSelectInput(),
  });
}

export function getTeacherTotalCount(where: Prisma.TeacherWhereInput) {
  return prisma.teacher.count({ where });
}

export function getTeacherSelectInput(): Omit<TeacherSearchSelectInput, 'skip' | 'take'> {
  return {
    include: {
      location: true,
      major: true,
    },
    omit: { password: true },
    orderBy: { registeredAt: 'desc' as const },
  };
}

export function getPaginationInput({ page, limit }: Pick<TeacherSearchRequest, 'page' | 'limit'>) {
  return getPaginationQuery(page, limit);
}

export async function checkDuplicateTeacher(loginId: string, email: string) {
  const [loginIdExists, emailExists] = await Promise.all([
    prisma.teacher.findFirst({
      where: { loginId },
      select: { id: true },
    }),
    prisma.teacher.findFirst({
      where: { email },
      select: { id: true },
    }),
  ]);

  return {
    loginIdExists: !!loginIdExists,
    emailExists: !!emailExists,
  };
}

export async function createTeacher(data: Prisma.TeacherCreateInput) {
  return prisma.teacher.create({
    data,
  });
}

export async function updateTeacher(id: number, data: Prisma.TeacherUpdateInput) {
  return prisma.teacher.update({
    where: { id },
    data,
  });
}

export async function getUsersInCharge(teacherId: number) {
  return prisma.teacher.findUniqueOrThrow({
    where: {
      id: teacherId,
    },
    include: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function getReregisterFraction(
  startDate: Date,
  endDate: Date,
  teacherId: number,
): Promise<[number, number]> {
  const userIds = (await getUsersInCharge(teacherId)).users.map((user) => user.id);
  const payments = (await getUserPaymentsInRange(startDate, endDate, userIds)).flatMap((user) =>
    user.payments[0] ? [user.payments[0]] : [],
  );

  let [numerator, denominator] = [0, payments.length];
  payments.forEach((payment) => {
    if (!payment) return;
    if (payment.isReregister) {
      numerator += 1;
    }
  });

  return [numerator, denominator];
}

export async function getLessonCompletionFraction(
  startDate: Date,
  endDate: Date,
  teacherId: number,
): Promise<[number, number]> {
  const lessons = await getLessons({
    startDate,
    endDate,
    selectedTeacherId: teacherId,
  });

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) => lesson.isDone).length;

  return [completedLessons, totalLessons];
}

async function combineFractions(
  teachers: RawTeacherSearchResult[],
  startDate?: Date,
  endDate?: Date,
): Promise<TeacherSearchResult[]> {
  return Promise.all(
    teachers.map(async (teacher) => {
      if (startDate && endDate) {
        const [reregisterFraction, lessonCompletionFraction] = await Promise.all([
          getReregisterFraction(startDate, endDate, teacher.id),
          getLessonCompletionFraction(startDate, endDate, teacher.id),
        ]);
        return {
          ...teacher,
          reregisterFraction,
          lessonCompletionFraction,
        };
      }
      return {
        ...teacher,
        reregisterFraction: [0, 0],
        lessonCompletionFraction: [0, 0],
      };
    }),
  );
}

export function removeTeacher(id: number) {
  return prisma.$transaction([
    prisma.teacher.update({
      where: { id },
      data: {
        isLeaved: true,
        gender: null,
        email: null,
        birth: null,
        contact: null,
        loginId: null,
        password: null,
        address: null,
        workingDays: 0,
      },
    }),
    prisma.user.updateMany({
      where: { teacherInChargeId: id },
      data: { teacherInChargeId: null },
    }),
  ]);
}
