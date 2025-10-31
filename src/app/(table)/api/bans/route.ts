import { NextRequest, NextResponse } from 'next/server';
import {
  GetBannedTimesQuerySchema,
  GetBannedTimesResponse,
  CreateBannedTimeRequestSchema,
  CreateBannedTimeResponse,
  UpdateBannedTimesRequestSchema,
  UpdateBannedTimesResponse,
} from './schema';
import { getBannedTimes, createBannedTime, updateBannedTimes } from '../../service';
import { routeWrapper } from '@/lib/routeWrapper';

export const GET = routeWrapper(async (request) => {
  const { searchParams } = new URL(request.url);
  const rawQuery = Object.fromEntries(searchParams.entries());
  const { startDate, endDate, teacherId } = GetBannedTimesQuerySchema.parse(rawQuery);

  const bannedTimes = await getBannedTimes({
    startDate,
    endDate,
    teacherId,
  });

  return NextResponse.json<GetBannedTimesResponse>({ data: bannedTimes });
});

export const POST = routeWrapper(
  async (request) => {
    const requestData = CreateBannedTimeRequestSchema.parse(await request.json());
    const bannedTime = await createBannedTime(requestData);

    return NextResponse.json<CreateBannedTimeResponse>({ data: bannedTime });
  },
  { requireAdmin: true },
);

export const PUT = routeWrapper(
  async (request) => {
    const requestData = UpdateBannedTimesRequestSchema.parse(await request.json());
    const bannedTimes = await updateBannedTimes(requestData);

    return NextResponse.json<UpdateBannedTimesResponse>({ data: bannedTimes });
  },
  { requireAdmin: true },
);
