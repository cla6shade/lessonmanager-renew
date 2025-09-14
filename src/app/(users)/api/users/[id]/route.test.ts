import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { mockUsers } from "@mocks/users";
import prisma from "@/lib/prisma";

describe("GET /api/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(prisma.user, "findUnique");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("사용자 상세 조회", () => {
    it("유효한 사용자 ID로 사용자 상세 정보를 조회할 수 있어야 함", async () => {
      // Arrange
      const userId = 1;
      const mockUser = mockUsers.find((user) => user.id === userId);
      const request = new NextRequest(
        `http://localhost:3000/api/users/${userId}`
      );

      // Act
      const response = await GET(request, {
        params: Promise.resolve({ id: userId.toString() }),
      });

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(userId);

      // relation 필드들의 ID가 올바르게 연결되어 있는지 확인
      expect(body.data.location).toBeDefined();
      expect(body.data.location.id).toBe(mockUser!.locationId);

      if (body.data.teacherInCharge) {
        expect(body.data.teacherInCharge.id).toBe(mockUser!.teacherInChargeId);
      }

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          location: true,
          teacherInCharge: {
            omit: { password: true },
          },
          latestLesson: true,
        },
        omit: {
          password: true,
        },
      });
    });

    it("존재하지 않는 사용자 ID로 조회 시 404 에러를 반환해야 함", async () => {
      // Arrange
      const userId = 999;
      const request = new NextRequest(
        `http://localhost:3000/api/users/${userId}`
      );

      // Act
      const response = await GET(request, {
        params: Promise.resolve({ id: userId.toString() }),
      });

      // Assert
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: "User not found" });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          location: true,
          teacherInCharge: {
            omit: { password: true },
          },
          latestLesson: true,
        },
        omit: {
          password: true,
        },
      });
    });

    it("teacherInCharge가 null인 사용자도 조회할 수 있어야 함", async () => {
      // Arrange
      const userId = 1;
      const request = new NextRequest(
        `http://localhost:3000/api/users/${userId}`
      );

      // Act
      const response = await GET(request, {
        params: Promise.resolve({ id: userId.toString() }),
      });

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(userId);
    });

    it("latestLesson이 null인 사용자도 조회할 수 있어야 함", async () => {
      // Arrange
      const userId = 1;
      const request = new NextRequest(
        `http://localhost:3000/api/users/${userId}`
      );

      // Act
      const response = await GET(request, {
        params: Promise.resolve({ id: userId.toString() }),
      });

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.id).toBe(userId);
    });
  });

  describe("에러 처리", () => {
    it("잘못된 사용자 ID 형식으로 요청 시 400 에러를 반환해야 함", async () => {
      // Arrange
      const invalidId = "invalid";
      const request = new NextRequest(
        `http://localhost:3000/api/users/${invalidId}`
      );

      // Act
      const response = await GET(request, {
        params: Promise.resolve({ id: invalidId }),
      });

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: "Invalid user ID" });
    });

    it("빈 사용자 ID로 요청 시 400 에러를 반환해야 함", async () => {
      // Arrange
      const emptyId = "";
      const request = new NextRequest(
        `http://localhost:3000/api/users/${emptyId}`
      );

      // Act
      const response = await GET(request, {
        params: Promise.resolve({ id: emptyId }),
      });

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: "Invalid user ID" });
    });

    it("존재하지 않는 사용자 ID로 요청 시 404 에러를 반환해야 함", async () => {
      // Arrange
      const zeroId = "0";
      const request = new NextRequest(
        `http://localhost:3000/api/users/${zeroId}`
      );

      // Act
      const response = await GET(request, {
        params: Promise.resolve({ id: zeroId }),
      });

      // Assert
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toEqual({ error: "User not found" });
    });
  });
});
