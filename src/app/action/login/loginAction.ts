"use server";

import { z } from "zod";
import { ActionState } from "../types";
import { LoginSchema } from "./schema";
import { getUser } from "./service";

export const loginAction = async (
  state: ActionState<typeof LoginSchema>,
  formData: FormData
) => {
  const authInfo = LoginSchema.safeParse(formData);
  if (!authInfo.success) {
    return {
      success: false,
      errors: z.flattenError(authInfo.error),
    };
  }
  const { loginId, password, isAdmin } = authInfo.data;
  const user = await getUser(loginId, password, isAdmin);
  return {
    success: true,
    errors: null,
  };
};
