import { GetBannedTimesResponse, UpdateBannedTimesRequest } from '@/app/(table)/api/bans/schema';
import { ExtendedTeacher } from '../../types';
import { getTimesInPeriod, getWorkingDayOfWeek } from '@/utils/date';
import { getTeacherWorkingHours } from '../../grid/utils';
import { OpenHours } from '@/generated/prisma';

export type CellType = 'banned' | 'available' | 'not-working-hour';

export type BannedTimeGrid = {
  [teacherId: number | string]: { [hour: number]: CellType };
};

export function getBannedTimeGrid(
  selectedDate: Date,
  openHours: OpenHours,
  bannedTimes: GetBannedTimesResponse['data'],
  workingTeachers: ExtendedTeacher[],
) {
  const grid: BannedTimeGrid = {};
  const times = getTimesInPeriod(openHours);
  workingTeachers.forEach((teacher) => {
    grid[teacher.id] = {};
    times.forEach((hour) => {
      const teacherWorkingHours = getTeacherWorkingHours(
        teacher,
        getWorkingDayOfWeek(selectedDate),
      );
      grid[teacher.id][hour] = teacherWorkingHours.includes(hour)
        ? 'available'
        : 'not-working-hour';
    });
  });
  bannedTimes.forEach((bannedTime) => {
    if (
      new Date(bannedTime.date).toDateString() === selectedDate.toDateString() &&
      grid[bannedTime.teacherId] &&
      grid[bannedTime.teacherId][bannedTime.hour]
    ) {
      grid[bannedTime.teacherId][bannedTime.hour] = 'banned';
    }
  });
  return grid;
}

export function getCellColor(cellType: CellType) {
  if (cellType === 'not-working-hour') {
    return 'gray.100';
  }
  if (cellType === 'banned') {
    return 'red.200';
  }
  return 'green.100';
}

export function getCellBorderColor(cellType: CellType) {
  if (cellType === 'not-working-hour') {
    return 'gray.300';
  }
  if (cellType === 'banned') {
    return 'red.400';
  }
  return 'green.300';
}

export function createUpdateBannedTimesRequest(
  defaultTimeGrid: BannedTimeGrid,
  timeGrid: BannedTimeGrid,
  selectedDate: Date,
  existingBannedTimes: GetBannedTimesResponse['data'],
): UpdateBannedTimesRequest {
  const deleteIds: number[] = [];
  const bannedTimes: UpdateBannedTimesRequest['bannedTimes'] = [];

  // 선택된 날짜의 기존 banned times만 필터링
  const selectedDateString = selectedDate.toDateString();
  const existingBannedTimesOnDate = existingBannedTimes.filter(
    (bannedTime) => new Date(bannedTime.date).toDateString() === selectedDateString,
  );

  // 모든 선생님과 시간에 대해 변화 감지
  Object.keys(timeGrid).forEach((teacherIdStr) => {
    const teacherId = Number(teacherIdStr);
    const teacherTimeGrid = timeGrid[teacherId];
    const defaultTeacherTimeGrid = defaultTimeGrid[teacherId];

    if (!teacherTimeGrid || !defaultTeacherTimeGrid) {
      return;
    }

    Object.keys(teacherTimeGrid).forEach((hourStr) => {
      const hour = Number(hourStr);
      const currentCellType = teacherTimeGrid[hour];
      const defaultCellType = defaultTeacherTimeGrid[hour];

      // 변화가 없으면 건너뛰기
      if (currentCellType === defaultCellType) {
        return;
      }

      // working hour가 아닌 셀은 처리하지 않음
      if (currentCellType === 'not-working-hour' || defaultCellType === 'not-working-hour') {
        return;
      }

      // banned -> available: 삭제해야 할 항목
      if (defaultCellType === 'banned' && currentCellType === 'available') {
        const existingBannedTime = existingBannedTimesOnDate.find(
          (bt) => bt.teacherId === teacherId && bt.hour === hour,
        );
        if (existingBannedTime?.id) {
          deleteIds.push(existingBannedTime.id);
        }
      }

      // available -> banned: 추가해야 할 항목
      if (defaultCellType === 'available' && currentCellType === 'banned') {
        bannedTimes.push({
          teacherId,
          date: selectedDate,
          hour,
        });
      }
    });
  });

  return {
    deleteIds,
    bannedTimes,
  };
}
