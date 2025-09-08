import { Prisma } from "@/generated/prisma";

interface WorkingTimeData {
  mon: number[];
  tue: number[];
  wed: number[];
  thu: number[];
  fri: number[];
  sat: number[];
  sun: number[];
}

export type ExtendedTeacher = Prisma.TeacherGetPayload<{
  include: {
    workingTime: true;
    major: true;
  };
}>;
