"use client";

import React from "react";
import {
  Dialog,
  Button,
  Box,
  Text,
  Flex,
  Portal,
  Checkbox,
  CheckboxCard,
} from "@chakra-ui/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  formatDate,
  getTimesInPeriod,
  getWorkingDayOfWeek,
} from "@/utils/date";
import { useTable } from "../../grid/providers/TableProvider";
import { useLesson } from "../../grid/providers/LessonProvider";
import { getWorkingTeachersOnDate } from "../../grid/utils";
import { useNavigation } from "../../../navigation/location/NavigationContext";
import BannedTimeCell from "./BannedTimeCell";
import TimeHeaderCell from "./TimeHeaderCell";
import TeacherHeaderCell from "./TeacherHeaderCell";
import TimeCell from "./TimeCell";
import BannedTimeLegend from "./BannedTimeLegend";

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

  const allTimes = getTimesInPeriod(openHours);
  const dayOfWeek = getWorkingDayOfWeek(selectedDate);
  const workingTeachers = getWorkingTeachersOnDate(
    selectedLocation,
    teachers,
    dayOfWeek
  );

  // 초기 banned times 데이터 생성
  const getInitialBannedTimes = () => {
    const existingBannedTimes = bannedTimes.filter(
      (bt) =>
        new Date(bt.date).toDateString() === selectedDate.toDateString() &&
        workingTeachers.some((teacher) => teacher.id === bt.teacherId)
    );

    return existingBannedTimes.map((bt) => ({
      id: bt.id,
      teacherId: bt.teacherId,
      date: selectedDate,
      hour: bt.hour,
    }));
  };

  // React Hook Form 설정 (기존 데이터로 초기화)
  const { control, handleSubmit } = useForm({
    defaultValues: {
      bannedTimes: getInitialBannedTimes(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bannedTimes",
  });

  // checkbox 클릭 핸들러 - 단순하게 toggle
  const handleCellClick = (teacherId: number, hour: number) => {
    const existingIndex = fields.findIndex(
      (field) => field.teacherId === teacherId && field.hour === hour
    );

    if (existingIndex >= 0) {
      remove(existingIndex);
    } else {
      append({
        teacherId,
        date: selectedDate,
        hour,
      });
    }
  };

  // 특정 셀이 banned인지 확인 - 폼에 있는 것들만
  const isCellBanned = (teacherId: number, hour: number) => {
    return fields.some(
      (field) => field.teacherId === teacherId && field.hour === hour
    );
  };

  const onSubmit = async (data: { bannedTimes: any[] }) => {
    try {
      const initialBannedTimes = getInitialBannedTimes();

      // 기존 데이터 모두 삭제
      const deleteIds = initialBannedTimes.map((bt) => bt.id);

      const response = await fetch("/api/bans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deleteIds,
          bannedTimes: data.bannedTimes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update banned times");
      }

      await refetchBannedTimes();
      onClose();
    } catch (error) {
      console.error("Error saving banned times:", error);
    }
  };

  return (
    <Portal>
      <Dialog.Root open={isOpen} onOpenChange={(e) => e.open || onClose()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="600px">
            <Dialog.Header>
              <Dialog.Title>수업 금지 시간 편집</Dialog.Title>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {formatDate(selectedDate)} - {selectedLocation.name}
              </Text>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              {workingTeachers.length === 0 ? (
                <Text>해당 날짜에 근무하는 선생님이 없습니다.</Text>
              ) : (
                <Box>
                  <BannedTimeLegend />

                  <Box as="table" width="100%" borderCollapse="collapse">
                    <Box as="thead">
                      <Box as="tr">
                        <TimeHeaderCell>시간</TimeHeaderCell>
                        {workingTeachers.map((teacher) => (
                          <TeacherHeaderCell key={`header-${teacher.id}`}>
                            {teacher.name}
                          </TeacherHeaderCell>
                        ))}
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {allTimes.map((hour) => (
                        <Box as="tr" key={`row-${hour}`}>
                          <TimeCell>{hour}:00</TimeCell>
                          {workingTeachers.map((teacher) => (
                            <BannedTimeCell
                              key={`${teacher.id}-${hour}`}
                              teacher={teacher}
                              hour={hour}
                              dayOfWeek={dayOfWeek}
                              selectedDate={selectedDate}
                              bannedTimes={bannedTimes}
                              onClick={() => handleCellClick(teacher.id, hour)}
                            >
                              <Checkbox.Root
                                checked={isCellBanned(teacher.id, hour)}
                                onCheckedChange={() =>
                                  handleCellClick(teacher.id, hour)
                                }
                                size="sm"
                              >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                              </Checkbox.Root>
                            </BannedTimeCell>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleSubmit(onSubmit)}>저장</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Portal>
  );
}
