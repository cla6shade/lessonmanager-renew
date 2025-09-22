import {
  Text,
  VStack,
  HStack,
  Separator,
  Button,
  Input,
  Box,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { CenteredSpinner } from "@/components/Spinner";
import { formatDate } from "@/utils/date";
import { useUpdateUser } from "./hooks/useUpdateUser";
import { UpdateUserRequestSchema } from "@/app/(users)/api/users/[id]/schema";
import { useUserTable } from "./UserTableProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LocationSelector from "@/features/selectors/LocationSelector";
import z from "zod";
import { UserSearchResult } from "@/app/(users)/api/users/schema";

const UpdateUserFormSchema = UpdateUserRequestSchema.omit({
  birth: true,
}).extend({
  birthYear: z.string().optional(),
  birthMonth: z.string().optional(),
  birthDay: z.string().optional(),
});

interface UserDetailContentProps {
  user: UserSearchResult;
  loading: boolean;
  error: string | null;
  onUserUpdate: (updatedUser: UserSearchResult) => void;
}

export default function UserDetailContent({
  user,
  loading,
  onUserUpdate,
}: UserDetailContentProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const { update, isSaving } = useUpdateUser();
  const { locations } = useUserTable();

  const form = useForm<
    z.input<typeof UpdateUserFormSchema>,
    z.output<typeof UpdateUserFormSchema>
  >({
    resolver: zodResolver(UpdateUserFormSchema),
    defaultValues: {
      name: user?.name || "",
      contact: user?.contact || "",
      birthYear: user?.birth
        ? new Date(user.birth).getFullYear().toString()
        : "",
      birthMonth: user?.birth
        ? (new Date(user.birth).getMonth() + 1).toString()
        : "",
      birthDay: user?.birth ? new Date(user.birth).getDate().toString() : "",
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

      const updateData: z.input<typeof UpdateUserRequestSchema> = {
        name: data.name,
        contact: data.contact,
        birth: birthISO,
        address: data.address,
        email: data.email,
        ability: data.ability,
        genre: data.genre,
        locationId: data.locationId,
      };

      const result = await update(updateData, {
        endpoint: `/api/users/${user.id}`,
        method: "PUT",
        successMessage: "사용자 정보가 수정되었습니다.",
      });

      if (result.success && result.data) {
        onUserUpdate(result.data.data);

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
        birthYear: user.birth
          ? new Date(user.birth).getFullYear().toString()
          : "",
        birthMonth: user.birth
          ? (new Date(user.birth).getMonth() + 1).toString()
          : "",
        birthDay: user.birth ? new Date(user.birth).getDate().toString() : "",
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
              <Text>
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
              </Text>
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
              <HStack gap={2}>
                <Box flex={1}>
                  <Input
                    type="number"
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
                    type="number"
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
                    type="number"
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
                loadingText="저장 중..."
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
    </VStack>
  );
}
