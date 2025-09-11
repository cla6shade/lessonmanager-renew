import { DataResponseSchema } from "@/app/schema";
import {
  LessonSchema,
  LocationSchema,
  MajorSchema,
  TeacherSchema,
} from "@/generated/zod";
import z from "zod";

export const GetLessonDetailResponseSchema = DataResponseSchema(
  LessonSchema.extend({
    teacher: TeacherSchema.pick({
      id: true,
      name: true,
    }).extend({
      major: MajorSchema,
    }),
    location: LocationSchema,
  })
);

export type GetLessonDetailResponse = z.infer<
  typeof GetLessonDetailResponseSchema
>;

export const UpdateLessonRequestSchema = LessonSchema.pick({
  note: true,
  isDone: true,
});

export type UpdateLessonRequest = z.infer<typeof UpdateLessonRequestSchema>;

export type UpdateLessonResponse = GetLessonDetailResponse;
