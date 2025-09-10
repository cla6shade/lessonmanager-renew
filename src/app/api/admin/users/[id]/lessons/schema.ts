import { LessonSchema, LocationSchema, MajorSchema } from "@/generated/zod";
import { z } from "zod";
import { PaginatedDataResponseSchema } from "../../../../schema";

export const UserLessonsQuerySchema = z.object({
  userId: z.string(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const UserLessonsResponseSchema = PaginatedDataResponseSchema(
  z.array(
    LessonSchema.extend({
      teacher: z.object({
        id: z.number(),
        name: z.string(),
        major: MajorSchema,
        location: LocationSchema,
      }),
      location: LocationSchema,
    })
  )
);

export type UserLessonsResponse = z.infer<typeof UserLessonsResponseSchema>;
