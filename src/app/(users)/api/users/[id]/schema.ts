import {
  PublicUserSchema,
  PublicTeacherSchema,
  DataResponseSchema,
} from "@/app/schema";
import { LocationSchema, LessonSchema } from "@/generated/zod";
import { toKstDate } from "@/utils/date";
import z from "zod";
import { UserSearchResultSchema } from "../schema";

export const PublicUserDetailSchema = PublicUserSchema.extend({
  location: LocationSchema,
  teacherInCharge: PublicTeacherSchema.nullable(),
  latestLesson: LessonSchema.nullable(),
});

export const PublicUserDetailResponseSchema = DataResponseSchema(
  PublicUserDetailSchema
);

export type PublicUserDetailResponse = z.infer<
  typeof PublicUserDetailResponseSchema
>;

export const UpdateUserRequestSchema = z.object({
  name: z
    .string()
    .min(1, "이름은 필수입니다")
    .max(20, "이름은 20자 이하여야 합니다"),
  contact: z.string().optional(),
  birth: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
  address: z.string().optional(),
  email: z.email("올바른 이메일 형식이 아닙니다").optional(),
  ability: z.string().optional(),
  genre: z.string().optional(),
  locationId: z.number().int("올바른 지점을 선택해주세요"),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

export const UpdateUserResponseSchema = DataResponseSchema(
  UserSearchResultSchema
);

export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
