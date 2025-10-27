import { useUpdate } from '@/hooks/useUpdate';
import { CreateUserRequestSchema, CreateUserResponse } from '@/app/(users)/api/users/schema';
import z from 'zod';

export function useCreateUser() {
  const { update, isSaving, error, clearError } = useUpdate<
    z.input<typeof CreateUserRequestSchema>,
    CreateUserResponse
  >();

  const createUser = async (userData: z.input<typeof CreateUserRequestSchema>) => {
    return await update(userData, {
      endpoint: '/api/users',
      method: 'POST',
      successMessage: '사용자가 성공적으로 생성되었습니다.',
      errorMessage: '사용자 생성에 실패했습니다.',
    });
  };

  return {
    createUser,
    isSaving,
    error,
    clearError,
  };
}
