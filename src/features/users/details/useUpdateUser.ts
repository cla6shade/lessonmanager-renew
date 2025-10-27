import { useUpdate } from '@/hooks/useUpdate';
import { UpdateUserRequestSchema, UpdateUserResponse } from '@/app/(users)/api/users/[id]/schema';
import z from 'zod';

export function useUpdateUser() {
  return useUpdate<z.input<typeof UpdateUserRequestSchema>, UpdateUserResponse>();
}
