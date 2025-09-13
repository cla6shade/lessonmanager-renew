import { LessonSearchParamsSchema } from "@/app/(lessons)/schema";
import { z } from "zod";
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
  select: {
    id: true;
    name: true;
    major: true;
    workingTime: true;
    location: true;
  };
}>;
