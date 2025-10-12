import {
  Button,
  Dialog,
  HStack,
  Input,
  Portal,
  Text,
  VStack,
  Box,
  RadioGroup,
} from "@chakra-ui/react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeacherRequestSchema } from "@/app/(teachers)/api/teachers/schema";
import { useCreateTeacher } from "@/features/teachers/hooks/useCreateTeacher";
import { useNavigation } from "@/features/navigation/location/NavigationContext";
import LocationSelector from "@/features/selectors/LocationSelector";
import MajorSelector from "@/features/selectors/MajorSelector";
import { buildDate } from "@/utils/date";
import { useTeacherManagement } from "../teachers/TeacherManagmentProvider";

interface CreateTeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTeacherFormSchema = CreateTeacherRequestSchema.extend({
  birthYear: z.string().optional(),
  birthMonth: z.string().optional(),
  birthDay: z.string().optional(),
}).omit({
  birth: true,
});

export default function CreateTeacherDialog({
  isOpen,
  onClose,
}: CreateTeacherDialogProps) {
  const { refetchTeachers } = useTeacherManagement();
  const { locations, majors } = useNavigation();

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof CreateTeacherFormSchema>>({
    resolver: zodResolver(CreateTeacherFormSchema),
    defaultValues: {
      locationId: 0,
      majorId: 0,
      name: "",
      gender: false,
      contact: "",
      loginId: "",
      password: "",
      passwordConfirm: "",
      email: "",
      address: "",
      isManager: false,
      workingDays: 0,
      birthYear: "",
      birthMonth: "",
      birthDay: "",
    },
  });

  const { createTeacher, isSaving } = useCreateTeacher();

  const onSubmit = async (data: z.output<typeof CreateTeacherFormSchema>) => {
    const birth: Date | undefined = buildDate(
      data.birthYear,
      data.birthMonth,
      data.birthDay
    );

    const createData = {
      locationId: data.locationId,
      majorId: data.majorId,
      name: data.name,
      gender: data.gender,
      birth: birth?.toISOString(),
      contact: data.contact,
      loginId: data.loginId,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      email: data.email,
      address: data.address,
      isManager: data.isManager,
      workingDays: data.workingDays,
    };

    const result = await createTeacher(createData as any);

    if (result.success) {
      refetchTeachers();
      reset();
      onClose();
    }
  };

  const handleLocationSelect = (locationId: number) => {
    setValue("locationId", locationId);
  };

  const handleMajorSelect = (majorId: number) => {
    setValue("majorId", majorId);
    setValue("isManager", majorId === 2);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && handleClose()}
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxH="90vh" overflow="auto">
            <Dialog.Header>
              <Text fontSize="lg" fontWeight="bold">
                새 선생님 생성
              </Text>
              <Dialog.CloseTrigger asChild>
                <Button size="sm" variant="ghost" aria-label="닫기">
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap={4} align="stretch">
                  {/* 지점 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      지점{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <LocationSelector
                      locations={locations}
                      selectedLocationId={watch("locationId")}
                      onLocationSelect={handleLocationSelect}
                      placeholder="지점을 선택하세요"
                    />
                    {errors.locationId && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.locationId.message}
                      </Text>
                    )}
                  </Box>

                  {/* 전공 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      전공{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <MajorSelector
                      majors={majors}
                      selectedMajorId={watch("majorId")}
                      onMajorSelect={handleMajorSelect}
                      placeholder="전공을 선택하세요"
                    />
                    {errors.majorId && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.majorId.message}
                      </Text>
                    )}
                  </Box>

                  {/* 기본 정보 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      이름{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Input
                      {...register("name")}
                      placeholder="이름을 입력하세요"
                      borderColor={errors.name ? "red.500" : undefined}
                    />
                    {errors.name && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.name.message}
                      </Text>
                    )}
                  </Box>

                  {/* 성별 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      성별
                    </Text>
                    <RadioGroup.Root
                      value={watch("gender") ? "female" : "male"}
                      onValueChange={(e) => {
                        setValue("gender", e.value === "female");
                      }}
                    >
                      <HStack gap={4}>
                        <RadioGroup.Item value="male">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>남성</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="female">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>여성</RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </HStack>
                    </RadioGroup.Root>
                  </Box>

                  {/* 생년월일 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      생년월일
                    </Text>
                    <HStack gap={2}>
                      <Input
                        {...register("birthYear")}
                        placeholder="연도"
                        type="number"
                        min="1900"
                        max="2030"
                      />
                      <Input
                        {...register("birthMonth")}
                        placeholder="월"
                        type="number"
                        min="1"
                        max="12"
                      />
                      <Input
                        {...register("birthDay")}
                        placeholder="일"
                        type="number"
                        min="1"
                        max="31"
                      />
                    </HStack>
                  </Box>

                  {/* 연락처 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      연락처
                    </Text>
                    <Input
                      {...register("contact")}
                      placeholder="연락처를 입력하세요"
                      borderColor={errors.contact ? "red.500" : undefined}
                    />
                    {errors.contact && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.contact.message}
                      </Text>
                    )}
                  </Box>

                  {/* 주소 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      주소
                    </Text>
                    <Input
                      {...register("address")}
                      placeholder="주소를 입력하세요"
                      borderColor={errors.address ? "red.500" : undefined}
                    />
                    {errors.address && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.address.message}
                      </Text>
                    )}
                  </Box>

                  {/* 로그인 정보 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      로그인 ID{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Input
                      {...register("loginId")}
                      placeholder="로그인 ID를 입력하세요"
                      borderColor={errors.loginId ? "red.500" : undefined}
                    />
                    {errors.loginId && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.loginId.message}
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      비밀번호{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Input
                      {...register("password")}
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      borderColor={errors.password ? "red.500" : undefined}
                    />
                    {errors.password && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.password.message}
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      비밀번호 확인{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                    <Input
                      {...register("passwordConfirm")}
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      borderColor={
                        errors.passwordConfirm ? "red.500" : undefined
                      }
                    />
                    {errors.passwordConfirm && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.passwordConfirm.message}
                      </Text>
                    )}
                  </Box>

                  {/* 이메일 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      이메일
                    </Text>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="이메일을 입력하세요"
                      borderColor={errors.email ? "red.500" : undefined}
                    />
                    {errors.email && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.email.message}
                      </Text>
                    )}
                  </Box>

                  {/* 관리자 여부 (자동 설정) */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      관리자 여부
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      {watch("majorId") === 2
                        ? "매니저 전공 선택으로 인해 자동으로 관리자로 설정됩니다."
                        : "일반 선생님으로 설정됩니다."}
                    </Text>
                  </Box>

                  {/* 근무일수 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      근무일수
                    </Text>
                    <Input
                      {...register("workingDays", { valueAsNumber: true })}
                      type="number"
                      placeholder="근무일수를 입력하세요"
                      borderColor={errors.workingDays ? "red.500" : undefined}
                    />
                    {errors.workingDays && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.workingDays.message}
                      </Text>
                    )}
                  </Box>

                  {/* 버튼 */}
                  <HStack gap={2} pt={4}>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      flex={1}
                      disabled={isSaving}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      flex={1}
                      loading={isSaving}
                      disabled={isSaving}
                    >
                      생성
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
