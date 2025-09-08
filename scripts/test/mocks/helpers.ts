import { mockUsers, mockTeachers, mockPayments, mockLessons } from "./index";

/**
 * 특정 ID의 사용자 데이터를 반환합니다.
 */
export const getUserById = (id: number) => {
  return mockUsers.find((user) => user.id === id);
};

/**
 * 특정 로그인 ID의 사용자 데이터를 반환합니다.
 */
export const getUserByLoginId = (loginId: string) => {
  return mockUsers.find((user) => user.loginId === loginId);
};

/**
 * 특정 ID의 선생님 데이터를 반환합니다.
 */
export const getTeacherById = (id: number) => {
  return mockTeachers.find((teacher) => teacher.id === id);
};

/**
 * 특정 로그인 ID의 선생님 데이터를 반환합니다.
 */
export const getTeacherByLoginId = (loginId: string) => {
  return mockTeachers.find((teacher) => teacher.loginId === loginId);
};

/**
 * 특정 사용자의 결제 데이터를 반환합니다.
 */
export const getPaymentByUserId = (userId: number) => {
  return mockPayments.find((payment) => payment.userId === userId);
};

/**
 * 특정 사용자의 레슨 데이터를 반환합니다.
 */
export const getLessonsByUserId = (userId: number) => {
  return mockLessons.filter((lesson) => lesson.userId === userId);
};

/**
 * 특정 선생님의 레슨 데이터를 반환합니다.
 */
export const getLessonsByTeacherId = (teacherId: number) => {
  return mockLessons.filter((lesson) => lesson.teacherId === teacherId);
};
