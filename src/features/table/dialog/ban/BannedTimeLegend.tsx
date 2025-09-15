"use client";

import { Box, Text, Flex } from "@chakra-ui/react";

export default function BannedTimeLegend() {
  return (
    <Flex justify="space-around" mb={4} fontSize="sm">
      <Flex align="center">
        <Box
          w={4}
          h={4}
          bg="green.100"
          border="1px solid"
          borderColor="green.300"
          mr={2}
        />
        <Text>레슨 예약 가능</Text>
      </Flex>
      <Flex align="center">
        <Box
          w={4}
          h={4}
          bg="red.200"
          border="1px solid"
          borderColor="red.400"
          mr={2}
        />
        <Text>레슨 예약 불가능</Text>
      </Flex>
      <Flex align="center">
        <Box
          w={4}
          h={4}
          bg="gray.100"
          border="1px solid"
          borderColor="gray.300"
          mr={2}
        />
        <Text>근무 시간 외</Text>
      </Flex>
    </Flex>
  );
}
