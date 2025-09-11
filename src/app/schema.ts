import {
  LessonSchema,
  LocationSchema,
  TeacherSchema,
  UserSchema,
} from "@/generated/zod";
import z from "zod";

export const DataResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

export const PaginatedDataResponseSchema = <T extends z.ZodType>(
  dataSchema: T
) =>
  DataResponseSchema(dataSchema).extend({
    total: z.number(),
    totalPages: z.number(),
  });

export type DataResponse<T extends z.ZodType> = z.infer<
  typeof DataResponseSchema<T>
>;

export type PaginatedDataResponse<T extends z.ZodType> = z.infer<
  typeof PaginatedDataResponseSchema<T>
>;

export const PublicUserSchema = UserSchema.omit({
  password: true,
});

export const PublicTeacherSchema = TeacherSchema.omit({
  password: true,
});

export const PublicUserDetailSchema = PublicUserSchema.extend({
  location: LocationSchema,
  teacherInCharge: PublicTeacherSchema.nullable(),
  latestLesson: LessonSchema.nullable(),
});

export type PublicUser = z.infer<typeof PublicUserSchema>;
export type PublicTeacher = z.infer<typeof PublicTeacherSchema>;
