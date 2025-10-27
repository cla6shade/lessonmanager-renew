import { useUpdate } from '@/hooks/useUpdate';
import {
  UpdateWorkingTimeRequest,
  UpdateWorkingTimeResponse,
} from '@/app/(table)/api/working-times/schema';

export function useUpdateWorkingTime() {
  const { update, isSaving, error } = useUpdate<
    UpdateWorkingTimeRequest,
    UpdateWorkingTimeResponse
  >();

  const updateWorkingTime = async (data: UpdateWorkingTimeRequest) => {
    return update(data, {
      endpoint: '/api/working-times',
      method: 'PUT',
      successMessage: '근무시간이 성공적으로 업데이트되었습니다.',
      errorMessage: '근무시간 업데이트에 실패했습니다.',
    });
  };

  return {
    updateWorkingTime,
    isSaving,
    error,
  };
}
