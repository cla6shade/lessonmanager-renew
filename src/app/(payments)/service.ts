import prisma from "@/lib/prisma";
import { toKstDate } from "@/utils/date";
import { CreatePaymentRequest } from "./api/payments/schema";

export async function isLessonDueInPayment(lessonDue: Date, userId: number) {
  const payments = await prisma.payment.findMany({
    where: {
      userId,
      refunded: false,
      isStartDateNonSet: false,
      endDate: {
        gte: lessonDue,
      },
    },
  });
  return payments.length > 0;
}

export async function isUserInPayment(userId: number) {
  const payments = await prisma.payment.findMany({
    where: {
      userId,
      refunded: false,
      isStartDateNonSet: false,
      endDate: {
        gte: toKstDate(new Date()),
      },
    },
  });
  return payments.length > 0;
}

export function createPayment(data: CreatePaymentRequest) {
  return prisma.payment.create({
    data,
  });
}
