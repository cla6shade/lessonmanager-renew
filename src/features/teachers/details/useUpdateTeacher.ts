import { useUpdate } from '@/hooks/useUpdate';
import {
  UpdateTeacherResponse,
  UpdateTeacherRequestSchema,
  RemoveTeacherResponse,
} from '@/app/(teachers)/api/teachers/schema';
import z from 'zod';

export function useUpdateTeacher() {
  const { update, isSaving, error, clearError } = useUpdate<
    z.input<typeof UpdateTeacherRequestSchema>,
    UpdateTeacherResponse
  >();

  const {
    update: requestDelete,
    isSaving: isDeleting,
    error: deleteError,
    clearError: clearDeleteError,
  } = useUpdate<{}, RemoveTeacherResponse>();

  const updateTeacher = async (
    teacherId: number,
    data: z.input<typeof UpdateTeacherRequestSchema>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
    },
  ) => {
    return update(data, {
      endpoint: `/api/teachers/${teacherId}`,
      method: 'PUT',
      successMessage: options?.successMessage || '선생님 정보가 성공적으로 업데이트되었습니다.',
      errorMessage: options?.errorMessage || '선생님 정보 업데이트 중 오류가 발생했습니다.',
    });
  };

  const deleteTeacher = async (
    teacherId: number,
    options?: {
      successMessage?: string;
      errorMessage?: string;
    },
  ) => {
    return requestDelete(teacherId, {
      endpoint: `/api/teachers/${teacherId}`,
      method: 'DELETE',
      successMessage: options?.successMessage || '선생님 정보가 성공적으로 삭제되었습니다.',
    });
  };

  return {
    updateTeacher,
    deleteTeacher,
    isSaving,
    error,
    clearError,
  };
}
