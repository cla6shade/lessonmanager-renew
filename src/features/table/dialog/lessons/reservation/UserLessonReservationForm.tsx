"use client";

import { Box, Button, VStack, Text, HStack } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLessonReservation } from "@/features/table/grid/providers/LessonReservationProvider";
import { useNavigation } from "@/features/navigation/provider/NavigationContext";
import {
  CreateLessonByUserFormSchema,
  useCreateLesson,
} from "./useCreateLesson";
import { formatDate, formatHour } from "@/utils/date";
import z from "zod";

interface UserLessonReservationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserLessonReservationForm({
  onSuccess,
  onCancel,
}: UserLessonReservationFormProps) {
  const { selectedDate, dueHour, selectedTeacher } = useLessonReservation();
  const { selectedLocation } = useNavigation();
  const { createLesson, isSaving } = useCreateLesson();

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.input<typeof CreateLessonByUserFormSchema>>({
    resolver: zodResolver(CreateLessonByUserFormSchema),
    defaultValues: {
      dueDate: selectedDate.toISOString(),
      dueHour: dueHour,
      teacherId: selectedTeacher.id,
      locationId: selectedLocation.id as number,
      isGrand: false,
    },
  });

  const onSubmit = async (
    data: z.output<typeof CreateLessonByUserFormSchema>
  ) => {
    const result = await createLesson(data);
    if (result.success) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        <Box p={3} bg="gray.50" borderRadius="md">
          <VStack gap={1} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              예약 정보
            </Text>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                날짜:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {formatDate(selectedDate)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                시간:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {formatHour(dueHour)}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                선생님:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {selectedTeacher.major.symbol} {selectedTeacher.name}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                위치:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {selectedLocation.name}
              </Text>
            </HStack>
          </VStack>
        </Box>

        <input type="hidden" {...register("dueDate")} />
        <input
          type="hidden"
          {...register("dueHour", { valueAsNumber: true })}
        />
        <input
          type="hidden"
          {...register("teacherId", { valueAsNumber: true })}
        />
        <input
          type="hidden"
          {...register("locationId", { valueAsNumber: true })}
        />

        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            레슨 유형
          </Text>
          <Controller
            control={control}
            name="isGrand"
            render={({ field: { onChange, value } }) => (
              <Checkbox.Root
                checked={value}
                onCheckedChange={(d) => onChange(!!d.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>
                  <Text fontSize="sm">그랜드 레슨</Text>
                </Checkbox.Label>
              </Checkbox.Root>
            )}
          />
          {errors.isGrand && (
            <Text fontSize="sm" color="red.500" mt={1}>
              {String(errors.isGrand.message || "유효하지 않은 값입니다")}
            </Text>
          )}
        </Box>

        <HStack gap={2} justify="flex-end" pt={2}>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            size="sm"
          >
            취소
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            loading={isSaving}
            loadingText="예약 중"
            size="sm"
          >
            예약하기
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}
