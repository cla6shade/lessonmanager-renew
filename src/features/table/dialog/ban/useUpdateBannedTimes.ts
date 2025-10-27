import { useCallback } from 'react';
import { UpdateBannedTimesRequest, UpdateBannedTimesResponse } from '@/app/(table)/api/bans/schema';
import { useUpdate, UpdateResult } from '@/hooks/useUpdate';

export function useUpdateBannedTimes() {
  const { update, isSaving, error } = useUpdate<
    UpdateBannedTimesRequest,
    UpdateBannedTimesResponse
  >();

  const updateBannedTimes = useCallback(
    async (data: UpdateBannedTimesRequest): Promise<UpdateResult<UpdateBannedTimesResponse>> => {
      return await update(data, {
        endpoint: '/api/bans',
        method: 'PUT',
      });
    },
    [update],
  );

  return {
    updateBannedTimes,
    isSaving,
    error,
  };
}
