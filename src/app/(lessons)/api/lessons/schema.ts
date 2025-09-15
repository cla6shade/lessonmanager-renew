import {
  LessonSchema,
  LocationSchema,
  MajorSchema,
  TeacherSchema,
} from "@/generated/zod";
import { z } from "zod";
import { DataResponseSchema } from "../../../schema";
import { toKstDate } from "@/utils/date";

export const CreateLessonByAdminInputSchema = LessonSchema.pick({
  dueDate: true,
  dueHour: true,
  teacherId: true,
  userId: true,
  locationId: true,
  isGrand: true,
  contact: true,
  username: true,
});

export const CreateLessonByUserInputSchema = LessonSchema.pick({
  dueDate: true,
  dueHour: true,
  teacherId: true,
  locationId: true,
  isGrand: true,
}).strict();

export type CreateLessonByAdminInput = z.infer<
  typeof CreateLessonByAdminInputSchema
>;

export type CreateLessonByUserInput = z.infer<
  typeof CreateLessonByUserInputSchema
>;

export const GetLessonsQuerySchema = z.object({
  startDate: z.iso.datetime().transform(toKstDate),
  endDate: z.iso.datetime().transform(toKstDate),
  teacherId: z.coerce.number().optional(),
  locationId: z.coerce.number().optional(),
});

export const GetLessonsResponseSchema = DataResponseSchema(
  z.array(
    LessonSchema.extend({
      teacher: z.object({
        id: z.number(),
        name: z.string(),
        major: MajorSchema,
      }),
      location: LocationSchema,
    }).omit({
      contact: true,
      note: true,
    })
  )
);

export type GetLessonsResponse = z.infer<typeof GetLessonsResponseSchema>;

export const CreateLessonRequestSchema = LessonSchema.pick({
  dueDate: true,
  dueHour: true,
  teacherId: true,
  userId: true,
  locationId: true,
  isGrand: true,
  contact: true,
  username: true,
}).extend({
  userId: z.coerce.number().optional(),
});

export type CreateLessonRequest = z.infer<typeof CreateLessonRequestSchema>;

export const UpdateLessonsRequestSchema = z.object({
  lessons: LessonSchema.pick({
    id: true,
    note: true,
    isDone: true,
  })
    .extend({
      id: z.coerce.number(),
      note: z.string().optional(),
      isDone: z.boolean().optional(),
    })
    .array(),
});

export type UpdateLessonsRequest = z.infer<typeof UpdateLessonsRequestSchema>;

export const UpdateLessonsResponseSchema = DataResponseSchema(
  LessonSchema.extend({
    teacher: TeacherSchema.pick({
      id: true,
      name: true,
    }).extend({
      major: MajorSchema,
    }),
    location: LocationSchema,
  }).array()
);

export type UpdateLessonsResponse = z.infer<typeof UpdateLessonsResponseSchema>;
