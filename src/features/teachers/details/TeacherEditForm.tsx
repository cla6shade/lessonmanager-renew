import {
  Text,
  VStack,
  HStack,
  Separator,
  Button,
  Input,
  Box,
  RadioGroup,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import z from "zod";
import { UpdateTeacherRequestSchema } from "@/app/(teachers)/api/teachers/schema";
import { TeacherSearchResult } from "@/app/(teachers)/api/teachers/schema";
import LocationSelector from "@/features/selectors/LocationSelector";
import MajorSelector from "@/features/selectors/MajorSelector";
import { useUpdateTeacher } from "./useUpdateTeacher";

const UpdateTeacherFormSchema = UpdateTeacherRequestSchema.omit({
  birth: true,
  isManager: true,
  isLeaved: true,
}).extend({
  birthYear: z.string().optional(),
  birthMonth: z.string().optional(),
  birthDay: z.string().optional(),
});

interface TeacherEditFormProps {
  teacher: TeacherSearchResult;
  locations: any[];
  majors: any[];
  onTeacherUpdate: (updatedTeacher: TeacherSearchResult) => void;
  refetchTeachers: () => void;
  onCancel: () => void;
}

export default function TeacherEditForm({
  teacher,
  locations,
  majors,
  onTeacherUpdate,
  refetchTeachers,
  onCancel,
}: TeacherEditFormProps) {
  const { updateTeacher, isSaving } = useUpdateTeacher();

  const form = useForm<
    z.input<typeof UpdateTeacherFormSchema>,
    z.output<typeof UpdateTeacherFormSchema>
  >({
    resolver: zodResolver(UpdateTeacherFormSchema),
    defaultValues: {
      name: teacher?.name || "",
      contact: teacher?.contact || "",
      birthYear: teacher?.birth
        ? new Date(teacher.birth).getFullYear().toString()
        : "",
      birthMonth: teacher?.birth
        ? (new Date(teacher.birth).getMonth() + 1).toString()
        : "",
      birthDay: teacher?.birth
        ? new Date(teacher.birth).getDate().toString()
        : "",
      address: teacher?.address || "",
      email: teacher?.email || "",
      locationId: teacher?.locationId === undefined ? 0 : teacher.locationId,
      majorId: teacher?.majorId === undefined ? 0 : teacher.majorId,
      gender: teacher?.gender || false,
      workingDays: teacher?.workingDays || 0,
    },
  });

  const handleSave = useCallback(
    async (data: z.output<typeof UpdateTeacherFormSchema>) => {
      if (!teacher) return;

      let birthISO: string | undefined;
      if (data.birthYear && data.birthMonth && data.birthDay) {
        const year = parseInt(data.birthYear, 10);
        const month = parseInt(data.birthMonth, 10);
        const day = parseInt(data.birthDay, 10);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const date = new Date(year, month - 1, day);
          birthISO = date.toISOString();
        }
      }

      const updateData: z.input<typeof UpdateTeacherRequestSchema> = {
        name: data.name || "",
        contact: data.contact || "",
        birth: birthISO,
        address: data.address || "",
        email: data.email || "",
        locationId: data.locationId || 0,
        majorId: data.majorId || 0,
        gender: data.gender || false,
        isManager: data.majorId === 2,
        workingDays: data.workingDays || 0,
      };

      const { success, data: updatedTeacher } = await updateTeacher(
        teacher.id,
        updateData,
        {
          successMessage: "선생님 정보가 수정되었습니다.",
        }
      );

      if (success && updatedTeacher) {
        onTeacherUpdate({
          ...updatedTeacher.data,
          reregisterFraction: teacher.reregisterFraction,
          lessonCompletionFraction: teacher.lessonCompletionFraction,
        });
        refetchTeachers();
        onCancel();
      }
    },
    [teacher, updateTeacher, onTeacherUpdate, refetchTeachers, onCancel]
  );

  const handleLocationSelect = (locationId: number) => {
    form.setValue("locationId", locationId);
  };

  const handleMajorSelect = (majorId: number) => {
    form.setValue("majorId", majorId);
  };

  return (
    <VStack gap={4} align="stretch">
      <VStack gap={4} align="stretch">
        <Box>
          <Text fontWeight="bold" mb={2}>
            이름{" "}
            <Text as="span" color="red.500">
              *
            </Text>
          </Text>
          <Input
            {...form.register("name")}
            placeholder="이름을 입력하세요"
            borderColor={form.formState.errors.name ? "red.500" : undefined}
          />
          {form.formState.errors.name && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.name.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            생년월일
          </Text>
          <HStack gap={2}>
            <Box flex={1}>
              <Input
                placeholder="년도"
                {...form.register("birthYear")}
                borderColor={
                  form.formState.errors.birthYear ? "red.500" : undefined
                }
              />
              {form.formState.errors.birthYear && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {form.formState.errors.birthYear.message}
                </Text>
              )}
            </Box>
            <Box flex={1}>
              <Input
                placeholder="월"
                {...form.register("birthMonth")}
                borderColor={
                  form.formState.errors.birthMonth ? "red.500" : undefined
                }
              />
              {form.formState.errors.birthMonth && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {form.formState.errors.birthMonth.message}
                </Text>
              )}
            </Box>
            <Box flex={1}>
              <Input
                placeholder="일"
                {...form.register("birthDay")}
                borderColor={
                  form.formState.errors.birthDay ? "red.500" : undefined
                }
              />
              {form.formState.errors.birthDay && (
                <Text color="red.500" fontSize="xs" mt={1}>
                  {form.formState.errors.birthDay.message}
                </Text>
              )}
            </Box>
          </HStack>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            성별
          </Text>
          <RadioGroup.Root
            value={form.watch("gender") ? "female" : "male"}
            onValueChange={(e) => form.setValue("gender", e.value === "female")}
          >
            <HStack gap={4}>
              <RadioGroup.Item value="male">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl>✓</RadioGroup.ItemControl>
                <RadioGroup.ItemText>남성</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value="female">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl>✓</RadioGroup.ItemControl>
                <RadioGroup.ItemText>여성</RadioGroup.ItemText>
              </RadioGroup.Item>
            </HStack>
          </RadioGroup.Root>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            연락처
          </Text>
          <Input
            {...form.register("contact")}
            placeholder="연락처를 입력하세요"
            borderColor={form.formState.errors.contact ? "red.500" : undefined}
          />
          {form.formState.errors.contact && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.contact.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            주소
          </Text>
          <Input
            {...form.register("address")}
            placeholder="주소를 입력하세요"
            borderColor={form.formState.errors.address ? "red.500" : undefined}
          />
          {form.formState.errors.address && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.address.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            이메일
          </Text>
          <Input
            type="email"
            {...form.register("email")}
            placeholder="이메일을 입력하세요"
            borderColor={form.formState.errors.email ? "red.500" : undefined}
          />
          {form.formState.errors.email && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.email.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            전공{" "}
            <Text as="span" color="red.500">
              *
            </Text>
          </Text>
          <MajorSelector
            majors={majors}
            selectedMajorId={form.watch("majorId") || 0}
            onMajorSelect={handleMajorSelect}
            placeholder="전공을 선택하세요"
          />
          {form.formState.errors.majorId && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.majorId.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            지점{" "}
            <Text as="span" color="red.500">
              *
            </Text>
          </Text>
          <LocationSelector
            locations={locations}
            selectedLocationId={form.watch("locationId") || 0}
            onLocationSelect={handleLocationSelect}
            placeholder="지점을 선택하세요"
          />
          {form.formState.errors.locationId && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.locationId.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            근무일수
          </Text>
          <Input
            {...form.register("workingDays", { valueAsNumber: true })}
            placeholder="근무일수를 입력하세요"
            borderColor={
              form.formState.errors.workingDays ? "red.500" : undefined
            }
          />
          {form.formState.errors.workingDays && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.workingDays.message}
            </Text>
          )}
        </Box>

        <Separator />
        <HStack gap={2} justify="stretch">
          <Button
            onClick={form.handleSubmit(handleSave)}
            loading={isSaving}
            loadingText="저장 중"
            colorPalette="brand"
            flex={1}
          >
            저장
          </Button>
          <Button onClick={onCancel} variant="outline" flex={1}>
            취소
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
}
