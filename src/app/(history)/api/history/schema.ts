import { PaginatedDataResponseSchema } from '@/app/schema';
import { LessonModifyHistorySchema, TeacherSchema, UserSchema } from '@/generated/zod';
import { z } from 'zod';

export const GetHistoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  userId: z.coerce.number().optional(),
  teacherId: z.coerce.number().optional(),
  type: z.coerce.number().optional(),
  createdByType: z.coerce.number().optional(),
});

export type GetHistoryQuery = z.infer<typeof GetHistoryQuerySchema>;

export const GetHistoryResponseSchema = PaginatedDataResponseSchema(
  z.array(
    LessonModifyHistorySchema.extend({
      teacher: TeacherSchema.pick({
        id: true,
        name: true,
      }).nullable(),
      user: UserSchema.pick({
        id: true,
        name: true,
      }).nullable(),
    }),
  ),
);

export type GetHistoryResponse = z.infer<typeof GetHistoryResponseSchema>;
