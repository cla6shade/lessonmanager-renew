"use client";

import Spinner from "@/components/Spinner";
import { ChevronRight } from "lucide-react";
import { Box, Flex, Input, Button, Text } from "@chakra-ui/react";
import colors from "@/brand/colors";
import brand from "@/brand/baseInfo";
import Image from "next/image";
import BrandLinkSection from "./BrandLinkSection";
import { useLogin } from "./LoginProvider";

export default function LoginForm() {
  const { loginState, formAction, pending } = useLogin();

  return (
    <Box
      display="flex"
      flexDirection="column"
      w={{ base: "full", lg: "50%" }}
      h="full"
      bg={{ base: colors.brandPanel, lg: "white" }}
      borderRightRadius={{ base: "none", lg: "xl" }}
    >
      <form action={formAction} style={{ flexGrow: 1 }}>
        <Flex
          direction="column"
          justify="center"
          align="center"
          w="full"
          h="full"
          px={10}
          gap={2}
        >
          <Box
            display={{ base: "flex", lg: "none" }}
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Image
              src={brand.logo.src}
              alt={brand.name}
              width={200}
              height={80}
            />
            <Text fontSize="md" color="gray.400" marginBottom={25}>
              {loginState.errorMessage ?? "계속하려면 로그인해주세요."}
            </Text>
          </Box>
          <Box w="full">
            <Input
              id="loginId"
              name="loginId"
              placeholder="아이디"
              disabled={pending}
              bg={{ base: "transparent", lg: "gray.200" }}
              color={{ base: "white", lg: "gray.800" }}
              _placeholder={{ color: { base: "gray.300", lg: "gray.500" } }}
              border="1px solid"
              borderColor={{ base: "gray.600", lg: "gray.300" }}
            />
            {loginState.errors?.fieldErrors?.loginId && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {loginState.errors.fieldErrors.loginId[0]}
              </Text>
            )}
          </Box>

          <Box w="full">
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="비밀번호"
              disabled={pending}
              bg={{ base: "transparent", lg: "gray.200" }}
              color={{ base: "white", lg: "gray.800" }}
              _placeholder={{ color: { base: "gray.300", lg: "gray.500" } }}
              border="1px solid"
              borderColor={{ base: "gray.600", lg: "gray.300" }}
            />
            {loginState.errors?.fieldErrors?.password && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {loginState.errors.fieldErrors.password[0]}
              </Text>
            )}
          </Box>

          <Flex w="full" alignItems="center" gap={2}>
            <input
              type="checkbox"
              id="isAdmin"
              name="isAdmin"
              value="true"
              disabled={pending}
            />
            <label htmlFor="isAdmin">
              <Text
                color={{ base: "white", lg: "gray.800" }}
                fontSize="sm"
                cursor="pointer"
              >
                관리자 로그인
              </Text>
            </label>
          </Flex>

          <Button
            type="submit"
            mt={6}
            w={12}
            h={12}
            bg={colors.brand}
            _hover={{ bg: colors.brandDark }}
            disabled={pending}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {pending ? <Spinner /> : <ChevronRight size={24} color="white" />}
          </Button>
        </Flex>
      </form>
      <Box display={{ base: "flex", lg: "none" }} pb={20}>
        <BrandLinkSection />
      </Box>
    </Box>
  );
}
