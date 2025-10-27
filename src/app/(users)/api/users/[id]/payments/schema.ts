import { PaginatedDataResponseSchema } from '@/app/schema';
import { PaymentSchema } from '@/generated/zod';
import { z } from 'zod';

export const UserPaymentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const UserPaymentsResponseSchema = PaginatedDataResponseSchema(z.array(PaymentSchema));

export type UserPaymentsQuery = z.infer<typeof UserPaymentsQuerySchema>;
export type UserPaymentsResponse = z.infer<typeof UserPaymentsResponseSchema>;
