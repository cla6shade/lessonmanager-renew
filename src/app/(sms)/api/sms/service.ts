import brand from "@/brand/baseInfo";
import { getSMSLengthType, phoneNumberToSplitted } from "./utils";
import { SendSMSRequest } from "./schema";
import { SMSFormats } from "./formats";

type SourcePhoneNumber = {
  sphone1: string;
  sphone2: string;
  sphone3: string;
};

export async function sendMessage({
  receiverType,
  message,
  selectAll,
  targets,
  excludes,
}: SendSMSRequest) {
  message = getMessageFormat({ receiverType, message });
}

export function getTargets({
  receiverType,
  targets,
  excludes,
  selectAll,
}: Pick<
  SendSMSRequest,
  "receiverType" | "targets" | "excludes" | "selectAll"
>) {
  const targetSet = new Set(targets);
  const excludeSet = new Set(excludes);
}

export function getMessageFormat({
  receiverType,
  message,
}: Pick<SendSMSRequest, "receiverType" | "message">) {
  if (receiverType === "DEFAULT") return message;
  return SMSFormats[receiverType];
}

export function requestMessageSend(
  source: SourcePhoneNumber | string,
  receiver: string,
  message: string,
  title = `${brand.name}입니다`
) {
  if (typeof source === "string") {
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
    rdate: "",
    rtime: "",
    mode: "1",
    testflag: "Y",
    destination: "",
    repeatFlag: "",
    repeatNum: "",
    repeatTime: "",
    returnurl: "",
    nointeractive: "",
    smsType: getSMSLengthType(message),
    ...(getSMSLengthType(message) === "L" ? { title } : {}),
  };
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, Buffer.from(value).toString("base64"));
  });
  return fetch(SMS_URL!, {
    body: formData,
  });
}
