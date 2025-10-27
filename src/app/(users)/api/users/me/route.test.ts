import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { mockUsers } from '@mocks/users';
import prisma from '@/lib/prisma';

// Mock dependencies
vi.mock('@/lib/session');

const mockGetSession = vi.mocked(getSession);

describe('GET /api/users/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(prisma.user, 'findUnique');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('인증된 사용자', () => {
    it('로그인한 사용자의 정보를 조회할 수 있어야 함', async () => {
      // Arrange
      const mockUser = mockUsers[0];
      mockGetSession.mockResolvedValue({
        isLoggedIn: true,
        isAdmin: false,
        name: 'Test User',
        locationId: 0,
        userId: 1,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/users/me');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();

      // 기본 사용자 정보 확인
      expect(body.data.id).toBe(mockUser.id);
      expect(body.data.name).toBe(mockUser.name);
      expect(body.data.contact).toBe(mockUser.contact);
      expect(body.data.email).toBe(mockUser.email);
      expect(body.data.locationId).toBe(mockUser.locationId);
      expect(body.data.teacherInChargeId).toBe(mockUser.teacherInChargeId);

      expect(body.data.location).toBeDefined();
      expect(body.data.location.id).toBe(mockUser.locationId);

      expect(body.data.teacherInCharge).toBeDefined();
      expect(body.data.teacherInCharge.id).toBe(mockUser.teacherInChargeId);
      expect(body.data.teacherInCharge.name).toBeDefined();

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          location: true,
          teacherInCharge: {
            select: {
              id: true,
              name: true,
            },
          },
          latestLesson: true,
        },
        omit: {
          password: true,
        },
      });
    });

    it('존재하지 않는 사용자 ID로 조회 시 404 에러를 반환해야 함', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        isLoggedIn: true,
        isAdmin: false,
        name: 'Test User',
        locationId: 0,
        userId: 999,
      } as any);

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const request = new NextRequest('http://localhost:3000/api/users/me');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: 'User not found' });
    });
  });

  describe('인증되지 않은 사용자', () => {
    it('userId가 없을 때 400 에러를 반환해야 함', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        isLoggedIn: false,
        isAdmin: false,
        name: '',
        locationId: 0,
        userId: null,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/users/me');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: 'Bad Request' });
    });

    it('userId가 undefined일 때 400 에러를 반환해야 함', async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        isLoggedIn: true,
        isAdmin: false,
        name: 'Test User',
        locationId: 0,
        userId: undefined,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/users/me');

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: 'Bad Request' });
    });
  });
});
