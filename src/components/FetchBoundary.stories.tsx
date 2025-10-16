import type { Meta, StoryObj } from "@storybook/nextjs";
import React, { useState, useEffect } from "react";
import FetchBoundary, { DefaultFetchBoundary } from "./FetchBoundary";
import { Box, Text } from "@chakra-ui/react";

const meta: Meta<typeof FetchBoundary> = {
  title: "Components/FetchBoundary",
  component: FetchBoundary,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isLoading: {
      control: "boolean",
      description: "로딩 상태",
    },
    error: {
      control: "text",
      description: "에러 메시지",
    },
    isEmpty: {
      control: "boolean",
      description: "빈 데이터 상태",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 사용 예시
export const Default: Story = {
  args: {
    isLoading: false,
    error: null,
    isEmpty: false,
    children: (
      <Box p={4}>
        <Text color="gray.700" fontWeight="medium">
          정상적으로 로드된 데이터입니다.
        </Text>
      </Box>
    ),
  },
};

// 로딩 상태
export const Loading: Story = {
  args: {
    isLoading: true,
    error: null,
    isEmpty: false,
    children: <Box>이 내용은 로딩 중에는 보이지 않습니다.</Box>,
  },
};

// 에러 상태
export const Error: Story = {
  args: {
    isLoading: false,
    error: "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
    isEmpty: false,
    children: <Box>이 내용은 에러 발생 시 보이지 않습니다.</Box>,
  },
};

// 빈 데이터 상태
export const Empty: Story = {
  args: {
    isLoading: false,
    error: null,
    isEmpty: true,
    children: <Box>이 내용은 데이터가 없을 때 보이지 않습니다.</Box>,
  },
};

// 커스텀 로딩 fallback
export const CustomLoadingFallback: Story = {
  args: {
    isLoading: true,
    error: null,
    isEmpty: false,
    loadingFallback: (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={8}
        gap={4}
      >
        <Text fontSize="lg" fontWeight="bold" color="gray.600">
          커스텀 로딩...
        </Text>
        <Text fontSize="sm" color="gray.500">
          잠시만 기다려주세요
        </Text>
      </Box>
    ),
    children: <Box>이 내용은 로딩 중에는 보이지 않습니다.</Box>,
  },
};

// 커스텀 에러 fallback
export const CustomErrorFallback: Story = {
  args: {
    isLoading: false,
    error: "네트워크 오류가 발생했습니다.",
    errorFallback: (
      <Box
        p={6}
        bg="red.50"
        border="2px solid"
        borderColor="red.200"
        borderRadius="lg"
        textAlign="center"
      >
        <Text fontSize="xl" fontWeight="bold" color="red.600" mb={2}>
          ⚠️ 오류 발생
        </Text>
        <Text color="red.500">
          페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
        </Text>
      </Box>
    ),
    children: <Box>이 내용은 에러 발생 시 보이지 않습니다.</Box>,
  },
};

// 커스텀 빈 데이터 fallback
export const CustomEmptyFallback: Story = {
  args: {
    isLoading: false,
    error: null,
    isEmpty: true,
    emptyFallback: (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={8}
        gap={4}
      >
        <Text fontSize="2xl">📭</Text>
        <Text fontSize="lg" fontWeight="bold" color="gray.600">
          아직 등록된 데이터가 없습니다
        </Text>
        <Text fontSize="sm" color="gray.500">
          새로운 데이터를 추가해보세요
        </Text>
      </Box>
    ),
    children: <Box>이 내용은 데이터가 없을 때 보이지 않습니다.</Box>,
  },
};

// DefaultFetchBoundary 사용 예시
export const DefaultFetchBoundaryExample: Story = {
  render: () => (
    <DefaultFetchBoundary isLoading={false} error={null} isEmpty={false}>
      <Box p={4}>
        <Text color="gray.700" fontWeight="medium">
          DefaultFetchBoundary를 사용한 예시입니다.
        </Text>
        <Text fontSize="sm" color="gray.600" mt={2}>
          기본 fallback들이 자동으로 적용됩니다.
        </Text>
      </Box>
    </DefaultFetchBoundary>
  ),
};

// 실제 사용 시나리오: API 호출 시뮬레이션
export const ApiCallSimulation: Story = {
  render: () => {
    const [state, setState] = useState<{
      isLoading: boolean;
      error: string | null;
      data: any[] | null;
    }>({
      isLoading: true,
      error: null,
      data: null,
    });

    useEffect(() => {
      // 3초 후 로딩 완료 시뮬레이션
      const timer = setTimeout(() => {
        setState({
          isLoading: false,
          error: null,
          data: ["데이터 1", "데이터 2", "데이터 3"],
        });
      }, 3000);

      return () => clearTimeout(timer);
    }, []);

    return (
      <DefaultFetchBoundary
        isLoading={state.isLoading}
        error={state.error}
        isEmpty={!state.data || state.data.length === 0}
      >
        <Box p={4}>
          <Text fontWeight="bold" mb={2} color="gray.700">
            로드된 데이터:
          </Text>
          {state.data?.map((item, index) => (
            <Text key={index} fontSize="sm" color="gray.600">
              • {item}
            </Text>
          ))}
        </Box>
      </DefaultFetchBoundary>
    );
  },
};
