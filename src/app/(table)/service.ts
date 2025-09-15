import prisma from "@/lib/prisma";
import {
  GetBannedTimesQuery,
  CreateBannedTimeRequest,
  UpdateBannedTimesRequest,
} from "./api/bans/schema";

export async function getBannedTimes({
  startDate,
  endDate,
  teacherId,
}: GetBannedTimesQuery) {
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

export async function createBannedTime({
  teacherId,
  date,
  hour,
}: CreateBannedTimeRequest) {
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

export async function updateBannedTimes({
  deleteIds,
  bannedTimes,
}: UpdateBannedTimesRequest) {
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
