import prisma from "@/lib/prisma";
import { beforeAll } from "vitest";
import {
  mockMajors,
  mockLocations,
  mockTeachers,
  mockUsers,
  mockPayments,
  mockLessons,
  mockLessonModifyHistories,
  mockLessonBannedTimes,
  mockWorkingTimes,
  mockOpenHours,
} from "./mocks";

beforeAll(async () => {
  // 기본 데이터 생성
  await prisma.major.createMany({ data: mockMajors });
  await prisma.location.createMany({ data: mockLocations });
  await prisma.teacher.createMany({ data: mockTeachers });
  await prisma.user.createMany({ data: mockUsers });

  // 결제 데이터 생성
  await prisma.payment.createMany({ data: mockPayments });

  // 레슨 관련 데이터 생성
  await prisma.lesson.createMany({ data: mockLessons });
  await prisma.lessonModifyHistory.create({
    data: mockLessonModifyHistories[0],
  });
  await prisma.lessonBannedTimes.create({ data: mockLessonBannedTimes[0] });

  // 근무 시간 및 운영 시간 데이터 생성
  await prisma.workingTime.createMany({ data: mockWorkingTimes });
  await prisma.openHours.create({ data: mockOpenHours[0] });
});
