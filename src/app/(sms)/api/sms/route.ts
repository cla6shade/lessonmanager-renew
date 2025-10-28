import { buildErrorResponse } from '@/app/utils';
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { GetSMSTargetRequestSchema, SendSMSRequestSchema } from './schema';
import { getTargetUsers, sendMessage } from './service';

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { receiverType, selectedLocationId, isTotalSelected } = GetSMSTargetRequestSchema.parse({
      receiverType: searchParams.get('receiverType'),
      selectedLocationId: Number(searchParams.get('selectedLocationId')),
      isTotalSelected: searchParams.get('isTotalSelected'),
    });

    const targetUsers = await getTargetUsers({
      receiverType,
      isTotalSelected,
      selectedLocationId,
    });

    return NextResponse.json({ data: targetUsers });
  } catch (error) {
    console.error(error);
    return buildErrorResponse(error);
  }
}
