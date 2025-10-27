import { useCallback } from 'react';
import {
  CreateLessonByUserResponse,
  CreateLessonByAdminResponse,
  CreateLessonByUserInputSchema,
  CreateLessonByAdminInputSchema,
} from '@/app/(lessons)/api/lessons/schema';
import { useUpdate } from '@/hooks/useUpdate';
import z from 'zod';

export const CreateLessonByUserFormSchema = CreateLessonByUserInputSchema.extend({
  dueDate: z.string(),
});

export const CreateLessonByAdminFormSchema = CreateLessonByAdminInputSchema.extend({
  dueDate: z.string(),
});

type CreateLessonInput =
  | z.input<typeof CreateLessonByUserFormSchema>
  | z.input<typeof CreateLessonByAdminFormSchema>;

export function useCreateLesson() {
  const { update, isSaving, error } = useUpdate<
    CreateLessonInput,
    CreateLessonByUserResponse | CreateLessonByAdminResponse
  >();

  const createLesson = useCallback(
    async (data: CreateLessonInput) => {
      const result = await update(data, {
        endpoint: '/api/lessons',
        method: 'POST',
        successMessage: '레슨이 성공적으로 예약되었습니다.',
      });
      return result;
    },
    [update],
  );

  return {
    createLesson,
    isSaving,
    error,
  };
}
