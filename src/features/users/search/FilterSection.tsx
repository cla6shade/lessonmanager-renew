"use client";

import { Flex, Input, Button, HStack, VStack } from "@chakra-ui/react";
import FilterSelector from "./FilterSelector";
import { useUserTable } from "../table/UserTableProvider";
import { useFilter } from "./FilterProvider";
import { Filter } from "lucide-react";
import { useRef, KeyboardEvent } from "react";

export default function FilterSection() {
  const { setSearchName, setSearchContact, setSearchBirthDate } = useFilter();

  const { setPage, setSelectedUsers, setIsAllSelected } = useUserTable();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const birthYearInputRef = useRef<HTMLInputElement>(null);
  const birthMonthInputRef = useRef<HTMLInputElement>(null);
  const birthDayInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const nameValue = nameInputRef.current?.value || "";
    const contactValue = contactInputRef.current?.value || "";
    const birthYearValue = birthYearInputRef.current?.value || "";
    const birthMonthValue = birthMonthInputRef.current?.value || "";
    const birthDayValue = birthDayInputRef.current?.value || "";

    const birthDateValue =
      birthYearValue && birthMonthValue && birthDayValue
        ? new Date(
            parseInt(birthYearValue, 10),
            parseInt(birthMonthValue, 10) - 1,
            parseInt(birthDayValue, 10)
          ).toISOString()
        : "";

    setSearchName(nameValue);
    setSearchContact(contactValue);
    setSearchBirthDate(birthDateValue);
    setPage(1);
    setSelectedUsers(new Set());
    setIsAllSelected(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <VStack mb={4} alignItems="stretch" gap={3}>
      <Flex alignItems="center" gap={4}>
        <Flex alignItems="center" gap={2}>
          <Filter size={20} />
          <FilterSelector />
        </Flex>
      </Flex>

      <Flex alignItems="center" gap={4} flexWrap="wrap">
        <HStack gap={2}>
          <Input
            ref={nameInputRef}
            placeholder="이름 검색"
            onKeyDown={handleKeyDown}
            size="sm"
            width="150px"
          />
        </HStack>

        <HStack gap={1}>
          <Input
            ref={birthYearInputRef}
            placeholder="년"
            onKeyDown={handleKeyDown}
            size="sm"
            width="60px"
            maxLength={4}
          />
          <Input
            ref={birthMonthInputRef}
            placeholder="월"
            onKeyDown={handleKeyDown}
            size="sm"
            width="50px"
            maxLength={2}
          />
          <Input
            ref={birthDayInputRef}
            placeholder="일"
            onKeyDown={handleKeyDown}
            size="sm"
            width="50px"
            maxLength={2}
          />
        </HStack>

        <HStack gap={2}>
          <Input
            ref={contactInputRef}
            placeholder="휴대폰 번호 검색"
            onKeyDown={handleKeyDown}
            size="sm"
            width="180px"
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
