'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HStack, Circle, Flex } from '@chakra-ui/react';
import { LESSON_STATUS_COLORS } from './grid/utils';

export default function TooltipSection() {
  return (
    <Flex justifyContent="flex-end" py={2}>
      <HStack gap={2}>
        <Tooltip content="완료된 레슨" showArrow openDelay={10} closeDelay={200}>
          <Circle
            size="16px"
            bg={LESSON_STATUS_COLORS.COMPLETED}
            border="1px solid"
            borderColor="gray.500"
          />
        </Tooltip>
        <Tooltip content="당일 취소된 레슨" showArrow openDelay={10} closeDelay={200}>
          <Circle
            size="16px"
            bg={LESSON_STATUS_COLORS.CANCELLED}
            border="1px solid"
            borderColor="gray.500"
          />
        </Tooltip>
        <Tooltip content="일반 레슨" showArrow openDelay={10} closeDelay={200}>
          <Circle
            size="16px"
            bg={LESSON_STATUS_COLORS.REGULAR}
            border="1px solid"
            borderColor="gray.500"
          />
        </Tooltip>
        <Tooltip content="그랜드 레슨" showArrow openDelay={10} closeDelay={200}>
          <Circle
            size="16px"
            bg={LESSON_STATUS_COLORS.GRAND}
            border="1px solid"
            borderColor="gray.500"
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
}
