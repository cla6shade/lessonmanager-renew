import prisma from '@/lib/prisma';
import { getTomorrowStart, getWorkingDayOfWeek } from '@/utils/date';
import { LessonSearchParams, LessonSearchResult } from './schema';
import { CreateLessonByAdminInput, CreateLessonByUserInput } from './api/lessons/schema';
import { Lesson } from '@/generated/prisma';
import { WorkingTimeData } from '../(table)/api/working-times/schema';

export function cancelLesson(lessonId: number) {
  return prisma.lesson.delete({
    where: { id: lessonId },
  });
}

export function isOwnLesson({ lesson, userId }: { lesson: Lesson; userId: number }) {
  return lesson.userId === userId;
}

export function isBeforeCancelDeadline({
  lesson,
  requestedAt,
}: {
  lesson: Lesson;
  requestedAt: Date;
}) {
  const cancelDeadline = new Date(lesson.dueDate);
  cancelDeadline.setDate(cancelDeadline.getDate() - 1);
  cancelDeadline.setHours(21, 0, 0, 0);
  return requestedAt < cancelDeadline;
}
export function getLessons({
  startDate,
  endDate,
  selectedTeacherId: teacherId,
  selectedLocationId: locationId,
}: LessonSearchParams): Promise<LessonSearchResult> {
  return prisma.lesson.findMany({
    where: {
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
      ...(teacherId !== undefined ? { teacherId } : {}),
      ...(locationId !== undefined ? { locationId } : {}),
    },
    include: {
      location: true,
      teacher: {
        select: {
          id: true,
          name: true,
          major: true,
        },
      },
    },
    omit: {
      contact: true,
      note: true,
    },
  });
}

export function createLessonByAdmin({
  dueDate,
  dueHour,
  teacherId,
  userId,
  locationId,
  isGrand,
  contact,
  username,
}: CreateLessonByAdminInput) {
  return prisma.lesson.create({
    data: {
      dueDate,
      dueHour,
      teacherId,
      userId: userId || null,
      locationId,
      isGrand,
      contact,
      username,
    },
  });
}

export function createLessonByUser(
  { dueDate, dueHour, teacherId, locationId, isGrand }: CreateLessonByUserInput,
  userId: number,
  username: string,
) {
  return prisma.lesson.create({
    data: {
      dueDate,
      dueHour,
      teacherId,
      locationId,
      isGrand,
      userId,
      username,
    },
  });
}

export async function updateUserLessonInfo(lessonId: number, isDone?: boolean) {
  const lesson = await prisma.lesson.findUniqueOrThrow({
    where: { id: lessonId },
    include: { user: true },
  });
  if (!lesson.user) return;

  if (isDone) {
    return prisma.user.update({
      where: {
        id: lesson.user.id,
      },
      data: {
        latestLessonId: lessonId,
        teacherInChargeId: lesson.teacherId,
      },
    });
  }

  const latestLesson = await prisma.lesson.findFirst({
    where: { userId: lesson.user.id, isDone: true },
    orderBy: { dueDate: 'desc', dueHour: 'desc' },
  });
  if (!latestLesson) return;
  return prisma.user.update({
    where: {
      id: lesson.user.id,
    },
    data: {
      latestLessonId: latestLesson.id,
      teacherInChargeId: latestLesson.teacherId,
    },
  });
}

export async function updateLesson(
  lessonId: number,
  { note, isDone }: { note?: string; isDone?: boolean },
) {
  await updateUserLessonInfo(lessonId, isDone);
  return prisma.lesson.update({
    where: { id: lessonId },
    data: { note, isDone },
    include: {
      location: true,
      teacher: {
        select: {
          id: true,
          name: true,
          major: true,
        },
      },
    },
  });
}

export async function isBannedAt(date: Date, hour: number, teacherId: number) {
  const bannedTime = await prisma.lessonBannedTimes.findFirst({
    where: {
      teacherId: teacherId,
      date: date,
      hour: hour,
    },
  });
  return !!bannedTime;
}
export async function isAvailableAt(
  date: Date,
  hour: number,
  locationId: number,
  teacherId: number,
  isGrand: boolean,
) {
  const overlap = await prisma.lesson.findFirst({
    where: {
      dueDate: date,
      dueHour: hour,
      locationId,
      OR: [
        // 같은 시간대 동일한 grand 여부는 하나만 가능
        { isGrand },
        // 같은 시간대 동일한 선생님은 하나만 가능
        { teacherId },
      ],
    },
  });

  return !overlap;
}

export async function isTeacherAvailableAt(teacherId: number, date: Date, hour: number) {
  const workingTime = await prisma.workingTime.findUnique({
    where: {
      teacherId: teacherId,
    },
  });
  if (!workingTime) {
    return false;
  }
  const workingTimeData = JSON.parse(workingTime.times) as WorkingTimeData;
  return workingTimeData[getWorkingDayOfWeek(date) as keyof WorkingTimeData]?.includes(hour);
}

export async function getTomorowLesson(userId: number) {
  const date = getTomorrowStart();
  return prisma.lesson.findFirst({
    where: {
      dueDate: date,
      userId,
    },
    orderBy: {
      dueHour: 'asc',
    },
  });
}
