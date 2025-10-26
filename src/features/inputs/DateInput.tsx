import { buildDate } from "@/utils/date";
import { Flex, Input } from "@chakra-ui/react";
import { useState } from "react";
import z from "zod";

interface DateInputProps {
  name: string;
  value?: string;
  onChange: (date: string) => void;
  borderColor?: string;
}
type DateData = { year: string; month: string; day: string };
const dateDataSchema = z.object({
  year: z.preprocess(
    (val) => parseInt(val as string),
    z.number().min(1900).max(2100)
  ),
  month: z.preprocess(
    (val) => parseInt(val as string),
    z.number().min(1).max(12)
  ),
  day: z.preprocess(
    (val) => parseInt(val as string),
    z.number().min(1).max(31)
  ),
});
export default function DateInput({
  name,
  value,
  onChange,
  borderColor,
}: DateInputProps) {
  const date = value ? new Date(value) : undefined;
  const [dateData, setDateData] = useState<DateData>({
    year: date?.getFullYear().toString() ?? "",
    month: date ? (date.getMonth() + 1).toString() : "",
    day: date?.getDate().toString() ?? "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name: inputName } = e.target;
    const modifiedDateData = { ...dateData, [inputName]: value };
    setDateData(modifiedDateData);

    const { success, data } = dateDataSchema.safeParse(modifiedDateData);
    if (!success) {
      onChange("");
      return;
    }
    const date = buildDate(data.year, data.month, data.day);
    if (
      date.getFullYear() !== data.year ||
      date.getMonth() + 1 !== data.month ||
      date.getDate() !== data.day
    ) {
      onChange("");
      return;
    }
    console.log("date", date.toISOString());
    onChange(date.toISOString());
  };
  return (
    <Flex gap={1} direction="column">
      <Flex gap={1}>
        <Input
          name="year"
          placeholder="연"
          value={dateData.year}
          onChange={handleChange}
          borderColor={borderColor}
        />
        <Input
          name="month"
          placeholder="월"
          value={dateData.month}
          onChange={handleChange}
          borderColor={borderColor}
        />
        <Input
          name="day"
          placeholder="일"
          value={dateData.day}
          onChange={handleChange}
          borderColor={borderColor}
        />
      </Flex>
    </Flex>
  );
}
