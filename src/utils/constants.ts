export enum LessonModifyType {
  CANCEL_LESSON = 0,
  CREATE_LESSON = 1,
  UPDATE_LESSON = 2,
}
export enum LessonModifierType {
  USER = 0,
  TEACHER = 1,
}

export function getModifyTypeText(type: LessonModifyType) {
  return ['취소', '예약'][type];
}
export function getModifierTypeText(type: LessonModifierType) {
  return ['회원', '선생님'][type];
}
