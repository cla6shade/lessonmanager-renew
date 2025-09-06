export interface DatePeriod {
  startDate: Date;
  endDate: Date;
}

export function getMondayOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

export function getSundayOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(date.setDate(diff));
}

export function getCurrentDatePeriod(date: Date): DatePeriod {
  return {
    startDate: getMondayOfWeek(date),
    endDate: getSundayOfWeek(date),
  };
}

export function getNextDatePeriod(period: DatePeriod): DatePeriod {
  return {
    startDate: new Date(
      period.startDate.setDate(period.startDate.getDate() + 7)
    ),
    endDate: new Date(period.endDate.setDate(period.endDate.getDate() + 7)),
  };
}

export function getPreviousDatePeriod(period: DatePeriod): DatePeriod {
  return {
    startDate: new Date(
      period.startDate.setDate(period.startDate.getDate() - 7)
    ),
    endDate: new Date(period.endDate.setDate(period.endDate.getDate() - 7)),
  };
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekLabel(startDate: Date): string {
  const today = new Date();
  const start = new Date(startDate);

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks === 0) {
    return "이번 주";
  } else if (diffWeeks === 1) {
    return "지난 주";
  } else if (diffWeeks === -1) {
    return "다음 주";
  } else if (diffWeeks > 1) {
    return `${diffWeeks}주 전`;
  } else {
    return `${Math.abs(diffWeeks)}주 후`;
  }
}
