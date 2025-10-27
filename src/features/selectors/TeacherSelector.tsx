'use client';

import { Text, Box, Popover, Portal, Flex, Button, VStack } from '@chakra-ui/react';
import { ChevronDown, User } from 'lucide-react';
import { useState } from 'react';
import { ExtendedTeacher } from '../table/types';

type SelectableTeacher = Pick<ExtendedTeacher, 'id' | 'name' | 'major' | 'location'>;

interface TeacherSelectorProps {
  teachers: SelectableTeacher[];
  selectedTeacher: SelectableTeacher | null;
  onTeacherSelect: (teacher: SelectableTeacher | null) => void;
  placeholder?: string;
  disabled?: boolean;
  displayAllOption?: boolean;
  allOptionText?: string;
}

export default function TeacherSelector({
  teachers,
  selectedTeacher,
  onTeacherSelect,
  placeholder = '선생님을 선택하세요',
  disabled = false,
  displayAllOption = true,
  allOptionText = '전체',
}: TeacherSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTeacherSelect = (teacher: SelectableTeacher | null) => {
    onTeacherSelect(teacher);
    setIsOpen(false);
  };

  const displayName = selectedTeacher
    ? `${selectedTeacher.major.symbol}${selectedTeacher.name}`
    : placeholder;

  return (
    <Box bg="white" borderRadius="md" border="1px" borderColor="gray.200" width="100%">
      <Popover.Root
        open={isOpen}
        onOpenChange={({ open }) => setIsOpen(open)}
        positioning={{ placement: 'bottom' }}
      >
        <Popover.Trigger>
          <Box
            border="1px solid"
            borderColor="gray.300"
            px={3}
            py={2}
            rounded="md"
            cursor={disabled ? 'not-allowed' : 'pointer'}
            _hover={disabled ? {} : { bg: 'gray.50' }}
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
                <User size={16} />
                <Text>{displayName}</Text>
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
                  {displayAllOption && (
                    <Button
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      onClick={() => handleTeacherSelect(null)}
                      bg={!selectedTeacher ? 'brand.50' : 'transparent'}
                      color={!selectedTeacher ? 'brand.600' : 'gray.700'}
                      _hover={{ bg: 'brand.100' }}
                    >
                      {allOptionText}
                    </Button>
                  )}
                  {teachers.map((teacher) => (
                    <Button
                      key={`teacher-selection-${teacher.id}-${teacher.location.id}`}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      onClick={() => handleTeacherSelect(teacher)}
                      bg={selectedTeacher?.id === teacher.id ? 'brand.50' : 'transparent'}
                      color={selectedTeacher?.id === teacher.id ? 'brand.600' : 'gray.700'}
                      _hover={{ bg: 'brand.100' }}
                    >
                      {teacher.major.symbol}
                      {teacher.name}
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
