import brand from "@/brand/baseInfo";

const BRAND_NAME = brand.name;

export const SMSFormats = {
  ONE_DAY_BEFORE_LESSON: `안녕하세요~
${BRAND_NAME}입니다. 

내일 레슨은 %TIME%입니다.
당일 레슨 취소는 보강이 불가하니 예약시간 변경은 오늘 밤 9시까지 해주세요~^^`,
  ONE_WEEK_BEFORE_REREGISTER: `안녕하세요~ 
${BRAND_NAME}입니다. 

%STARTDATE% 부터 시작하신 %NAME%님의 재등록 기간은 %REREGISTER_START%부터 %REREGISTER_END%까지입니다. 

기간 내에 재등록 하실 경우 등록개월수*1만원이 추가할인된 가격으로 연장하실 수 있습니다. (연습실 제외)
    
궁금한 점이 있으시면 아래번호로 연락주세요! 

오늘 하루도 즐거운 일 가득하시기 바랍니다~!`,
  DEFAULT: "",
  BIRTHDAY: `%NAME%님, 생일 정말 축하드려요 🎉

${BRAND_NAME}에서 작지만 마음을 담아

3만원 혜택을 준비했습니다 🎁

등록 시 "생일 문자 받았어요"라고 말씀 해 주세요!

(기한: %DEADLINE_MONTH%월 %DEADLINE_DAY%일까지)`,
};
