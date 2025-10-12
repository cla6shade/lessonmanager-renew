import { LessonSearchParamsSchema } from "@/app/(lessons)/schema";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";

export type ExtendedTeacher = Prisma.TeacherGetPayload<{
  select: {
    id: true;
    name: true;
    major: true;
    workingTime: true;
    location: true;
  };
}>;
