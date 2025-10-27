import prisma from '@/lib/prisma';
import {
  GetBannedTimesQuery,
  CreateBannedTimeRequest,
  UpdateBannedTimesRequest,
} from './api/bans/schema';
import { UpdateWorkingTimeRequest, WorkingTimeData } from './api/working-times/schema';

export async function getBannedTimes({ startDate, endDate, teacherId }: GetBannedTimesQuery) {
  return prisma.lessonBannedTimes.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      ...(teacherId !== undefined ? { teacherId } : {}),
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function createBannedTime({ teacherId, date, hour }: CreateBannedTimeRequest) {
  return prisma.lessonBannedTimes.create({
    data: {
      teacherId,
      date,
      hour,
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function updateBannedTimes({ deleteIds, bannedTimes }: UpdateBannedTimesRequest) {
  return prisma.$transaction(async (tx) => {
    if (deleteIds.length > 0) {
      await tx.lessonBannedTimes.deleteMany({
        where: {
          id: { in: deleteIds },
        },
      });
    }

    if (bannedTimes.length > 0) {
      await tx.lessonBannedTimes.createMany({
        data: bannedTimes,
      });
    }

    return tx.lessonBannedTimes.findMany({
      include: {
        teacher: { select: { id: true, name: true } },
      },
    });
  });
}

export async function updateWorkingTime(
  requestData: UpdateWorkingTimeRequest,
): Promise<WorkingTimeData> {
  const { teacherId, times } = requestData;
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new Error('존재하지 않는 선생님입니다.');
  }

  await prisma.workingTime.update({
    where: {
      teacherId,
    },
    data: {
      times: JSON.stringify(times),
    },
  });

  return times;
}

export async function getWorkingTimes() {
  const times = await prisma.workingTime.findMany({
    where: {
      teacher: {
        isLeaved: false,
        isManager: false,
      },
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          major: true,
          location: true,
        },
      },
    },
  });

  return times.map((time) => {
    return {
      teacherId: time.teacherId,
      times: JSON.parse(time.times) as WorkingTimeData,
      teacher: time.teacher,
    };
  });
}

export async function initWorkingTime(teacherId: number) {
  return prisma.workingTime.create({
    data: {
      teacherId,
      times: JSON.stringify({
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: [],
      }),
    },
  });
}
