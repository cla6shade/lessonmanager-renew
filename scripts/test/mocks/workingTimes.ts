export const mockWorkingTimes = [
  {
    teacherId: 1,
    times: JSON.stringify({
      mon: [10, 11, 12],
      tue: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      wed: [],
      thu: [9, 10, 11, 12, 13],
      fri: [14, 15, 16, 17],
      sat: [],
      sun: [],
    }),
  },
  {
    teacherId: 2,
    times: JSON.stringify({
      mon: [9, 10, 11, 12],
      tue: [14, 15, 16, 17, 18, 19],
      wed: [10, 11],
      thu: [],
      fri: [13, 14, 15],
      sat: [9, 10, 11],
      sun: [],
    }),
  },
];
