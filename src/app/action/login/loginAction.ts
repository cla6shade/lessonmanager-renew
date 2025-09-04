"use server";

import { z } from "zod";
import { ActionState } from "../types";
import { LoginSchema } from "./schema";
import { canLogin, getAccount } from "./service";
import { createSession } from "@/lib/session";

export const loginAction = async (
  state: ActionState<typeof LoginSchema>,
  formData: FormData
): Promise<ActionState<typeof LoginSchema>> => {
  const authInfo = LoginSchema.safeParse({
    loginId: formData.get("loginId"),
    password: formData.get("password"),
    isAdmin: formData.get("isAdmin"),
  });
  if (!authInfo.success) {
    return {
      success: false,
      errors: z.flattenError(authInfo.error),
    };
  }
  const { loginId, password, isAdmin } = authInfo.data;
  const account = await getAccount(loginId, password, isAdmin);
  if (!account) {
    return {
      success: false,
      errorMessage: "아이디나 비밀번호를 확인한 후 다시 시도해주세요.",
    };
  }
  if (!(await canLogin(account, isAdmin))) {
    return {
      success: false,
      errorMessage: "수강 기간이 아닙니다.",
    };
  }
  await createSession({
    isAdmin,
    teacherId: account.id,
    userId: account.id,
    name: account.name,
  });
  return {
    success: true,
  };
};
