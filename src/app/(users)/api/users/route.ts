import { NextRequest, NextResponse } from 'next/server';
import {
  CreateUserRequestSchema,
  CreateUserResponse,
  UserSearchRequestSchema,
  UserSearchResponse,
} from './schema';
import { searchUsers, checkDuplicateUser } from '../../service';
import prisma from '@/lib/prisma';
import { encryptPassword } from '@/app/(auth)/login/service';
import { routeWrapper } from '@/lib/routeWrapper';
import { BadRequestError, ConflictError } from '@/lib/errors';

export const GET = routeWrapper(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      name: searchParams.get('name') || undefined,
      contact: searchParams.get('contact') || undefined,
      birthDate: searchParams.get('birthDate') || undefined,
      locationId:
        searchParams.get('locationId') === null ? undefined : searchParams.get('locationId'),
      filter: searchParams.get('filter') || 'ALL',
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    };

    const validatedParams = UserSearchRequestSchema.parse(queryParams);
    const { name, contact, birthDate, locationId, filter, page, limit } = validatedParams;

    let [users, total] = await searchUsers({
      name,
      contact,
      birthDate,
      locationId,
      filter,
      page,
      limit,
    });

    const totalPages = Math.ceil(limit ? total / limit : 1);

    return NextResponse.json<UserSearchResponse>({
      data: users,
      total,
      totalPages,
    });
  },
  { requireAdmin: true },
);

export const POST = routeWrapper(
  async (request) => {
    let requestData = CreateUserRequestSchema.parse(await request.json());
    const { password, passwordConfirm, loginId, email } = requestData;

    // Validate password confirmation
    if (password !== passwordConfirm) {
      throw new BadRequestError('패스워드가 일치하지 않습니다.');
    }

    // Check for duplicate loginId and email
    const duplicateCheck = await checkDuplicateUser(loginId, email);

    if (duplicateCheck.loginIdExists) {
      throw new ConflictError('이미 사용 중인 아이디입니다.');
    }

    if (duplicateCheck.emailExists) {
      throw new ConflictError('이미 사용 중인 이메일입니다.');
    }

    const creationData = {
      ...requestData,
      teacherInChargeId: null,
      latestLessonId: null,
      lessonCount: 0,
      usedLessonCount: 0,
      paymentCount: 0,
      streakCount: 0,
      isLeaved: false,
      isSubscribed: true,
      point: 0,

      password: await encryptPassword(password),
      passwordConfirm: undefined,
    };
    const { id } = await prisma.user.create({
      data: creationData,
    });
    return NextResponse.json<CreateUserResponse>({
      data: {
        id,
      },
    });
  },
  { requireAdmin: true },
);
