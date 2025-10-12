import {
  Text,
  Dialog,
  Portal,
  Button,
  Table,
  Badge,
  Box,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { GetWorkingTimesResponse } from "@/app/(table)/api/working-times/schema";

interface TeacherTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export default function TeacherTableDialog({
  isOpen,
  onClose,
}: TeacherTableDialogProps) {
  const [workingTimes, setWorkingTimes] = useState<
    GetWorkingTimesResponse["data"]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkingTimes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/working-times");
      if (!response.ok) {
        throw new Error("근무시간 데이터를 가져오는데 실패했습니다.");
      }
      const result: GetWorkingTimesResponse = await response.json();
      setWorkingTimes(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkingTimes();
    }
  }, [isOpen]);

  const formatWorkingHours = (hours: number[]) => {
    if (hours.length === 0) return "-";
    return hours.map((hour) => `${hour}:00`).join(", ");
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW={{ base: "full", md: "4xl" }}
            mx={{ base: 4, md: "auto" }}
          >
            <Dialog.Header>
              <Text fontSize="lg" fontWeight="bold">
                선생님 근무시간 관리
              </Text>

              <Dialog.CloseTrigger asChild>
                <Button size="sm" variant="ghost" aria-label="닫기">
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              {loading && (
                <Box textAlign="center" py={4}>
                  <Text>데이터를 불러오는 중...</Text>
                </Box>
              )}

              {error && (
                <Box textAlign="center" py={4}>
                  <Badge colorScheme="red">{error}</Badge>
                </Box>
              )}

              {!loading && !error && workingTimes.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Text>등록된 근무시간 데이터가 없습니다.</Text>
                </Box>
              )}

              {!loading && !error && workingTimes.length > 0 && (
                <Box overflowX="auto">
                  <Table.Root variant="outline" size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>선생님 ID</Table.ColumnHeader>
                        {DAYS.map((day) => (
                          <Table.ColumnHeader key={day} textAlign="center">
                            {day}요일
                          </Table.ColumnHeader>
                        ))}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {workingTimes.map((workingTime) => (
                        <Table.Row key={workingTime.teacherId}>
                          <Table.Cell fontWeight="medium">
                            {workingTime.teacherId}
                          </Table.Cell>
                          {DAY_KEYS.map((dayKey) => (
                            <Table.Cell
                              key={dayKey}
                              textAlign="center"
                              fontSize="sm"
                            >
                              {formatWorkingHours(workingTime.times[dayKey])}
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
