import { Teacher, User } from "@/generated/zod";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export function encryptPassword(password: string) {
  password = password + process.env.PASSWORD_SALT;
  const algo = crypto.createHash("sha512");
  const hash = algo.update(password);
  return hash.digest("base64");
}

export async function canLogin(account: Teacher | User, isAdmin: boolean) {
  if (isAdmin) return true;
  const latestPayment = await prisma.payment.findFirst({
    where: {
      userId: account.id,
      refunded: false,
      OR: [{ isStartDateNonSet: true }, { endDate: { gte: new Date() } }],
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return !!latestPayment;
}

export async function getAccount(
  loginId: string,
  password: string,
  isAdmin: boolean
) {
  password = encryptPassword(password);
  const account = isAdmin
    ? await prisma.teacher.findFirst({
        where: {
          loginId,
          password,
        },
      })
    : await prisma.user.findFirst({
        where: {
          loginId,
          password,
        },
      });
  return account;
}
