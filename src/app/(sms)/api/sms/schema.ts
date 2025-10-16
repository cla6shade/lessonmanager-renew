import z from "zod";

export const SMSReceiverTypeSchema = z.enum([
  "ONE_DAY_BEFORE_LESSON",
  "ONE_WEEK_BEFORE_REREGISTER",
  "BIRTHDAY",
  "DEFAULT",
]);

export type SMSReceiverType = z.infer<typeof SMSReceiverTypeSchema>;

export const SendSMSRequestSchema = z.object({
  receiverType: SMSReceiverTypeSchema,
  message: z.string(),
  targets: z.number().positive().array(),
  excludes: z.number().positive().array(),
  selectAll: z.boolean(),
});

export type SendSMSRequest = z.infer<typeof SendSMSRequestSchema>;
