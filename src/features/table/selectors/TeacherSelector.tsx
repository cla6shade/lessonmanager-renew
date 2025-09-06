"use client";

import {
  Box,
  Flex,
  Text,
  Popover,
  Portal,
  VStack,
  Button,
} from "@chakra-ui/react";
import { ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { useTable } from "../TableProvider";
import { Teacher } from "@/generated/prisma";

export default function TeacherSelector() {
  const { teachers, selectedTeacher, setSelectedTeacher } = useTable();
  const [isOpen, setIsOpen] = useState(false);

  const handleTeacherSelect = (teacher: Teacher | null) => {
    setSelectedTeacher(teacher);
    setIsOpen(false);
  };

  const displayName = selectedTeacher ? selectedTeacher.name : "전체";

  return (
    <Box
      bg="white"
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
      width="fit-content"
    >
      <Flex position="relative">
        <Popover.Root
          open={isOpen}
          onOpenChange={({ open }) => setIsOpen(open)}
          positioning={{ placement: "bottom" }}
        >
          <Popover.Trigger>
            <Box
              border="1px solid"
              borderColor="gray.500"
              px={{
                base: 4,
                lg: 4,
              }}
              py={2}
              rounded="sm"
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              minWidth="120px"
            >
              <Flex
                align="center"
                justify="space-between"
                gap={2}
                color="gray.900"
                fontSize={{
                  base: "xs",
                  lg: "sm",
                }}
                fontWeight="medium"
              >
                <Flex align="center" gap={1}>
                  <User size={16} />
                  <Text>{displayName}</Text>
                </Flex>
                <ChevronDown size={16} />
              </Flex>
            </Box>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content width="auto" minWidth="120px">
                <Popover.Body p={2}>
                  <VStack gap={1} align="stretch">
                    <Button
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      onClick={() => handleTeacherSelect(null)}
                      bg={!selectedTeacher ? "blue.50" : "transparent"}
                      color={!selectedTeacher ? "blue.600" : "gray.700"}
                      _hover={{ bg: "gray.100" }}
                    >
                      전체
                    </Button>
                    {teachers.map((teacher) => (
                      <Button
                        key={teacher.id}
                        variant="ghost"
                        size="sm"
                        justifyContent="flex-start"
                        onClick={() => handleTeacherSelect(teacher)}
                        bg={
                          selectedTeacher?.id === teacher.id
                            ? "blue.50"
                            : "transparent"
                        }
                        color={
                          selectedTeacher?.id === teacher.id
                            ? "blue.600"
                            : "gray.700"
                        }
                        _hover={{ bg: "gray.100" }}
                      >
                        {teacher.name}
                      </Button>
                    ))}
                  </VStack>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </Flex>
    </Box>
  );
}
