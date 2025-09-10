import {
  PublicUserSchema,
  PublicTeacherSchema,
  DataResponseSchema,
} from "@/app/api/schema";
import { LocationSchema, LessonSchema } from "@/generated/zod";
import z from "zod";

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
