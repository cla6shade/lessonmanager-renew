import brand from '@/brand/baseInfo';
import { getSMSLengthType, phoneNumberToSplitted } from './utils';
import { SendSMSRequest } from './schema';
import { searchUsers } from '@/app/(users)/service';
import { UserSearchFilter } from '@/app/(users)/api/users/schema';

type SourcePhoneNumber = {
  sphone1: string;
  sphone2: string;
  sphone3: string;
};

export async function getTargetUsers({
  receiverType,
  isTotalSelected,
  selectedLocationId,
}: Pick<SendSMSRequest, 'receiverType' | 'targets' | 'isTotalSelected' | 'selectedLocationId'>) {
  if (isTotalSelected) {
    return (
      await searchUsers({
        filter: receiverType as UserSearchFilter,
        lookup: true,
        locationId: selectedLocationId,
      })
    )[0];
  }
  return searchUsers({
    filter: receiverType,
  });
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
  });
}
