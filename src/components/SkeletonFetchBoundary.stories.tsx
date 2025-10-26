import type { Meta, StoryObj } from "@storybook/nextjs";
import React, { useState, useEffect } from "react";
import SkeletonFetchBoundary from "./SkeletonFetchBoundary";
import { Box, Text, Table } from "@chakra-ui/react";

const meta: Meta<typeof SkeletonFetchBoundary> = {
  title: "Components/SkeletonFetchBoundary",
  component: SkeletonFetchBoundary,
  parameters: {
    layout: "padded",
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
    rows: {
      control: "number",
      description: "스켈레톤 테이블 행 수",
    },
    columns: {
      control: "number",
      description: "스켈레톤 테이블 열 수",
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
    rows: 10,
    columns: 7,
    children: (
      <Box
        width="100%"
        minHeight="400px"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
      >
        <Table.Root variant="outline" size="lg">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>이름</Table.ColumnHeader>
              <Table.ColumnHeader>지점</Table.ColumnHeader>
              <Table.ColumnHeader>전공</Table.ColumnHeader>
              <Table.ColumnHeader>생년월일</Table.ColumnHeader>
              <Table.ColumnHeader>휴대폰 번호</Table.ColumnHeader>
              <Table.ColumnHeader>비고</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>1</Table.Cell>
              <Table.Cell>김선생</Table.Cell>
              <Table.Cell>강남점</Table.Cell>
              <Table.Cell>피아노</Table.Cell>
              <Table.Cell>1990-01-01</Table.Cell>
              <Table.Cell>010-1234-5678</Table.Cell>
              <Table.Cell>
                <Text fontSize="sm" color="gray.600">
                  정상 데이터
                </Text>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>
    ),
  },
};

// 로딩 상태 (스켈레톤)
export const Loading: Story = {
  args: {
    isLoading: true,
    error: null,
    isEmpty: false,
    rows: 10,
    columns: 7,
    children: <Box>이 내용은 로딩 중에는 보이지 않습니다.</Box>,
  },
};

// 에러 상태
export const Error: Story = {
  args: {
    isLoading: false,
    error: "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
    isEmpty: false,
    rows: 10,
    columns: 7,
    children: <Box>이 내용은 에러 발생 시 보이지 않습니다.</Box>,
  },
};

// 빈 데이터 상태
export const Empty: Story = {
  args: {
    isLoading: false,
    error: null,
    isEmpty: true,
    rows: 10,
    columns: 7,
    children: <Box>이 내용은 데이터가 없을 때 보이지 않습니다.</Box>,
  },
};

// 커스텀 행/열 수
export const CustomRowsColumns: Story = {
  args: {
    isLoading: true,
    error: null,
    isEmpty: false,
    rows: 5,
    columns: 4,
    children: <Box>이 내용은 로딩 중에는 보이지 않습니다.</Box>,
  },
};

// UserTable 시뮬레이션
export const UserTableSimulation: Story = {
  args: {
    isLoading: true,
    error: null,
    isEmpty: false,
    rows: 20,
    columns: 7,
    children: (
      <Box
        width="100%"
        minHeight="500px"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
      >
        <Table.Root variant="outline" size="lg">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader width="30px">체크</Table.ColumnHeader>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>지점</Table.ColumnHeader>
              <Table.ColumnHeader>이름</Table.ColumnHeader>
              <Table.ColumnHeader>생년월일</Table.ColumnHeader>
              <Table.ColumnHeader>휴대폰 번호</Table.ColumnHeader>
              <Table.ColumnHeader width="100px">비고</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>☑</Table.Cell>
              <Table.Cell>1</Table.Cell>
              <Table.Cell>강남점</Table.Cell>
              <Table.Cell>김학생</Table.Cell>
              <Table.Cell>2010-01-01</Table.Cell>
              <Table.Cell>010-1234-5678</Table.Cell>
              <Table.Cell>
                <Text fontSize="sm" color="gray.600">
                  상세보기
                </Text>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>
    ),
  },
};

// TeacherTable 시뮬레이션
export const TeacherTableSimulation: Story = {
  args: {
    isLoading: true,
    error: null,
    isEmpty: false,
    rows: 15,
    columns: 9,
    children: (
      <Box
        width="100%"
        minHeight="500px"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
      >
        <Table.Root variant="outline" size="lg">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>이름</Table.ColumnHeader>
              <Table.ColumnHeader>지점</Table.ColumnHeader>
              <Table.ColumnHeader>전공</Table.ColumnHeader>
              <Table.ColumnHeader>생년월일</Table.ColumnHeader>
              <Table.ColumnHeader>휴대폰 번호</Table.ColumnHeader>
              <Table.ColumnHeader>재등록률</Table.ColumnHeader>
              <Table.ColumnHeader>레슨 완료율</Table.ColumnHeader>
              <Table.ColumnHeader width="100px">비고</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>1</Table.Cell>
              <Table.Cell>김선생</Table.Cell>
              <Table.Cell>강남점</Table.Cell>
              <Table.Cell>피아노</Table.Cell>
              <Table.Cell>1990-01-01</Table.Cell>
              <Table.Cell>010-1234-5678</Table.Cell>
              <Table.Cell>85% (17/20)</Table.Cell>
              <Table.Cell>92% (23/25)</Table.Cell>
              <Table.Cell>
                <Text fontSize="sm" color="gray.600">
                  상세보기
                </Text>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>
    ),
  },
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
          data: [
            { id: 1, name: "김학생", location: "강남점" },
            { id: 2, name: "이학생", location: "서초점" },
            { id: 3, name: "박학생", location: "강남점" },
          ],
        });
      }, 3000);

      return () => clearTimeout(timer);
    }, []);

    return (
      <SkeletonFetchBoundary
        isLoading={state.isLoading}
        error={state.error}
        isEmpty={!state.data || state.data.length === 0}
        rows={20}
        columns={7}
      >
        <Box
          width="100%"
          minHeight="500px"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
        >
          <Table.Root variant="outline" size="lg">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID</Table.ColumnHeader>
                <Table.ColumnHeader>이름</Table.ColumnHeader>
                <Table.ColumnHeader>지점</Table.ColumnHeader>
                <Table.ColumnHeader>생년월일</Table.ColumnHeader>
                <Table.ColumnHeader>휴대폰 번호</Table.ColumnHeader>
                <Table.ColumnHeader>상태</Table.ColumnHeader>
                <Table.ColumnHeader>비고</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {state.data?.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.id}</Table.Cell>
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>{item.location}</Table.Cell>
                  <Table.Cell>2010-01-01</Table.Cell>
                  <Table.Cell>010-1234-5678</Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" color="green.600">
                      활성
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm" color="gray.600">
                      상세보기
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </SkeletonFetchBoundary>
    );
  },
};
