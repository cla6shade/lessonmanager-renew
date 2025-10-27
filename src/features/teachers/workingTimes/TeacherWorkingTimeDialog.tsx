import { Text, Dialog, Portal, Button, Badge, Box } from '@chakra-ui/react';
import { useFetchWorkingTimes } from './useFetchWorkingTimes';
import { useUpdateWorkingTime } from './useUpdateWorkingTime';
import { useState, useEffect } from 'react';
import TeacherSelector from '@/features/selectors/TeacherSelector';
import WorkingTimeTable from './WorkingTimeTable';
import { WorkingTimeData } from '@/app/(table)/api/working-times/schema';

interface TeacherTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherTableDialog({ isOpen, onClose }: TeacherTableDialogProps) {
  const { workingTimes, openHours, loading, error, refetch } = useFetchWorkingTimes();
  const { updateWorkingTime, isSaving, error: updateError } = useUpdateWorkingTime();
  const teachers = workingTimes.map((workingTime) => workingTime.teacher);
  const [selectedTeacher, setSelectedTeacher] = useState<(typeof teachers)[number] | null>(null);
  const [editedWorkingTime, setEditedWorkingTime] = useState<WorkingTimeData | null>(null);

  useEffect(() => {
    if (teachers.length > 0 && !selectedTeacher) {
      setSelectedTeacher(teachers[0]);
    }
  }, [teachers, selectedTeacher]);

  const handleWorkingTimeChange = (workingTime: WorkingTimeData) => {
    setEditedWorkingTime(workingTime);
  };

  const handleSave = async () => {
    if (!selectedTeacher || !editedWorkingTime) return;

    const result = await updateWorkingTime({
      teacherId: selectedTeacher.id,
      times: editedWorkingTime,
    });

    if (result.success) {
      await refetch();
      setEditedWorkingTime(null);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={{ base: 'full', md: '4xl' }} mx={{ base: 4, md: 'auto' }}>
            <Dialog.Header>
              <Text fontSize="lg" fontWeight="bold">
                선생님 근무시간 관리
              </Text>

              <Dialog.CloseTrigger asChild>
                <Button size="sm" variant="ghost" aria-label="닫기">
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <TeacherSelector
                teachers={teachers}
                selectedTeacher={selectedTeacher}
                onTeacherSelect={setSelectedTeacher}
                displayAllOption={false}
              />

              {updateError && (
                <Box
                  mb={4}
                  p={3}
                  bg="red.50"
                  borderColor="red.200"
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Text color="red.600" fontSize="sm">
                    {updateError}
                  </Text>
                </Box>
              )}

              {loading && (
                <Box textAlign="center" py={4} minH="500px">
                  <Text>데이터를 불러오는 중...</Text>
                </Box>
              )}

              {error && (
                <Box textAlign="center" py={4}>
                  <Badge colorScheme="red">{error}</Badge>
                </Box>
              )}

              {!loading && !error && workingTimes.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Text>등록된 근무시간 데이터가 없습니다.</Text>
                </Box>
              )}

              {!loading && !error && workingTimes.length > 0 && (
                <Box overflowX="auto">
                  <WorkingTimeTable
                    workingTimes={workingTimes}
                    selectedTeacher={selectedTeacher}
                    openHours={openHours}
                    onWorkingTimeChange={handleWorkingTimeChange}
                  />
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={handleSave}
                colorScheme="blue"
                loading={isSaving}
                disabled={!selectedTeacher || !editedWorkingTime}
              >
                저장
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
