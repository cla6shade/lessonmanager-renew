import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { mockUsers } from '@mocks/users';
import prisma from '@/lib/prisma';

describe('GET /api/users/lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(prisma.user, 'findMany');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('사용자 검색', () => {
    it('이름으로 사용자를 검색할 수 있어야 함', async () => {
      // Arrange
      const searchQuery = 'User1';
      const filteredUsers = mockUsers
        .filter((user) => user.name.includes(searchQuery))
        .map(({ id, name, contact }) => ({ id, name, contact }));

      const request = new NextRequest(
        `http://localhost:3000/api/users/lookup?query=${searchQuery}`,
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: filteredUsers });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ name: { contains: searchQuery } }, { contact: { contains: searchQuery } }],
        },
        select: {
          id: true,
          name: true,
          contact: true,
        },
      });
    });

    it('연락처로 사용자를 검색할 수 있어야 함', async () => {
      // Arrange
      const searchQuery = '01055550000';
      const filteredUsers = mockUsers
        .filter((user) => user.contact.includes(searchQuery))
        .map(({ id, name, contact }) => ({ id, name, contact }));

      const request = new NextRequest(
        `http://localhost:3000/api/users/lookup?query=${searchQuery}`,
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: filteredUsers });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ name: { contains: searchQuery } }, { contact: { contains: searchQuery } }],
        },
        select: {
          id: true,
          name: true,
          contact: true,
        },
      });
    });

    it('빈 검색 결과를 반환할 수 있어야 함', async () => {
      // Arrange
      const searchQuery = '존재하지않는사용자';

      const request = new NextRequest(
        `http://localhost:3000/api/users/lookup?query=${searchQuery}`,
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: [] });
    });

    it('부분 일치 검색이 가능해야 함', async () => {
      // Arrange
      const searchQuery = 'User';
      const filteredUsers = mockUsers
        .filter((user) => user.name.includes(searchQuery))
        .map(({ id, name, contact }) => ({ id, name, contact }));

      const request = new NextRequest(
        `http://localhost:3000/api/users/lookup?query=${searchQuery}`,
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: filteredUsers });
    });
  });
});
