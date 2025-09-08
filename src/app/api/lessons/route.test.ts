import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { mockLessons } from "../../../../scripts/test/mocks/lessons";
import prisma from "@/lib/prisma";

// Mock dependencies
vi.mock("@/lib/session");

const mockGetSession = vi.mocked(getSession);

describe("GET /api/lessons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(prisma.lesson, "findMany");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("인증되지 않은 사용자", () => {
    it("로그인하지 않은 사용자는 401 에러를 받아야 함", async () => {
      // Arrange
      mockGetSession.mockResolvedValue({
        isLoggedIn: false,
        isAdmin: false,
        name: "",
        locationId: 0,
      } as any);

      const request = new NextRequest("http://localhost:3000/api/lessons");

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });
  });

  describe("인증된 사용자", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        isLoggedIn: true,
        isAdmin: false,
        name: "Test User",
        locationId: 0,
        userId: 1,
      } as any);
    });

    it("기본 쿼리로 모든 레슨을 조회할 수 있어야 함", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=2025-09-01T00:00:00Z&endDate=2025-09-30T23:59:59Z"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: JSON.parse(JSON.stringify(mockLessons)) });
      expect(prisma.lesson.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            gte: new Date("2025-09-01T00:00:00Z"),
            lte: new Date("2025-09-30T23:59:59Z"),
          },
        },
      });
    });

    it("teacherId 필터로 레슨을 조회할 수 있어야 함", async () => {
      // Arrange
      const filteredLessons = mockLessons.filter(
        (lesson) => lesson.teacherId === 1
      );
      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=2025-09-01T00:00:00Z&endDate=2025-09-30T23:59:59Z&teacherId=1"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({
        data: JSON.parse(JSON.stringify(filteredLessons)),
      });
      expect(prisma.lesson.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            gte: new Date("2025-09-01T00:00:00Z"),
            lte: new Date("2025-09-30T23:59:59Z"),
          },
          teacherId: 1,
        },
      });
    });

    it("locationId 필터로 레슨을 조회할 수 있어야 함", async () => {
      // Arrange
      const filteredLessons = mockLessons.filter(
        (lesson) => lesson.locationId === 0
      );
      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=2025-09-01T00:00:00Z&endDate=2025-09-30T23:59:59Z&locationId=0"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({
        data: JSON.parse(JSON.stringify(filteredLessons)),
      });
      expect(prisma.lesson.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            gte: new Date("2025-09-01T00:00:00Z"),
            lte: new Date("2025-09-30T23:59:59Z"),
          },
          locationId: 0,
        },
      });
    });

    it("teacherId와 locationId 모두 필터로 레슨을 조회할 수 있어야 함", async () => {
      // Arrange
      const filteredLessons = mockLessons.filter(
        (lesson) => lesson.teacherId === 1 && lesson.locationId === 0
      );
      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=2025-09-01T00:00:00Z&endDate=2025-09-30T23:59:59Z&teacherId=1&locationId=0"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({
        data: JSON.parse(JSON.stringify(filteredLessons)),
      });
      expect(prisma.lesson.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            gte: new Date("2025-09-01T00:00:00Z"),
            lte: new Date("2025-09-30T23:59:59Z"),
          },
          teacherId: 1,
          locationId: 0,
        },
      });
    });

    it("빈 결과를 반환할 수 있어야 함", async () => {
      // Arrange - 날짜 범위를 벗어난 날짜로 검색
      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=2025-12-01T00:00:00Z&endDate=2025-12-31T23:59:59Z"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: [] });
    });
  });

  describe("에러 처리", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        isLoggedIn: true,
        isAdmin: false,
        name: "Test User",
        locationId: 0,
        userId: 1,
      } as any);
    });

    it("잘못된 쿼리 파라미터로 인한 스키마 검증 실패 시 500 에러를 반환해야 함", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=invalid-date&endDate=2025-09-30T23:59:59Z"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Internal Server Error" });
    });

    it("필수 파라미터가 누락된 경우 500 에러를 반환해야 함", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=2025-09-01T00:00:00Z"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Internal Server Error" });
    });

    it("데이터베이스 에러 발생 시 500 에러를 반환해야 함", async () => {
      // Arrange
      vi.spyOn(prisma.lesson, "findMany").mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=2025-09-01T00:00:00Z&endDate=2025-09-30T23:59:59Z"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Internal Server Error" });
    });

    it("getSession 에러 발생 시 500 에러를 반환해야 함", async () => {
      // Arrange
      mockGetSession.mockRejectedValue(new Error("Session error"));

      const request = new NextRequest(
        "http://localhost:3000/api/lessons?startDate=2025-09-01T00:00:00Z&endDate=2025-09-30T23:59:59Z"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Internal Server Error" });
    });
  });
});
