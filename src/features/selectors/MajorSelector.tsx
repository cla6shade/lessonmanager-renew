import {
  Text,
  Box,
  Popover,
  Portal,
  Flex,
  Button,
  VStack,
} from "@chakra-ui/react";
import { ChevronDown, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Major } from "@/generated/prisma";

interface MajorSelectorProps {
  majors: Major[];
  selectedMajorId: number;
  onMajorSelect: (majorId: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MajorSelector({
  majors,
  selectedMajorId,
  onMajorSelect,
  placeholder = "전공을 선택하세요",
  disabled = false,
}: MajorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedMajor = majors.find((major) => major.id === selectedMajorId);
  const displayMajorName = selectedMajor
    ? `${selectedMajor.symbol} ${selectedMajor.name}`
    : placeholder;

  const handleMajorSelect = (majorId: number) => {
    onMajorSelect(majorId);
    setIsOpen(false);
  };

  return (
    <Box
      bg="white"
      borderRadius="md"
      border="1px"
      borderColor="gray.200"
      width="100%"
    >
      <Popover.Root
        open={isOpen}
        onOpenChange={({ open }) => setIsOpen(open)}
        positioning={{ placement: "bottom" }}
      >
        <Popover.Trigger>
          <Box
            border="1px solid"
            borderColor="gray.300"
            px={3}
            py={2}
            rounded="md"
            cursor={disabled ? "not-allowed" : "pointer"}
            _hover={disabled ? {} : { bg: "gray.50" }}
            minWidth="200px"
            width="100%"
            opacity={disabled ? 0.6 : 1}
          >
            <Flex
              align="center"
              justify="space-between"
              gap={2}
              color="gray.900"
              fontSize="sm"
              fontWeight="medium"
              width="100%"
            >
              <Flex align="center" gap={2}>
                <GraduationCap size={16} />
                <Text>{displayMajorName}</Text>
              </Flex>
              <ChevronDown size={16} />
            </Flex>
          </Box>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content width="auto" minWidth="200px">
              <Popover.Body p={2}>
                <VStack gap={1} align="stretch">
                  {majors.map((major) => (
                    <Button
                      key={major.id}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      onClick={() => handleMajorSelect(major.id)}
                      bg={
                        selectedMajorId === major.id
                          ? "brand.50"
                          : "transparent"
                      }
                      color={
                        selectedMajorId === major.id ? "brand.600" : "gray.700"
                      }
                      _hover={{ bg: "brand.100" }}
                    >
                      {major.symbol} {major.name}
                    </Button>
                  ))}
                </VStack>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Box>
  );
}
