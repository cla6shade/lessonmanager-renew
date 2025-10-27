import { UserSearchResult } from '@/app/(users)/api/users/schema';
import brand from '@/brand/baseInfo';
import { SendSMSRequest, SMSReceiverType } from './schema';
import { getTomorowLesson } from '@/app/(lessons)/service';
import { formatDate, getBirthdayCouponDeadline, getCurrentDatePeriod } from '@/utils/date';

export type SMSReplaceTarget = {
  TIME?: string;
  STARTDATE?: string;
  NAME?: string;
  REREGISTER_START?: string;
  REREGISTER_END?: string;
  DEADLINE_MONTH?: string;
  DEADLINE_DAY?: string;
};

const BRAND_NAME = brand.name;

export type UserFormatInfo = {
  [userId: string]: {
    user: UserSearchResult;
    replaceTargets: SMSReplaceTarget;
  };
};

export type FormatInfoBuilder = (
  userId: string,
  user: UserSearchResult,
) => Promise<SMSReplaceTarget | undefined>;

export const SMSFormats = {
  ONE_DAY_BEFORE_LESSON: `안녕하세요~
${BRAND_NAME}입니다. 

내일 레슨은 %TIME%시입니다.
당일 레슨 취소는 보강이 불가하니 예약시간 변경은 오늘 밤 9시까지 해주세요~^^`,
  ONE_WEEK_BEFORE_REREGISTER: `안녕하세요~ 
${BRAND_NAME}입니다. 

%STARTDATE% 부터 시작하신 %NAME%님의 재등록 기간은 %REREGISTER_START%부터 %REREGISTER_END%까지입니다. 

기간 내에 재등록 하실 경우 등록개월수*1만원이 추가할인된 가격으로 연장하실 수 있습니다. (연습실 제외)
    
궁금한 점이 있으시면 아래번호로 연락주세요! 

오늘 하루도 즐거운 일 가득하시기 바랍니다~!`,
  DEFAULT: '',
  BIRTHDAY: `%NAME%님, 생일 정말 축하드려요 🎉

${BRAND_NAME}에서 작지만 마음을 담아

3만원 혜택을 준비했습니다 🎁

등록 시 "생일 문자 받았어요"라고 말씀 해 주세요!

(기한: %DEADLINE_MONTH%월 %DEADLINE_DAY%일까지)`,
};

export async function getFormatInfo({
  targetUsers,
  receiverType,
}: {
  targetUsers: UserSearchResult[];
  receiverType: SMSReceiverType;
}): Promise<UserFormatInfo> {
  const formatInfoBuilders: Partial<Record<SMSReceiverType, FormatInfoBuilder>> = {
    ONE_DAY_BEFORE_LESSON: async (userId, user) => {
      const userIdNum = parseInt(userId, 10);
      const lesson = await getTomorowLesson(userIdNum);
      return {
        TIME: lesson!.dueHour.toString(),
      };
    },
    BIRTHDAY: async (userId, user) => {
      const deadline = getBirthdayCouponDeadline();
      return {
        NAME: user.name,
        DEADLINE_MONTH: (deadline.getMonth() + 1).toString(),
        DEADLINE_DAY: deadline.getDate().toString(),
      };
    },
    ONE_WEEK_BEFORE_REREGISTER: async (userId, user) => {
      const payment = user.payments[0];
      if (!payment || !payment.startDate || !payment.endDate) return undefined;
      const period = getCurrentDatePeriod(payment.endDate);
      return {
        NAME: user.name,
        REREGISTER_START: formatDate(period.startDate),
        REREGISTER_END: formatDate(period.endDate),
        STARTDATE: formatDate(payment.startDate),
      };
    },
  };

  const builder = formatInfoBuilders[receiverType];
  if (!builder) return {};

  const formatInfo: UserFormatInfo = {};

  await Promise.all(
    Object.entries(targetUsers).map(async ([userId, user]) => {
      const formatInfos = await builder(userId, user);
      if (formatInfos) {
        formatInfo[userId] = { user, replaceTargets: formatInfos };
      }
    }),
  );

  return formatInfo;
}

export function getMessageFormat({
  receiverType,
  message,
}: Pick<SendSMSRequest, 'receiverType' | 'message'>) {
  if (receiverType === 'ALL') return message;
  return SMSFormats[receiverType];
}
export function buildMessageMap({
  messageFormat,
  formatInfo,
}: {
  messageFormat: string;
  formatInfo: UserFormatInfo;
}): Record<string, string> {
  // phone => message
  const messageMap: Record<string, string> = {};
  Object.entries(formatInfo).forEach(([key, value]) => {
    const { replaceTargets, user } = value;
    let message = messageFormat;

    Object.entries(replaceTargets).forEach(([replaceTarget, replacer]) => {
      message = message.replaceAll(`%${replaceTarget}%`, replacer);
    });

    messageMap[user.contact!] = message;
  });
  return messageMap;
}
