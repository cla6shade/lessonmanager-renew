import prisma from "@/lib/prisma";
import { LessonModifierType, LessonModifyType } from "@/utils/constants";

export async function createModifyHistory(
  isAdmin: boolean,
  userId: number | undefined,
  teacherId: number,
  lesson: {
    id: number;
    dueDate: Date;
    dueHour: number;
  },
  createdById: number,
  type: LessonModifyType
) {
  return prisma.lessonModifyHistory.create({
    data: {
      userId,
      teacherId,
      lessonId: lesson.id,
      lessondue: lesson.dueDate,
      lessonhour: lesson.dueHour,
      type,
      createdByType: isAdmin
        ? LessonModifierType.TEACHER
        : LessonModifierType.USER,
      createdById,
    },
  });
}
