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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserRequestSchema } from "@/app/(users)/api/users/schema";
import { useCreateUser } from "@/features/users/creation/useCreateUser";
import { useUserTable } from "@/features/users/table/UserTableProvider";
import { useNavigation } from "@/features/navigation/provider/NavigationContext";
import LocationSelector from "@/features/selectors/LocationSelector";
import DateInput from "@/features/inputs/DateInput";

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateUserFormSchema = CreateUserRequestSchema.extend({
  birth: z.string(),
});

export default function CreateUserDialog({
  isOpen,
  onClose,
}: CreateUserDialogProps) {
  const { refetchUsers } = useUserTable();
  const { locations } = useNavigation();

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<z.input<typeof CreateUserFormSchema>>({
    resolver: zodResolver(CreateUserFormSchema),
    defaultValues: {
      locationId: 0,
      name: "",
      gender: false, // false = 남성, true = 여성
      contact: "",
      loginId: "",
      password: "",
      passwordConfirm: "",
      email: "",
      ability: "",
      genre: "",
      howto: 1,
      address: "",
      birth: "",
    },
  });

  const { createUser, isSaving } = useCreateUser();

  const onSubmit = async (
    createData: z.output<typeof CreateUserFormSchema>
  ) => {
    const result = await createUser(createData);

    if (result.success) {
      refetchUsers();
      reset();
      onClose();
    }
  };

  const handleLocationSelect = (locationId: number) => {
    setValue("locationId", locationId);
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
                새 사용자 생성
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
                    <Controller
                      control={control}
                      name="birth"
                      render={({ field }) => (
                        <DateInput
                          borderColor={errors.birth ? "red.500" : undefined}
                          {...field}
                        />
                      )}
                    />
                    {errors.birth && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.birth.message}
                      </Text>
                    )}
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

                  {/* 경력 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      경력
                    </Text>
                    <Input
                      {...register("ability")}
                      placeholder="경력을 입력하세요"
                      borderColor={errors.ability ? "red.500" : undefined}
                    />
                    {errors.ability && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.ability.message}
                      </Text>
                    )}
                  </Box>

                  {/* 장르 */}
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      장르
                    </Text>
                    <Input
                      {...register("genre")}
                      placeholder="선호 장르를 입력하세요"
                      borderColor={errors.genre ? "red.500" : undefined}
                    />
                    {errors.genre && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.genre.message}
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
