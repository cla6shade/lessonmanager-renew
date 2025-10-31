import { NextRequest, NextResponse } from 'next/server';
import { GetSMSTargetRequestSchema, SendSMSRequestSchema } from './schema';
import { getTargetUsers, sendMessage } from './service';
import { routeWrapper } from '@/lib/routeWrapper';

export const POST = routeWrapper(
  async (request) => {
    const body = await request.json();
    const { receiverType, message, targetInfos, selectedLocationId } =
      SendSMSRequestSchema.parse(body);

    const sendResult = await sendMessage({
      receiverType,
      message,
      targetInfos,
      selectedLocationId,
    });
    console.log(sendResult);

    return NextResponse.json({ success: true });
  },
  { requireAdmin: true },
);

export const GET = routeWrapper(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const { receiverType, selectedLocationId, isTotalSelected, name, birthDate, contact } =
      GetSMSTargetRequestSchema.parse({
        receiverType: searchParams.get('receiverType'),
        selectedLocationId: Number(searchParams.get('selectedLocationId')),
        isTotalSelected: searchParams.get('isTotalSelected'),
        name: searchParams.get('name') || undefined,
        birthDate: searchParams.get('birthDate') || undefined,
        contact: searchParams.get('contact') || undefined,
      });

    const targetUsers = await getTargetUsers({
      receiverType,
      isTotalSelected,
      selectedLocationId,
      name,
      birthDate,
      contact,
    });

    return NextResponse.json({ data: targetUsers });
  },
  { requireAdmin: true },
);
