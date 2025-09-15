import { LessonBannedTimesSchema, TeacherSchema } from "@/generated/zod";
import { z } from "zod";
import { DataResponseSchema } from "../../../schema";

export const GetBannedTimesQuerySchema = z.object({
  startDate: z.iso.datetime().transform((value) => new Date(value)),
  endDate: z.iso.datetime().transform((value) => new Date(value)),
  teacherId: z.coerce.number().optional(),
});

export type GetBannedTimesQuery = z.infer<typeof GetBannedTimesQuerySchema>;

export const GetBannedTimesResponseSchema = DataResponseSchema(
  z.array(
    LessonBannedTimesSchema.extend({
      teacher: TeacherSchema.pick({
        id: true,
        name: true,
      }),
    })
  )
);

export type GetBannedTimesResponse = z.infer<
  typeof GetBannedTimesResponseSchema
>;

export const CreateBannedTimeRequestSchema = LessonBannedTimesSchema.pick({
  teacherId: true,
  date: true,
  hour: true,
}).extend({
  teacherId: z.coerce.number(),
  date: z.iso.datetime().transform((value) => new Date(value)),
  hour: z.coerce.number(),
});

export type CreateBannedTimeRequest = z.infer<
  typeof CreateBannedTimeRequestSchema
>;

export const CreateBannedTimeResponseSchema = DataResponseSchema(
  LessonBannedTimesSchema.extend({
    teacher: TeacherSchema.pick({
      id: true,
      name: true,
    }),
  })
);

export type CreateBannedTimeResponse = z.infer<
  typeof CreateBannedTimeResponseSchema
>;

export const UpdateBannedTimesRequestSchema = z.object({
  deleteIds: z.array(z.number()),
  bannedTimes: z.array(
    LessonBannedTimesSchema.pick({
      teacherId: true,
      date: true,
      hour: true,
    })
  ),
});

export type UpdateBannedTimesRequest = z.infer<
  typeof UpdateBannedTimesRequestSchema
>;

export const UpdateBannedTimesResponseSchema = DataResponseSchema(
  z.array(
    LessonBannedTimesSchema.extend({
      teacher: TeacherSchema.pick({
        id: true,
        name: true,
      }),
    })
  )
);

export type UpdateBannedTimesResponse = z.infer<
  typeof UpdateBannedTimesResponseSchema
>;
