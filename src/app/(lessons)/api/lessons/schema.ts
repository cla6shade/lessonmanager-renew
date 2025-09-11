import { LessonSchema, LocationSchema, MajorSchema } from "@/generated/zod";
import { z } from "zod";
import { DataResponseSchema } from "../../../schema";

export const GetLessonsQuerySchema = z.object({
  startDate: z.iso.datetime().transform((value) => new Date(value)),
  endDate: z.iso.datetime().transform((value) => new Date(value)),
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
        location: LocationSchema,
      }),
      location: LocationSchema,
    }).omit({
      contact: true,
      note: true,
    })
  )
);

export type GetLessonsResponse = z.infer<typeof GetLessonsResponseSchema>;
