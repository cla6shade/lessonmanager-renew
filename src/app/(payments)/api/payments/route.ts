import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { buildErrorResponse } from '@/app/utils';
import {
  CreatePaymentRequestSchema,
  CreatePaymentResponse,
  UpdatePaymentsRequestSchema,
  UpdatePaymentsResponse,
} from './schema';
import { getSession } from '@/lib/session';
import { createPayment } from '../../service';

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { payments } = UpdatePaymentsRequestSchema.parse(body);

    const updatedPayments = await Promise.all(
      payments.map(async (paymentUpdate) => {
        const updated = await prisma.payment.update({
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
        return updated;
      }),
    );

    return NextResponse.json<UpdatePaymentsResponse>({
      data: updatedPayments,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = CreatePaymentRequestSchema.parse(request.body);
    const payment = await createPayment(data);
    return NextResponse.json<CreatePaymentResponse>({
      data: payment,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
