'use client';

import brand from '@/brand/baseInfo';
import colors from '@/brand/colors';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import BrandLinkSection from './BrandLinkSection';
import { useLogin } from './LoginProvider';

export default function LoginBanner() {
  const { loginState } = useLogin();
  return (
    <Box
      w="50%"
      h="full"
      py={10}
      backgroundColor={colors.brandPanel}
      borderLeftRadius="xl"
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
    >
      <Flex
        grow={1}
        flexDirection="column"
        justifyContent="center"
        display={{ base: 'none', lg: 'flex' }}
        color="white"
        alignItems="center"
        gap={16}
      >
        <Flex flexDirection="column" gap={3} alignItems="center">
          <Heading size="3xl" fontWeight="normal" color="white">
            {brand.name}
          </Heading>
          <Box w="80px" h="1px" bg={colors.brandDark} />
          <Text color={colors.brandDark}>{brand.description}</Text>
        </Flex>
        <Text color="gray.300" fontSize="sm">
          {loginState.errorMessage ?? '계속하려면 로그인해주세요'}
        </Text>
      </Flex>
      <BrandLinkSection />
    </Box>
  );
}
