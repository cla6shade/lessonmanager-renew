import { DataResponseSchema } from '@/app/schema';
import z from 'zod';

export const SMSReceiverTypeSchema = z.enum([
  'ONE_DAY_BEFORE_LESSON',
  'ONE_WEEK_BEFORE_REREGISTER',
  'BIRTHDAY',
  'ALL',
]);

export type SMSReceiverType = z.infer<typeof SMSReceiverTypeSchema>;

export const SMSTargetSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  contact: z.string(),
});
export type SMSTarget = z.infer<typeof SMSTargetSchema>;

export const GetSMSTargetRequestSchema = z.object({
  receiverType: SMSReceiverTypeSchema,
  selectedLocationId: z.number().positive(),
  isTotalSelected: z.transform((v) => v === 'true').pipe(z.boolean()),
});
export type GetSMSTargetRequest = z.infer<typeof GetSMSTargetRequestSchema>;

export const GetSMSTargetResponseSchema = DataResponseSchema(SMSTargetSchema.array());
export type GetSMSTargetResponse = z.infer<typeof GetSMSTargetResponseSchema>;

export const SendSMSRequestSchema = z.object({
  receiverType: SMSReceiverTypeSchema,
  message: z.string(),
  targetInfos: SMSTargetSchema.array(),
  selectedLocationId: z.number().positive(),
});

export type SendSMSRequest = z.infer<typeof SendSMSRequestSchema>;
