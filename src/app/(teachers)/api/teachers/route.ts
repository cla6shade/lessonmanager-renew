import { NextRequest, NextResponse } from 'next/server';
import {
  CreateTeacherRequestSchema,
  CreateTeacherResponse,
  TeacherSearchRequestSchema,
  TeacherSearchResponse,
} from './schema';
import { searchTeachers, createTeacher, checkDuplicateTeacher } from '../../service';
import { encryptPassword } from '@/app/(auth)/login/service';
import { initWorkingTime } from '@/app/(table)/service';
import { routeWrapper } from '@/lib/routeWrapper';
import { BadRequestError, ConflictError } from '@/lib/errors';

export const GET = routeWrapper(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validatedParams = TeacherSearchRequestSchema.parse(queryParams);
    const { startDate, endDate, page, limit } = validatedParams;

    let [teachers, total] = await searchTeachers({
      startDate,
      endDate,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<TeacherSearchResponse>({
      data: teachers,
      total,
      totalPages,
    });
  },
  { requireAdmin: true },
);

export const POST = routeWrapper(
  async (request) => {
    let requestData = CreateTeacherRequestSchema.parse(await request.json());
    const { password, passwordConfirm, loginId, email } = requestData;

    // Validate password confirmation
    if (password !== passwordConfirm) {
      throw new BadRequestError('비밀번호가 일치하지 않습니다.');
    }

    // Check for duplicate loginId and email
    const duplicateCheck = await checkDuplicateTeacher(loginId, email);

    if (duplicateCheck.loginIdExists) {
      throw new ConflictError('이미 사용 중인 아이디입니다.');
    }

    if (duplicateCheck.emailExists) {
      throw new ConflictError('이미 사용 중인 이메일입니다.');
    }

    const { locationId, majorId, passwordConfirm: _, ...otherData } = requestData;

    const creationData = {
      ...otherData,
      lessonReservedCount: 0,
      registeredAt: new Date(),
      isLeaved: false,
      password: await encryptPassword(password),
      location: {
        connect: { id: locationId },
      },
      major: {
        connect: { id: majorId },
      },
    };

    const { id } = await createTeacher(creationData);
    await initWorkingTime(id);

    return NextResponse.json<CreateTeacherResponse>({
      data: {
        id,
      },
    });
  },
  { requireAdmin: true },
);
