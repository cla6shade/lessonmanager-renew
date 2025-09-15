import { WorkingTimeData } from "@/features/table/types";
import prisma from "@/lib/prisma";
import { getWorkingDayOfWeek } from "@/utils/date";
import { LessonSearchParams, LessonSearchResult } from "./schema";
import { CreateLessonRequest } from "./api/lessons/schema";
import { Lesson } from "@/generated/prisma";
import { hasLessonCount } from "../(users)/service";

export async function getLessons({
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

export async function createLesson(
  {
    dueDate,
    dueHour,
    locationId,
    isGrand,
    teacherId: targetTeacherId,
    userId: targetUserId,
    username,
    contact,
  }: CreateLessonRequest,
  { isAdmin, createdById }: { isAdmin: boolean; createdById: number }
) {
  let lessonCreation: Promise<Lesson>;
  if (!isAdmin) {
    lessonCreation = prisma.lesson.create({
      data: {
        dueDate,
        dueHour,
        teacherId: targetTeacherId,
        userId: targetUserId,
        contact,
        username,
        locationId,
        isGrand,
      },
    });
  } else {
    lessonCreation = prisma.lesson.create({
      data: {
        dueDate,
        dueHour,
        teacherId: targetTeacherId,
        userId: targetUserId,
        locationId,
        isGrand,
      },
    });
  }
}

export async function canCreateLesson({
  isAdmin,
  userId,
}: {
  isAdmin: boolean;
  userId: number;
}) {
  if (!isAdmin) {
    return hasLessonCount(userId);
  }
  return true;
}

export async function updateLesson(
  lessonId: number,
  { note, isDone }: { note?: string; isDone?: boolean }
) {
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

export async function isAvaliableAt(
  date: Date,
  hour: number,
  isGrand: boolean
) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      dueDate: date,
      dueHour: hour,
      isGrand: isGrand,
    },
  });
  return !lesson;
}

export async function isTeacherAvaliableAt(
  teacherId: number,
  date: Date,
  hour: number
) {
  const workingTime = await prisma.workingTime.findUnique({
    where: {
      teacherId: teacherId,
    },
  });
  if (!workingTime) {
    return false;
  }
  const workingTimeData = JSON.parse(workingTime.times) as WorkingTimeData;
  return workingTimeData[
    getWorkingDayOfWeek(date) as keyof WorkingTimeData
  ]?.includes(hour);
}
