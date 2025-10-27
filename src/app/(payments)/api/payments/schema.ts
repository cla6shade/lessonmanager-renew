import { z } from 'zod';
import { DataResponseSchema } from '@/app/schema';
import { PaymentSchema } from '@/generated/zod';
import { toKstDate } from '@/utils/date';

export const UpdatePaymentRequestSchema = z.object({
  id: z.coerce.number().int().positive(),
  refunded: z.boolean().optional(),
  refundedAmount: z.coerce.number().int().min(0).optional(),
  memo: z.string().optional(),
  startDate: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
  endDate: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
  isStartDateNonSet: z.boolean().optional(),
});

export const UpdatePaymentsRequestSchema = z.object({
  payments: z.array(UpdatePaymentRequestSchema),
});

export const UpdatePaymentResponseSchema = DataResponseSchema(PaymentSchema);
export const UpdatePaymentsResponseSchema = DataResponseSchema(z.array(PaymentSchema));

export type UpdatePaymentRequest = z.infer<typeof UpdatePaymentRequestSchema>;
export type UpdatePaymentsRequest = z.infer<typeof UpdatePaymentsRequestSchema>;
export type UpdatePaymentResponse = z.infer<typeof UpdatePaymentResponseSchema>;
export type UpdatePaymentsResponse = z.infer<typeof UpdatePaymentsResponseSchema>;

export const CreatePaymentRequestSchema = z.object({
  userId: z.coerce.number().int().positive(),
  months: z.coerce.number().int().min(1),
  lessonCount: z.coerce.number().int(),
  isReregister: z.coerce.boolean(),
  method: z.coerce.number().int(),
  startDate: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
  endDate: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
  memo: z.string().optional(),
  paymentAmount: z.coerce.number().int().min(0),
  isStartDateNonSet: z.coerce.boolean().optional(),
});

export const CreatePaymentResponseSchema = DataResponseSchema(PaymentSchema);

export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;
export type CreatePaymentResponse = z.infer<typeof CreatePaymentResponseSchema>;
