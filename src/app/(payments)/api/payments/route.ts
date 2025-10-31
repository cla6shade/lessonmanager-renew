import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import {
  CreatePaymentRequestSchema,
  CreatePaymentResponse,
  UpdatePaymentsRequestSchema,
  UpdatePaymentsResponse,
} from './schema';
import { createPayment } from '../../service';
import { routeWrapper } from '@/lib/routeWrapper';

export const PUT = routeWrapper(
  async (request) => {
    const body = await request.json();
    const { payments } = UpdatePaymentsRequestSchema.parse(body);

    const updatedPayments = await Promise.all(
      payments.map(async (paymentUpdate) => {
        return prisma.payment.update({
          where: { id: paymentUpdate.id },
          data: {
            refunded: paymentUpdate.refunded,
            refundedAmount: paymentUpdate.refundedAmount,
            memo: paymentUpdate.memo,
            startDate: paymentUpdate.startDate,
            endDate: paymentUpdate.endDate,
            isStartDateNonSet: paymentUpdate.isStartDateNonSet,
          },
        });
      }),
    );

    return NextResponse.json<UpdatePaymentsResponse>({
      data: updatedPayments,
    });
  },
  { requireAdmin: true },
);

export const POST = routeWrapper(
  async (request) => {
    const data = CreatePaymentRequestSchema.parse(request.body);
    const payment = await createPayment(data);
    return NextResponse.json<CreatePaymentResponse>({
      data: payment,
    });
  },
  { requireAdmin: true },
);
