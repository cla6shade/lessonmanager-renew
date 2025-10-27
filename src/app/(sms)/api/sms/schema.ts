import { DataResponseSchema } from '@/app/schema';
import z from 'zod';

export const SMSReceiverTypeSchema = z.enum([
  'ONE_DAY_BEFORE_LESSON',
  'ONE_WEEK_BEFORE_REREGISTER',
  'BIRTHDAY',
  'ALL',
]);

export type SMSReceiverType = z.infer<typeof SMSReceiverTypeSchema>;

export const SMSTarget = z.object({
  name: z.string().optional(),
  contact: z.string(),
  id: z.number().optional(),
});

export const GetSMSTargetRequestSchema = z.object({
  receiverType: SMSReceiverTypeSchema,
  selectedLocationId: z.number().positive(),
});
export type GetSMSTargetRequest = z.infer<typeof GetSMSTargetRequestSchema>;

export const GetSMSTargetResponseSchema = DataResponseSchema(SMSTarget.array());
export type GetSMSTargetResponse = z.infer<typeof GetSMSTargetResponseSchema>;

export const SendSMSRequestSchema = z.object({
  receiverType: SMSReceiverTypeSchema,
  message: z.string(),
  targets: SMSTarget.array(),
  isTotalSelected: z.boolean(),
  selectedLocationId: z.number().positive(),
});

export type SendSMSRequest = z.infer<typeof SendSMSRequestSchema>;
