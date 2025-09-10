export const adminMenus = [
  {
    name: "레슨 시간표",
    href: "/",
  },
  {
    name: "수강생 관리",
    href: "/teacher/student-management",
  },
  {
    name: "선생님 관리",
    href: "/teacher/teacher-management",
  },
  {
    name: "결제 정보 추가",
    href: "/teacher/payment-management",
  },
];

export const userMenus = [
  {
    name: "레슨 시간표",
    href: "/",
  },
  {
    name: "내 정보",
    href: "/user/my-info",
  },
  {
    name: "레슨 내역",
    href: "/user/lesson-history",
  },
  {
    name: "결제 내역",
    href: "/user/payment-history",
  },
];

export const DEFAULT_ADMIN_MENU = adminMenus[0];
export const DEFAULT_USER_MENU = userMenus[0];
