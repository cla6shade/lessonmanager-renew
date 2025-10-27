import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginAction, logoutAction } from './loginAction';
import { LoginSchema } from './schema';
import { canLogin, getAccount } from './service';
import { createSession, destroySession } from '@/lib/session';
import { ActionState } from '@/app/types';
import { getUserByLoginId, getTeacherByLoginId } from '@mocks/helpers';

// Mock dependencies
vi.mock('./service');
vi.mock('@/lib/session');

const mockCanLogin = vi.mocked(canLogin);
const mockGetAccount = vi.mocked(getAccount);
const mockCreateSession = vi.mocked(createSession);
const mockDestroySession = vi.mocked(destroySession);

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('스키마 검증 실패', () => {
    it('loginId가 비어있을 때 에러를 반환해야 함', async () => {
      const testUser = getUserByLoginId('user1')!;

      const formData = new FormData();
      formData.append('loginId', '');
      formData.append('password', testUser.password);
      formData.append('isAdmin', 'false');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      const result = await loginAction(initialState, formData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.fieldErrors.loginId).toContain('올바른 아이디를 입력해주세요.');
    });

    it('password가 비어있을 때 에러를 반환해야 함', async () => {
      const testUser = getUserByLoginId('user1')!;

      const formData = new FormData();
      formData.append('loginId', testUser.loginId);
      formData.append('password', '');
      formData.append('isAdmin', 'false');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      const result = await loginAction(initialState, formData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.fieldErrors.password).toContain('올바른 비밀번호를 입력해주세요.');
    });
  });

  describe('계정 인증 실패', () => {
    it('존재하지 않는 계정일 때 에러 메시지를 반환해야 함', async () => {
      const formData = new FormData();
      formData.append('loginId', 'nonexistent');
      formData.append('password', 'wrongpassword');
      formData.append('isAdmin', 'false');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      mockGetAccount.mockResolvedValue(null);

      const result = await loginAction(initialState, formData);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('아이디나 비밀번호를 확인한 후 다시 시도해주세요.');
      expect(mockGetAccount).toHaveBeenCalledWith('nonexistent', 'wrongpassword', false);
    });
  });

  describe('로그인 권한 검증 실패', () => {
    it('수강 기간이 아닌 사용자일 때 에러 메시지를 반환해야 함', async () => {
      const testUser = getUserByLoginId('user1')!;

      const formData = new FormData();
      formData.append('loginId', testUser.loginId);
      formData.append('password', testUser.password);
      formData.append('isAdmin', 'false');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      const mockUser = getUserByLoginId('user1');
      if (!mockUser) throw new Error('Mock user not found');

      mockGetAccount.mockResolvedValue(mockUser);
      mockCanLogin.mockResolvedValue(false);

      const result = await loginAction(initialState, formData);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('수강 기간이 아닙니다.');
      expect(mockCanLogin).toHaveBeenCalledWith(mockUser, false);
    });

    it('결제 기간이 끝난 사용자는 로그인이 불가능해야 함', async () => {
      const testUser = getUserByLoginId('user2')!;

      const formData = new FormData();
      formData.append('loginId', testUser.loginId);
      formData.append('password', testUser.password);
      formData.append('isAdmin', 'false');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      const mockUser = getUserByLoginId('user2');
      if (!mockUser) throw new Error('Mock user not found');

      mockGetAccount.mockResolvedValue(mockUser);
      mockCanLogin.mockResolvedValue(false); // 결제 기간이 끝나서 false 반환

      const result = await loginAction(initialState, formData);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('수강 기간이 아닙니다.');
      expect(mockCanLogin).toHaveBeenCalledWith(mockUser, false);
    });

    it('환불된 결제를 가진 사용자는 로그인이 불가능해야 함', async () => {
      const testUser = getUserByLoginId('user3')!;

      const formData = new FormData();
      formData.append('loginId', testUser.loginId);
      formData.append('password', testUser.password);
      formData.append('isAdmin', 'false');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      const mockUser = getUserByLoginId('user3');
      if (!mockUser) throw new Error('Mock user not found');

      mockGetAccount.mockResolvedValue(mockUser);
      mockCanLogin.mockResolvedValue(false); // 환불된 결제로 인해 false 반환

      const result = await loginAction(initialState, formData);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('수강 기간이 아닙니다.');
      expect(mockCanLogin).toHaveBeenCalledWith(mockUser, false);
    });
  });

  describe('로그인 성공', () => {
    it('일반 사용자 로그인이 성공해야 함', async () => {
      const testUser = getUserByLoginId('user1')!;

      const formData = new FormData();
      formData.append('loginId', testUser.loginId);
      formData.append('password', testUser.password);
      formData.append('isAdmin', 'false');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      const mockUser = getUserByLoginId('user1');
      if (!mockUser) throw new Error('Mock user not found');

      mockGetAccount.mockResolvedValue(mockUser);
      mockCanLogin.mockResolvedValue(true);
      mockCreateSession.mockResolvedValue(undefined);

      const result = await loginAction(initialState, formData);

      expect(result.success).toBe(true);
      expect(mockCreateSession).toHaveBeenCalledWith({
        isAdmin: false,
        userId: testUser.id,
        locationId: testUser.locationId,
        name: testUser.name,
      });
    });

    it('관리자 로그인이 성공해야 함', async () => {
      const testTeacher = getTeacherByLoginId('teacherkim')!;

      const formData = new FormData();
      formData.append('loginId', testTeacher.loginId);
      formData.append('password', testTeacher.password);
      formData.append('isAdmin', 'true');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      const mockTeacher = getTeacherByLoginId('teacherkim');
      if (!mockTeacher) throw new Error('Mock teacher not found');

      mockGetAccount.mockResolvedValue(mockTeacher);
      mockCanLogin.mockResolvedValue(true);
      mockCreateSession.mockResolvedValue(undefined);

      const result = await loginAction(initialState, formData);

      expect(result.success).toBe(true);
      expect(mockCreateSession).toHaveBeenCalledWith({
        isAdmin: true,
        teacherId: testTeacher.id,
        locationId: testTeacher.locationId,
        name: testTeacher.name,
      });
    });
  });

  describe('세션 생성 실패', () => {
    it('세션 생성 중 에러가 발생하면 에러를 처리해야 함', async () => {
      const testUser = getUserByLoginId('user1')!;

      const formData = new FormData();
      formData.append('loginId', testUser.loginId);
      formData.append('password', testUser.password);
      formData.append('isAdmin', 'false');

      const initialState: ActionState<typeof LoginSchema> = {
        success: false,
      };

      const mockUser = getUserByLoginId('user1');
      if (!mockUser) throw new Error('Mock user not found');

      mockGetAccount.mockResolvedValue(mockUser);
      mockCanLogin.mockResolvedValue(true);
      mockCreateSession.mockRejectedValue(new Error('세션 생성 실패'));

      await expect(loginAction(initialState, formData)).rejects.toThrow('세션 생성 실패');
    });
  });
});

describe('logoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('로그아웃이 성공해야 함', async () => {
    mockDestroySession.mockResolvedValue(undefined);

    const result = await logoutAction();

    expect(result.success).toBe(true);
    expect(mockDestroySession).toHaveBeenCalledOnce();
  });

  it('세션 삭제 중 에러가 발생하면 에러 메시지를 반환해야 함', async () => {
    mockDestroySession.mockRejectedValue(new Error('세션 삭제 실패'));

    const result = await logoutAction();

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('로그아웃에 실패했습니다.');
  });
});
