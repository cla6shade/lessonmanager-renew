import brand from '@/brand/baseInfo';
import { getSMSLengthType, phoneNumberToSplitted } from './utils';
import { SendSMSRequest } from './schema';
import { searchUsers } from '@/app/(users)/service';
import { UserSearchFilter } from '@/app/(users)/api/users/schema';
import { getFormatInfo, getMessageFormat, buildMessageMap } from './formatter';
import prisma from '@/lib/prisma';

type SourcePhoneNumber = {
  sphone1: string;
  sphone2: string;
  sphone3: string;
};

export async function getTargetUsers({
  receiverType,
  isTotalSelected,
  selectedLocationId,
  contact,
  birthDate,
  name,
}: {
  receiverType: SendSMSRequest['receiverType'];
  isTotalSelected: boolean;
  selectedLocationId: number;
  contact?: string;
  birthDate?: Date;
  name?: string;
}) {
  if (isTotalSelected) {
    return (
      await searchUsers({
        filter: receiverType as UserSearchFilter,
        locationId: selectedLocationId,
        contact,
        birthDate,
        name,
      })
    )[0];
  }
  return searchUsers({
    filter: receiverType,
  });
}

export async function sendMessage({
  receiverType,
  message,
  targetInfos,
  selectedLocationId,
}: SendSMSRequest) {
  const location = await prisma.location.findUniqueOrThrow({
    where: { id: selectedLocationId },
    select: { phone: true },
  });

  const sourcePhone = location.phone;

  // receiverType이 'ALL'인 경우 message를 그대로 사용
  // 아닌 경우 포맷에 따라 메시지 생성
  if (receiverType === 'ALL') {
    // ALL인 경우: targets의 연락처로 동일한 메시지 전송
    const messageMap: Record<string, string> = {};
    targetInfos.forEach((target) => {
      if (target.contact) {
        messageMap[target.contact] = message;
      }
    });
    return sendAll(sourcePhone, messageMap);
  }

  const formatInfo = await getFormatInfo({
    targetInfos: targetInfos,
    receiverType,
  });

  const messageFormat = getMessageFormat({ receiverType, message });
  const messageMap = buildMessageMap({ messageFormat, formatInfo });

  return sendAll(sourcePhone, messageMap);
}

export function sendAll(source: SourcePhoneNumber | string, messageMap: Record<string, string>) {
  return Promise.all(
    Object.entries(messageMap).map(([contact, message]) =>
      requestMessageSend(source, contact, message),
    ),
  );
}

export function requestMessageSend(
  source: SourcePhoneNumber | string,
  receiver: string,
  message: string,
  title = `${brand.name}입니다`,
) {
  if (typeof source === 'string') {
    source = phoneNumberToSplitted(source);
  }
  const { SMS_SECRET, SMS_USER_ID, SMS_URL } = process.env;
  const data = {
    user_id: SMS_USER_ID!,
    secure: SMS_SECRET!,
    msg: message,
    rphone: receiver,
    sphone1: source.sphone1,
    sphone2: source.sphone2,
    sphone3: source.sphone3,
    rdate: '',
    rtime: '',
    mode: '1',
    testflag: process.env.NODE_ENV === 'production' ? '' : 'Y',
    destination: '',
    repeatFlag: '',
    repeatNum: '',
    repeatTime: '',
    returnurl: '',
    nointeractive: '',
    smsType: getSMSLengthType(message),
    ...(getSMSLengthType(message) === 'L' ? { title } : {}),
  };
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, Buffer.from(value).toString('base64'));
  });
  return fetch(SMS_URL!, {
    body: formData,
    method: 'POST',
  });
}
