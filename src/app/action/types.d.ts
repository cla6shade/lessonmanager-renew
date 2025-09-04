import { z } from "zod";

// errors는 zod safeParse 실패 시 반환
// errorMessage는 zod safeParse가 아닌 다른 에러 발생 시 메시지 반환
export type ActionState<T extends z.ZodType> = {
  success: boolean;
  errors?: z.core.$ZodFlattenedError<T>;
  errorMessage?: string;
};
