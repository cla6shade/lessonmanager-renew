import { SendSMSRequest, SMSReceiverType, SMSTarget } from './schema';
import { getTomorowLesson } from '@/app/(lessons)/service';
import { formatDate, getBirthdayCouponDeadline, getCurrentDatePeriod } from '@/utils/date';
import { getLatestUserPayment } from '@/app/(payments)/service';
import { hasMessageFormat, SMSFormats } from '@/app/(sms)/api/sms/formats';

export type SMSReplaceTarget = {
  TIME?: string;
  STARTDATE?: string;
  NAME?: string;
  REREGISTER_START?: string;
  REREGISTER_END?: string;
  DEADLINE_MONTH?: string;
  DEADLINE_DAY?: string;
};

export type UserFormatInfo = {
  [userId: string]: {
    user: SMSTarget;
    replaceTargets: SMSReplaceTarget;
  };
};

export type FormatInfoBuilder = (
  userId: string,
  user: SMSTarget,
) => Promise<SMSReplaceTarget | undefined>;

export async function getFormatInfo({
  targetInfos,
  receiverType,
}: {
  targetInfos: SMSTarget[];
  receiverType: SMSReceiverType;
}): Promise<UserFormatInfo> {
  const formatInfoBuilders: Partial<Record<SMSReceiverType, FormatInfoBuilder>> = {
    ONE_DAY_BEFORE_LESSON: async (userId, user) => {
      const lesson = await getTomorowLesson(user.id!);
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
      const payment = await getLatestUserPayment(user.id!);
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
    Object.entries(targetInfos).map(async ([userId, user]) => {
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
  if (!hasMessageFormat(receiverType)) return message;
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
