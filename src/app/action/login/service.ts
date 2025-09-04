"use server";

import { Teacher, User } from "@/generated/zod";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export function encryptPassword(password: string) {
  password = password + process.env.PASSWORD_SALT;
  let algo = crypto.createHash("sha512");
  let hash = algo.update(password);
  return hash.digest("base64");
}

export async function canLogin(user: Teacher | User, isAdmin: boolean) {
  if (isAdmin) return true;
  const latestPayment = await prisma.payment.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUser(
  loginId: string,
  password: string,
  isAdmin: boolean
) {
  password = encryptPassword(password);
  const user = isAdmin
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
  return user;
}
