import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { buildErrorResponse } from "@/app/utils";
import { UpdatePaymentsRequestSchema, UpdatePaymentsResponse } from "./schema";
import { getSession } from "@/lib/session";

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          },
        });
        return updated;
      })
    );

    return NextResponse.json<UpdatePaymentsResponse>({
      data: updatedPayments,
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
