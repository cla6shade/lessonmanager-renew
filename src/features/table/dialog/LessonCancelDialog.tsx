import { Button, HStack, VStack, Text, Box } from "@chakra-ui/react";
import { useUpdate } from "@/hooks/useUpdate";
import { CancelLessonResponse } from "@/app/(lessons)/api/lessons/[id]/schema";

interface LessonCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  onSuccess?: (cancelledLesson: any) => void;
}

export default function LessonCancelDialog({
  isOpen,
  onClose,
  lessonId,
  onSuccess,
}: LessonCancelDialogProps) {
  const { update: cancelLesson, isSaving: isCancelling } = useUpdate<
    {},
    CancelLessonResponse
  >();

  const handleCancelLesson = async () => {
    const result = await cancelLesson(
      {},
      {
        endpoint: `/api/lessons/${lessonId}`,
        method: "DELETE",
        successMessage: "레슨이 취소되었습니다.",
        errorMessage: "레슨 취소 중 오류가 발생했습니다.",
      }
    );

    if (result.success && result.data) {
      onSuccess?.(result.data.data);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="orange.200"
      bg="orange.50"
      borderRadius="md"
    >
      <VStack align="start" gap={3}>
        <Text fontWeight="bold" color="orange.800">
          레슨 취소 확인
        </Text>
        <Text color="gray.700">
          정말로 이 레슨을 취소하시겠습니까? 취소된 레슨은 복구할 수 없습니다.
        </Text>
        <HStack gap={2}>
          <Button onClick={onClose}>아니오</Button>
          <Button
            colorPalette="red"
            onClick={handleCancelLesson}
            loading={isCancelling}
            loadingText="처리 중..."
          >
            예, 취소합니다
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
