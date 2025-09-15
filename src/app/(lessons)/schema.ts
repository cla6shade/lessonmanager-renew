import { LessonSchema, LocationSchema, MajorSchema } from "@/generated/zod";
import { toKstDate } from "@/utils/date";
import { z } from "zod";

export const LessonSearchParamsSchema = z.object({
  startDate: z.iso
    .datetime()
    .optional()
    .transform((value) => (value ? toKstDate(value) : undefined)),
  endDate: z.iso
    .datetime()
    .optional()
    .transform((value) => (value ? toKstDate(value) : undefined)),
  selectedTeacherId: z.coerce.number().optional(),
  selectedLocationId: z.coerce.number().optional(),
});

export type LessonSearchParams = z.infer<typeof LessonSearchParamsSchema>;

export const LessonSearchResultSchema = z.array(
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
);

export type LessonSearchResult = z.infer<typeof LessonSearchResultSchema>;
