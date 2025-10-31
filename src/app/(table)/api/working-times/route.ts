import { NextRequest, NextResponse } from 'next/server';
import {
  GetWorkingTimesResponse,
  UpdateWorkingTimeRequestSchema,
  UpdateWorkingTimeResponse,
} from './schema';
import { getWorkingTimes, updateWorkingTime } from '../../service';
import prisma from '@/lib/prisma';
import { routeWrapper } from '@/lib/routeWrapper';

export const PUT = routeWrapper(
  async (request) => {
    const requestData = UpdateWorkingTimeRequestSchema.parse(await request.json());

    const times = await updateWorkingTime(requestData);

    return NextResponse.json<UpdateWorkingTimeResponse>({ data: times });
  },
  { requireAdmin: true },
);

export const GET = routeWrapper(async (request) => {
  const times = await getWorkingTimes();
  const openHours = await prisma.openHours.findFirst();

  return NextResponse.json<GetWorkingTimesResponse>({
    data: { times, openHours: openHours! },
  });
});
