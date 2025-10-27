import { z } from 'zod';
import { DataResponseSchema } from '../../../schema';
import {
  LocationSchema,
  MajorSchema,
  OpenHoursSchema,
  TeacherSchema,
  WorkingTimeSchema,
} from '@/generated/zod';

export const WorkingTimeDataSchema = z.object({
  mon: z.array(z.number().min(0).max(23)),
  tue: z.array(z.number().min(0).max(23)),
  wed: z.array(z.number().min(0).max(23)),
  thu: z.array(z.number().min(0).max(23)),
  fri: z.array(z.number().min(0).max(23)),
  sat: z.array(z.number().min(0).max(23)),
  sun: z.array(z.number().min(0).max(23)),
});

export type WorkingTimeData = z.infer<typeof WorkingTimeDataSchema>;

export const UpdateWorkingTimeRequestSchema = z.object({
  teacherId: z.number().int().positive(),
  times: WorkingTimeDataSchema,
});

export type UpdateWorkingTimeRequest = z.infer<typeof UpdateWorkingTimeRequestSchema>;

export const UpdateWorkingTimeResponseSchema = DataResponseSchema(WorkingTimeDataSchema);

export type UpdateWorkingTimeResponse = z.infer<typeof UpdateWorkingTimeResponseSchema>;

export const GetWorkingTimesResponseSchema = DataResponseSchema(
  z.object({
    times: WorkingTimeSchema.extend({
      times: WorkingTimeDataSchema,
      teacher: TeacherSchema.pick({
        id: true,
        name: true,
      }).extend({
        major: MajorSchema,
        location: LocationSchema,
      }),
    }).array(),
    openHours: OpenHoursSchema,
  }),
);

export type GetWorkingTimesResponse = z.infer<typeof GetWorkingTimesResponseSchema>;
