"use client";

import React, { useEffect, useState } from "react";
import { Dialog, Button, Box, Text, Portal } from "@chakra-ui/react";
import { formatDate, getWorkingDayOfWeek } from "@/utils/date";
import { useTable } from "../../grid/providers/TableProvider";
import { useLesson } from "../../grid/providers/LessonProvider";
import { getWorkingTeachersOnDate } from "../../grid/utils";
import { useNavigation } from "../../../navigation/location/NavigationContext";
import BannedTimeLegend from "./BannedTimeLegend";
import BannedTimeGrid from "./BannedTimeGrid";
import {
  CellType,
  BannedTimeGrid as BannedTimeGridType,
  getBannedTimeGrid,
  createUpdateBannedTimesRequest,
} from "./utils";
import { useUpdateBannedTimes } from "./useUpdateBannedTimes";

interface BannedTimeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export default function BannedTimeEditDialog({
  isOpen,
  onClose,
  selectedDate,
}: BannedTimeEditDialogProps) {
  const { openHours, teachers } = useTable();
  const { selectedLocation } = useNavigation();
  const { bannedTimes, refetchBannedTimes } = useLesson();
  const { updateBannedTimes, isSaving, error } = useUpdateBannedTimes();

  const dayOfWeek = getWorkingDayOfWeek(selectedDate);
  const workingTeachers = getWorkingTeachersOnDate(
    selectedLocation,
    teachers,
    dayOfWeek
  );

  const [defaultTimeGrid, setDefaultTimeGrid] = useState<BannedTimeGridType>(
    {}
  );
  const [timeGrid, setTimeGrid] = useState<BannedTimeGridType>({});

  useEffect(() => {
    setTimeGrid(
      getBannedTimeGrid(selectedDate, openHours, bannedTimes, workingTeachers)
    );
    setDefaultTimeGrid(
      getBannedTimeGrid(selectedDate, openHours, bannedTimes, workingTeachers)
    );
  }, [selectedDate]);

  const handleSubmit = async () => {
    const updateRequest = createUpdateBannedTimesRequest(
      defaultTimeGrid,
      timeGrid,
      selectedDate,
      bannedTimes
    );

    if (
      updateRequest.deleteIds.length === 0 &&
      updateRequest.bannedTimes.length === 0
    ) {
      onClose();
      return;
    }

    const result = await updateBannedTimes(updateRequest);

    if (result.success) {
      await refetchBannedTimes();
      onClose();
    }
  };
  return (
    <Portal>
      <Dialog.Root open={isOpen} onOpenChange={(e) => e.open || onClose()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="600px">
            <Dialog.Header>
              <Dialog.Title>예약 불가능 시간 편집</Dialog.Title>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {formatDate(selectedDate)} - {selectedLocation.name}
              </Text>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              {error && (
                <Box
                  mb={4}
                  p={3}
                  bg="red.50"
                  borderColor="red.200"
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Text color="red.600" fontSize="sm">
                    {error}
                  </Text>
                </Box>
              )}
              {!openHours ? (
                <Text>로드 중</Text>
              ) : workingTeachers.length === 0 ? (
                <Text>해당 날짜에 근무하는 선생님이 없습니다.</Text>
              ) : (
                <Box>
                  <BannedTimeLegend />
                  <BannedTimeGrid
                    timeGrid={timeGrid}
                    workingTeachers={workingTeachers}
                    onCellClick={(teacherId, hour) => {
                      setTimeGrid((prev) => ({
                        ...prev,
                        [teacherId]: {
                          ...prev[teacherId],
                          [hour]:
                            prev[teacherId]?.[hour] === "banned"
                              ? "available"
                              : "banned",
                        },
                      }));
                    }}
                  />
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                취소
              </Button>
              <Button onClick={handleSubmit} loading={isSaving}>
                저장
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Portal>
  );
}
