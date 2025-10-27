import { useUpdate } from '@/hooks/useUpdate';
import {
  CreateTeacherRequestSchema,
  CreateTeacherResponse,
} from '@/app/(teachers)/api/teachers/schema';
import z from 'zod';

export function useCreateTeacher() {
  const { update, isSaving, error, clearError } = useUpdate<
    z.input<typeof CreateTeacherRequestSchema>,
    CreateTeacherResponse
  >();

  const createTeacher = async (teacherData: z.input<typeof CreateTeacherRequestSchema>) => {
    return await update(teacherData, {
      endpoint: '/api/teachers',
      method: 'POST',
      successMessage: '선생님이 성공적으로 생성되었습니다.',
      errorMessage: '선생님 생성에 실패했습니다.',
    });
  };

  return {
    createTeacher,
    isSaving,
    error,
    clearError,
  };
}
