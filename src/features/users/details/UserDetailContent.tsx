import {
  Text,
  VStack,
  HStack,
  Separator,
  Button,
  Input,
  Box,
  Flex,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { CenteredSpinner } from "@/components/Spinner";
import { formatDate } from "@/utils/date";
import { useUpdateUser } from "./useUpdateUser";
import { UpdateUserRequestSchema } from "@/app/(users)/api/users/[id]/schema";
import { useUserTable } from "../table/UserTableProvider";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LocationSelector from "@/features/selectors/LocationSelector";
import z from "zod";
import { UserSearchResult } from "@/app/(users)/api/users/schema";
import UserStartdateSetDialog from "../payments/UserStartdateSetDialog";
import DateInput from "@/features/inputs/DateInput";

const UpdateUserFormSchema = UpdateUserRequestSchema.extend({
  birth: z.string(),
});

interface UserDetailContentProps {
  user: UserSearchResult;
  loading: boolean;
  error: string | null;
  onUserUpdate: (updatedUser: UserSearchResult) => void;
  refetchUsers: () => void;
}

export default function UserDetailContent({
  user,
  loading,
  onUserUpdate,
  refetchUsers,
}: UserDetailContentProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const { update, isSaving } = useUpdateUser();
  const { locations } = useUserTable();
  const [isStartDateSetDialogOpen, setIsStartDateSetDialogOpen] =
    useState(false);
  const form = useForm<z.input<typeof UpdateUserFormSchema>>({
    resolver: zodResolver(UpdateUserFormSchema),
    defaultValues: {
      name: user?.name || "",
      contact: user?.contact || "",
      birth: user?.birth ? new Date(user.birth).toISOString() : "",
      address: user?.address || "",
      email: user?.email || "",
      ability: user?.ability || "",
      genre: user?.genre || "",
      locationId: user?.locationId === undefined ? 0 : user.locationId,
    },
  });

  const formatText = (text: string | null | undefined) => {
    if (!text || text.trim() === "") return "(없음)";
    return text;
  };

  const handleSave = useCallback(
    async (data: z.output<typeof UpdateUserFormSchema>) => {
      if (!user) return;

      const { success, data: updatedUser } = await update(data, {
        endpoint: `/api/users/${user.id}`,
        method: "PUT",
        successMessage: "사용자 정보가 수정되었습니다.",
      });

      if (success && updatedUser) {
        onUserUpdate(updatedUser.data);
        refetchUsers();
        setIsEditMode(false);
      }
    },
    [user, update, onUserUpdate]
  );

  const handleCancel = () => {
    if (user) {
      form.reset({
        name: user.name || "",
        contact: user.contact || "",
        birth: user.birth?.toISOString() || "",
        address: user.address || "",
        email: user.email || "",
        ability: user.ability || "",
        genre: user.genre || "",
        locationId: user.locationId,
      });
    }
    setIsEditMode(false);
  };

  const handleLocationSelect = (locationId: number) => {
    form.setValue("locationId", locationId);
  };

  if (loading) {
    return <CenteredSpinner size="lg" minHeight="400px" />;
  }

  return (
    <VStack gap={4} align="stretch">
      {!isEditMode ? (
        <>
          <HStack justify="space-between">
            <Text fontWeight="bold">ID:</Text>
            <Text>{user.id}</Text>
          </HStack>

          <Separator />

          <HStack justify="space-between">
            <Text fontWeight="bold">이름:</Text>
            <Text>{formatText(user.name)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">생년월일:</Text>
            <Text>
              {user.birth
                ? formatDate(new Date(user.birth), true, true)
                : "(없음)"}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">연락처:</Text>
            <Text>{formatText(user.contact)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">주소:</Text>
            <Text>{formatText(user.address)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">이메일:</Text>
            <Text>{formatText(user.email)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">실력:</Text>
            <Text>{formatText(user.ability)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">장르:</Text>
            <Text>{formatText(user.genre)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">지점:</Text>
            <Text>{user.location?.name || "(없음)"}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">담당 선생님:</Text>
            <Text>
              {user.teacherInCharge
                ? `${user.teacherInCharge.major.symbol} ${user.teacherInCharge.name}`
                : "(없음)"}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">레슨 횟수:</Text>
            <Text>{user.lessonCount ? `${user.lessonCount}회` : "(없음)"}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">사용한 레슨 횟수:</Text>
            <Text>
              {user.usedLessonCount ? `${user.usedLessonCount}회` : "(없음)"}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontWeight="bold">등록일:</Text>
            <Text>{formatDate(new Date(user.registeredAt), true, true)}</Text>
          </HStack>

          <Separator />

          {user.payments && user.payments.length === 1 && (
            <HStack justify="space-between">
              <Text fontWeight="bold">결제 기간:</Text>
              <Flex gap={2} align="center">
                {user.payments[0].startDate && user.payments[0].endDate
                  ? `${formatDate(
                      new Date(user.payments[0].startDate),
                      true,
                      true
                    )} ~ ${formatDate(
                      new Date(user.payments[0].endDate),
                      true,
                      true
                    )}`
                  : "시작일 미정"}
                {user.payments[0].refunded && (
                  <Text as="span" color="red.500" ml={2}>
                    (환불됨)
                  </Text>
                )}
                {user.payments[0].isStartDateNonSet ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsStartDateSetDialogOpen(true);
                    }}
                  >
                    설정
                  </Button>
                ) : null}
              </Flex>
            </HStack>
          )}

          <Separator />
          <Button onClick={() => setIsEditMode(true)} colorPalette="brand">
            수정하기
          </Button>
        </>
      ) : (
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
              <Controller
                control={form.control}
                name="birth"
                render={({ field }) => (
                  <DateInput
                    borderColor={
                      form.formState.errors.birth ? "red.500" : undefined
                    }
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
                연락처
              </Text>
              <Input
                {...form.register("contact")}
                placeholder="연락처를 입력하세요"
                borderColor={
                  form.formState.errors.contact ? "red.500" : undefined
                }
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
                borderColor={
                  form.formState.errors.address ? "red.500" : undefined
                }
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
                borderColor={
                  form.formState.errors.email ? "red.500" : undefined
                }
              />
              {form.formState.errors.email && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {form.formState.errors.email.message}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>
                경력
              </Text>
              <Input
                {...form.register("ability")}
                placeholder="경력을 입력하세요"
                borderColor={
                  form.formState.errors.ability ? "red.500" : undefined
                }
              />
              {form.formState.errors.ability && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {form.formState.errors.ability.message}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>
                장르
              </Text>
              <Input
                {...form.register("genre")}
                placeholder="선호 장르를 입력하세요"
                borderColor={
                  form.formState.errors.genre ? "red.500" : undefined
                }
              />
              {form.formState.errors.genre && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {form.formState.errors.genre.message}
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
                selectedLocationId={form.watch("locationId")}
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
                담당 선생님
              </Text>
              <Input
                value={
                  user.teacherInCharge
                    ? `${user.teacherInCharge.major.symbol} ${user.teacherInCharge.name}`
                    : "(없음)"
                }
                readOnly
                bg="gray.50"
                cursor="not-allowed"
              />
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
              <Button onClick={handleCancel} variant="outline" flex={1}>
                취소
              </Button>
            </HStack>
          </VStack>
        </VStack>
      )}
      <UserStartdateSetDialog
        isOpen={isStartDateSetDialogOpen}
        onClose={() => setIsStartDateSetDialogOpen(false)}
        paymentId={user.payments?.[0]?.id || 0}
        user={user}
        onUserUpdate={onUserUpdate}
      />
    </VStack>
  );
}
