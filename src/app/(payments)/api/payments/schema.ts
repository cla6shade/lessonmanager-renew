import { z } from "zod";
import { DataResponseSchema } from "@/app/schema";
import { PaymentSchema } from "@/generated/zod";
import { toKstDate } from "@/utils/date";

export const UpdatePaymentRequestSchema = z.object({
  id: z.number().int().positive(),
  refunded: z.boolean().optional(),
  refundedAmount: z.number().int().min(0).optional(),
  memo: z.string().optional(),
  startDate: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
  endDate: z.iso
    .datetime()
    .transform((val) => (val ? toKstDate(val) : undefined))
    .optional(),
});

export const UpdatePaymentsRequestSchema = z.object({
  payments: z.array(UpdatePaymentRequestSchema),
});

export const UpdatePaymentResponseSchema = DataResponseSchema(PaymentSchema);
export const UpdatePaymentsResponseSchema = DataResponseSchema(
  z.array(PaymentSchema)
);

export type UpdatePaymentRequest = z.infer<typeof UpdatePaymentRequestSchema>;
export type UpdatePaymentsRequest = z.infer<typeof UpdatePaymentsRequestSchema>;
export type UpdatePaymentResponse = z.infer<typeof UpdatePaymentResponseSchema>;
export type UpdatePaymentsResponse = z.infer<
  typeof UpdatePaymentsResponseSchema
>;
