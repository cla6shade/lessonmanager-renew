import { Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";

interface DateInputValues {
  year?: number;
  month?: number;
  day?: number;
}

interface DateInputProps {
  date?: Date;
  isOptional?: boolean;
  onDateChange: (date: Date | undefined) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function DateInput({
  date,
  isOptional = false,
  onDateChange,
  onKeyDown,
}: DateInputProps) {
  const form = useForm<DateInputValues>({
    defaultValues: {
      year: date ? date.getFullYear() : undefined,
      month: date ? date.getMonth() + 1 : undefined,
      day: date ? date.getDate() : undefined,
    },
    mode: "onChange",
  });

  const watchedValues = useWatch({
    control: form.control,
    name: ["year", "month", "day"],
  });

  useEffect(() => {
    const [year, month, day] = watchedValues;

    if (year && month && day) {
      const newDate = new Date(year, month - 1, day);
      if (
        newDate.getFullYear() === year &&
        newDate.getMonth() === month - 1 &&
        newDate.getDate() === day
      ) {
        onDateChange(newDate);
        return;
      }
    }
    onDateChange(undefined);
  }, [watchedValues, onDateChange]);

  const hasError =
    !!form.formState.errors.year ||
    !!form.formState.errors.month ||
    !!form.formState.errors.day;

  return (
    <Box>
      <Text fontWeight="bold" mb={2}>
        생년월일
      </Text>

      <VStack align="stretch" gap={1}>
        <HStack gap={2}>
          <Box flex={1}>
            <Input
              type="number"
              placeholder="연도"
              {...form.register("year", {
                required: isOptional ? false : "연도는 필수입니다",
                valueAsNumber: true,
                min: isOptional
                  ? undefined
                  : { value: 1900, message: "연도는 1900년 이상이어야 합니다" },
              })}
              onKeyDown={onKeyDown}
              borderColor={form.formState.errors.year ? "red.500" : undefined}
            />
          </Box>

          <Box flex={1}>
            <Input
              type="number"
              placeholder="월"
              {...form.register("month", {
                required: isOptional ? false : "월은 필수입니다",
                valueAsNumber: true,
                min: isOptional
                  ? undefined
                  : { value: 1, message: "월은 1월 이상이어야 합니다" },
                max: isOptional
                  ? undefined
                  : { value: 12, message: "월은 12월 이하여야 합니다" },
              })}
              onKeyDown={onKeyDown}
              borderColor={form.formState.errors.month ? "red.500" : undefined}
            />
          </Box>

          <Box flex={1}>
            <Input
              type="number"
              placeholder="일"
              {...form.register("day", {
                required: isOptional ? false : "일은 필수입니다",
                valueAsNumber: true,
                min: isOptional
                  ? undefined
                  : { value: 1, message: "일은 1일 이상이어야 합니다" },
                max: isOptional
                  ? undefined
                  : { value: 31, message: "일은 31일 이하여야 합니다" },
              })}
              onKeyDown={onKeyDown}
              borderColor={form.formState.errors.day ? "red.500" : undefined}
            />
          </Box>
        </HStack>

        <Box minH="16px">
          {hasError && (
            <Text color="red.500" fontSize="xs">
              잘못된 날짜입니다.
            </Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
