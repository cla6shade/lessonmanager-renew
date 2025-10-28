import { Text, VStack, HStack, Separator, Button, Input, Box, RadioGroup } from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import z from 'zod';
import { UpdateTeacherRequestSchema } from '@/app/(teachers)/api/teachers/schema';
import { TeacherSearchResult } from '@/app/(teachers)/api/teachers/schema';
import LocationSelector from '@/features/selectors/LocationSelector';
import MajorSelector from '@/features/selectors/MajorSelector';
import { useUpdateTeacher } from './useUpdateTeacher';
import { Major, Location } from '@/generated/prisma';
import DateInput from '@/features/inputs/DateInput';

const UpdateTeacherFormSchema = UpdateTeacherRequestSchema.omit({
  isManager: true,
  isLeaved: true,
}).extend({
  birth: z.string(),
});

interface TeacherEditFormProps {
  teacher: TeacherSearchResult;
  locations: Location[];
  majors: Major[];
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

  const form = useForm<z.input<typeof UpdateTeacherFormSchema>>({
    resolver: zodResolver(UpdateTeacherFormSchema),
    defaultValues: {
      name: teacher?.name || '',
      contact: teacher?.contact || '',
      birth: teacher?.birth ? new Date(teacher.birth).toISOString() : '',
      address: teacher?.address || '',
      email: teacher?.email || '',
      locationId: teacher?.locationId === undefined ? 0 : teacher.locationId,
      majorId: teacher?.majorId === undefined ? 0 : teacher.majorId,
      gender: teacher?.gender || false,
      workingDays: teacher?.workingDays || 0,
    },
  });

  const handleSave = useCallback(
    async (updateData: z.output<typeof UpdateTeacherFormSchema>) => {
      if (!teacher) return;

      const { success, data: updatedTeacher } = await updateTeacher(teacher.id, updateData, {
        successMessage: '선생님 정보가 수정되었습니다.',
      });

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
    [teacher, updateTeacher, onTeacherUpdate, refetchTeachers, onCancel],
  );

  const handleLocationSelect = (locationId: number) => {
    form.setValue('locationId', locationId);
  };

  const handleMajorSelect = (majorId: number) => {
    form.setValue('majorId', majorId);
  };

  return (
    <VStack gap={4} align="stretch">
      <VStack gap={4} align="stretch">
        <Box>
          <Text fontWeight="bold" mb={2}>
            이름{' '}
            <Text as="span" color="red.500">
              *
            </Text>
          </Text>
          <Input
            {...form.register('name')}
            placeholder="이름을 입력하세요"
            borderColor={form.formState.errors.name ? 'red.500' : undefined}
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
          <Controller
            control={form.control}
            name="birth"
            render={({ field }) => (
              <DateInput
                borderColor={form.formState.errors.birth ? 'red.500' : undefined}
                {...field}
              />
            )}
          />
          {form.formState.errors.birth && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.birth.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            성별
          </Text>
          <RadioGroup.Root
            value={form.watch('gender') ? 'female' : 'male'}
            onValueChange={(e) => form.setValue('gender', e.value === 'female')}
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
            {...form.register('contact')}
            placeholder="연락처를 입력하세요"
            borderColor={form.formState.errors.contact ? 'red.500' : undefined}
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
            {...form.register('address')}
            placeholder="주소를 입력하세요"
            borderColor={form.formState.errors.address ? 'red.500' : undefined}
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
            {...form.register('email')}
            placeholder="이메일을 입력하세요"
            borderColor={form.formState.errors.email ? 'red.500' : undefined}
          />
          {form.formState.errors.email && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {form.formState.errors.email.message}
            </Text>
          )}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            전공{' '}
            <Text as="span" color="red.500">
              *
            </Text>
          </Text>
          <MajorSelector
            majors={majors}
            selectedMajorId={form.watch('majorId') || 0}
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
            지점{' '}
            <Text as="span" color="red.500">
              *
            </Text>
          </Text>
          <LocationSelector
            locations={locations}
            selectedLocationId={form.watch('locationId') || 0}
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
            {...form.register('workingDays', { valueAsNumber: true })}
            placeholder="근무일수를 입력하세요"
            borderColor={form.formState.errors.workingDays ? 'red.500' : undefined}
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
