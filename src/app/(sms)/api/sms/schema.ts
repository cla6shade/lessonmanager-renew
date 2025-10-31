import { DataResponseSchema } from '@/app/schema';
import z from 'zod';
import { UserSearchRequestSchema } from '@/app/(users)/api/users/schema';

export const SMSReceiverTypeSchema = z.enum([
  'ONE_DAY_BEFORE_LESSON',
  'ONE_WEEK_BEFORE_REREGISTER',
  'BIRTHDAY',
  'ACTIVE',
  'BIRTHDAY',
  'STARTDATE_NON_SET',
  'MORE_THAN_6_MONTHS',
  'ALL',
]);

export type SMSReceiverType = z.infer<typeof SMSReceiverTypeSchema>;

export const SMSTargetSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  contact: z.string(),
});
export type SMSTarget = z.infer<typeof SMSTargetSchema>;

export const GetSMSTargetRequestSchema = z
  .object({
    receiverType: SMSReceiverTypeSchema,
    selectedLocationId: z.number(),
    isTotalSelected: z.transform((v) => v === 'true').pipe(z.boolean()),
  })
  .extend(
    UserSearchRequestSchema.pick({
      birthDate: true,
      name: true,
      contact: true,
    }).shape,
  );
export type GetSMSTargetRequest = z.infer<typeof GetSMSTargetRequestSchema>;

export const GetSMSTargetResponseSchema = DataResponseSchema(SMSTargetSchema.array());
export type GetSMSTargetResponse = z.infer<typeof GetSMSTargetResponseSchema>;

export const SendSMSRequestSchema = z.object({
  receiverType: SMSReceiverTypeSchema,
  message: z.string(),
  targetInfos: SMSTargetSchema.array(),
  selectedLocationId: z.number(),
});

export type SendSMSRequest = z.infer<typeof SendSMSRequestSchema>;
