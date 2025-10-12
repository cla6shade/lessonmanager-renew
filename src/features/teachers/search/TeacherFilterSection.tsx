"use client";

import { Flex, Button, HStack, VStack, Input } from "@chakra-ui/react";
import { Calendar } from "lucide-react";
import { useRef } from "react";
import { useTeacherFilter } from "./TeacherFilterProvider";
import { useTeacherManagement } from "../TeacherManagmentProvider";

export default function TeacherFilterSection() {
  const { startDate, endDate, setStartDate, setEndDate } = useTeacherFilter();
  const { setPage } = useTeacherManagement();

  const startYearRef = useRef<HTMLInputElement>(null);
  const startMonthRef = useRef<HTMLInputElement>(null);
  const startDayRef = useRef<HTMLInputElement>(null);
  const endYearRef = useRef<HTMLInputElement>(null);
  const endMonthRef = useRef<HTMLInputElement>(null);
  const endDayRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const startYearValue = startYearRef.current?.value || "";
    const startMonthValue = startMonthRef.current?.value || "";
    const startDayValue = startDayRef.current?.value || "";
    const endYearValue = endYearRef.current?.value || "";
    const endMonthValue = endMonthRef.current?.value || "";
    const endDayValue = endDayRef.current?.value || "";

    setStartDate({
      year: startYearValue,
      month: startMonthValue,
      day: startDayValue,
    });
    setEndDate({
      year: endYearValue,
      month: endMonthValue,
      day: endDayValue,
    });
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <VStack mb={4} alignItems="stretch" gap={3}>
      <Flex alignItems="center" gap={4}>
        <Flex alignItems="center" gap={2}>
          <Calendar size={20} />
          <span style={{ fontSize: "14px", fontWeight: "500" }}>기간 필터</span>
        </Flex>
      </Flex>

      <Flex alignItems="center" gap={4} flexWrap="wrap">
        <HStack gap={1}>
          <Input
            ref={startYearRef}
            placeholder="년"
            defaultValue={startDate.year}
            onKeyDown={handleKeyDown}
            size="sm"
            width="60px"
            maxLength={4}
          />
          <Input
            ref={startMonthRef}
            placeholder="월"
            defaultValue={startDate.month}
            onKeyDown={handleKeyDown}
            size="sm"
            width="50px"
            maxLength={2}
          />
          <Input
            ref={startDayRef}
            placeholder="일"
            defaultValue={startDate.day}
            onKeyDown={handleKeyDown}
            size="sm"
            width="50px"
            maxLength={2}
          />
        </HStack>

        <span style={{ fontSize: "14px" }}>~</span>

        <HStack gap={1}>
          <Input
            ref={endYearRef}
            placeholder="년"
            defaultValue={endDate.year}
            onKeyDown={handleKeyDown}
            size="sm"
            width="60px"
            maxLength={4}
          />
          <Input
            ref={endMonthRef}
            placeholder="월"
            defaultValue={endDate.month}
            onKeyDown={handleKeyDown}
            size="sm"
            width="50px"
            maxLength={2}
          />
          <Input
            ref={endDayRef}
            placeholder="일"
            defaultValue={endDate.day}
            onKeyDown={handleKeyDown}
            size="sm"
            width="50px"
            maxLength={2}
          />
        </HStack>

        <Button
          onClick={handleSearch}
          size="sm"
          colorScheme="brand"
          variant="solid"
        >
          검색
        </Button>
      </Flex>
    </VStack>
  );
}
