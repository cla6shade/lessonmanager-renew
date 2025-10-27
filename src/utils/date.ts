export interface DatePeriod {
  startDate: Date;
  endDate: Date;
}

export function setDateToStartOfDay(date: Date): Date {
  return new Date(date.setHours(0, 0, 0, 0));
}

export function setDateToEndOfDay(date: Date): Date {
  return new Date(date.setHours(23, 59, 59, 999));
}

export function getMondayOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return setDateToStartOfDay(new Date(date.setDate(diff)));
}

export function getSundayOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? 0 : 7);
  return setDateToEndOfDay(new Date(date.setDate(diff)));
}

export function getCurrentDatePeriod(date: Date): DatePeriod {
  return {
    startDate: getMondayOfWeek(date),
    endDate: getSundayOfWeek(date),
  };
}

export function getNextDatePeriod(period: DatePeriod): DatePeriod {
  return {
    startDate: new Date(period.startDate.setDate(period.startDate.getDate() + 7)),
    endDate: new Date(period.endDate.setDate(period.endDate.getDate() + 7)),
  };
}

export function getPreviousDatePeriod(period: DatePeriod): DatePeriod {
  return {
    startDate: new Date(period.startDate.setDate(period.startDate.getDate() - 7)),
    endDate: new Date(period.endDate.setDate(period.endDate.getDate() - 7)),
  };
}

export function formatHour(hour: number | null) {
  if (!hour) return '(없음)';
  return `${hour}시`;
}

export function formatDate(
  date: Date,
  showYear: boolean = true,
  showDayOfWeek: boolean = false,
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const dayOfWeekNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = dayOfWeekNames[date.getDay()];

  let formattedDate = '';

  if (showYear) {
    formattedDate += `${year}-`;
  }

  formattedDate += `${month}-${day}`;

  if (showDayOfWeek) {
    formattedDate += ` (${dayOfWeek})`;
  }

  return formattedDate;
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
    return '이번 주';
  } else if (diffWeeks === 1) {
    return '지난 주';
  } else if (diffWeeks === -1) {
    return '다음 주';
  } else if (diffWeeks > 1) {
    return `${diffWeeks}주 전`;
  } else {
    return `${Math.abs(diffWeeks)}주 후`;
  }
}

export function getTimesInPeriod(period: {
  startHour: number;
  endHour: number; // endHour은 레슨 가능한 맨 마지막 시간
}): number[] {
  const times = [];
  for (let hour = period.startHour; hour <= period.endHour; hour++) {
    times.push(hour);
  }
  return times;
}

export function getDatesInPeriod(period: DatePeriod): Date[] {
  const dates = [];
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }
  return dates;
}

export function getWorkingDayOfWeek(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
}

export function isSameDate(date1: Date, date2: Date) {
  return date1.toDateString() === date2.toDateString();
}

export function isDateInPeriod(date: Date, period: DatePeriod) {
  return date.getTime() >= period.startDate.getTime() && date.getTime() <= period.endDate.getTime();
}

export function toKstDate(val: string | Date): Date {
  const d = new Date(val);
  d.setHours(d.getHours() + 9);
  return d;
}

export function buildDate(
  year: string | number,
  month: string | number,
  day: string | number,
): Date {
  return new Date(
    parseInt(year.toString()),
    parseInt(month.toString()) - 1,
    parseInt(day.toString()),
  );
}

export function getYesterdayEnd() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(23, 59, 59, 0);
  return d;
}

export function getTomorrowStart() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getOneWeekAfterStart() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getBirthdayCouponDeadline() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  d.setHours(0, 0, 0, 0);
  return d;
}
