"use client";

import { Box, Button, VStack, Text, HStack, Input } from "@chakra-ui/react";
import { Checkbox } from "@chakra-ui/react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLessonByAdminInputSchema } from "@/app/(lessons)/api/lessons/schema";
import { useLessonReservation } from "@/features/table/grid/providers/LessonReservationProvider";
import { useNavigation } from "@/features/navigation/provider/NavigationContext";
import { useCreateLesson } from "./useCreateLesson";
import { formatDate, formatHour } from "@/utils/date";
import { useState } from "react";
import { UserLookupResponse } from "@/app/(users)/api/users/lookup/schema";
import UserLookupSelector from "@/features/selectors/UserLookupSelector";
import z from "zod";

interface AdminLessonReservationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLessonReservationForm({
  onSuccess,
  onCancel,
}: AdminLessonReservationFormProps) {
  const { selectedDate, dueHour, selectedTeacher } = useLessonReservation();
  const { selectedLocation } = useNavigation();
  const { createLesson, isSaving } = useCreateLesson();

  const [selectedUser, setSelectedUser] = useState<
    UserLookupResponse["data"][number] | null
  >(null);

  const schema = CreateLessonByAdminInputSchema;
  type FormIn = z.input<typeof schema>;
  type FormOut = z.output<typeof schema>;

  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<FormIn>({
    resolver: zodResolver(schema) as unknown as Resolver<FormIn>,
    defaultValues: {
      dueDate: selectedDate.toISOString(),
      dueHour: dueHour,
      teacherId: selectedTeacher.id,
      locationId: selectedLocation.id as number,
      isGrand: false,
      userId: undefined,
      contact: undefined,
      username: undefined,
    },
  });

  const onSubmit = async (data: FormOut) => {
    const result = await createLesson(data);
    if (result.success) onSuccess();
  };

  const handleUserSelect = (
    user: UserLookupResponse["data"][number] | null
  ) => {
    if (user) {
      setSelectedUser(user);
      setValue("userId", user.id);
      setValue("username", undefined);
      setValue("contact", undefined);
    } else {
      setSelectedUser(null);
      setValue("userId", undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
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
        <input
          type="hidden"
          {...register("userId", {
            setValueAs: (v) => {
              const num = Number(v);
              return isNaN(num) ? undefined : num;
            },
          })}
        />

        <Box>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>
            사용자 선택
          </Text>
          <UserLookupSelector
            onUserSelect={handleUserSelect}
            placeholder="사용자 이름 또는 연락처 검색"
          />
          {selectedUser && (
            <Box mt={3} p={2} borderWidth="1px" borderRadius="md" bg="gray.50">
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {selectedUser.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {selectedUser.contact}
                  </Text>
                </Box>
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => {
                    setSelectedUser(null);
                    setValue("userId", undefined);
                  }}
                >
                  선택 해제
                </Button>
              </HStack>
            </Box>
          )}
        </Box>

        {!selectedUser && (
          <VStack gap={3} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                사용자 정보 (직접 입력)
              </Text>
              <VStack gap={2} align="stretch">
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    이름
                  </Text>

                  <Controller
                    control={control}
                    name="username"
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : e.target.value
                          )
                        }
                        placeholder="사용자 이름"
                        size="sm"
                        bg="white"
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    연락처
                  </Text>

                  <Controller
                    control={control}
                    name="contact"
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : e.target.value
                          )
                        }
                        placeholder="연락처"
                        size="sm"
                        bg="white"
                      />
                    )}
                  />
                </Box>
              </VStack>
            </Box>
          </VStack>
        )}

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
            colorScheme="brand"
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
