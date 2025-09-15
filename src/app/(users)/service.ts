import prisma from "@/lib/prisma";

export async function hasLessonCount(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user && user.lessonCount > 0;
}

export async function addLessonCount(userId: number, count: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lessonCount: {
        increment: count,
      },
    },
  });
}

export async function restoreLessonCount(userId: number, count: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lessonCount: {
        increment: count,
      },
      usedLessonCount: {
        decrement: count,
      },
    },
  });
}

export async function useLessonCount(userId: number, count: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lessonCount: {
        decrement: count,
      },
      usedLessonCount: {
        increment: count,
      },
    },
  });
}
