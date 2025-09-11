import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { middleware } from "./middleware";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Mock dependencies
vi.mock("@/lib/session");

const mockGetSession = vi.mocked(getSession);

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("인증되지 않은 사용자", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        isLoggedIn: false,
        isAdmin: false,
        name: "",
        locationId: 0,
      } as any);
    });

    it("로그인 페이지로의 요청은 통과시켜야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/login");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("API 요청에 대해 401 에러를 반환해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/users/me");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("일반 페이지 요청을 로그인 페이지로 리다이렉트해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/user");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login"
      );
    });

    it("홈페이지 요청을 로그인 페이지로 리다이렉트해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login"
      );
    });
  });

  describe("인증된 일반 사용자", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        isLoggedIn: true,
        isAdmin: false,
        name: "Test User",
        locationId: 0,
        userId: 1,
      } as any);
    });

    it("로그인 페이지 접근 시 사용자 메뉴로 리다이렉트해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/login");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });

    it("일반 사용자 페이지 접근을 허용해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/user");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("일반 API 요청을 허용해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/users/me");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("관리자 API 요청에 대해 401 에러를 반환해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/admin/users");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("관리자 페이지 접근을 허용하지 않아야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/teacher");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/user"
      );
    });

    it("teacher 페이지 접근 시 user 페이지로 리다이렉트해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/teacher");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/user"
      );
    });
  });

  describe("인증된 관리자 사용자", () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        isLoggedIn: true,
        isAdmin: true,
        name: "Admin User",
        locationId: 0,
        userId: 1,
      } as any);
    });

    it("로그인 페이지 접근 시 관리자 메뉴로 리다이렉트해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/login");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });

    it("관리자 API 요청을 허용해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/admin/users");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("일반 API 요청을 허용해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/users/me");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("관리자 페이지 접근을 허용해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/admin");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("일반 사용자 페이지 접근을 허용해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/user");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("teacher 페이지 접근을 허용해야 함", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/teacher");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe("에러 처리", () => {
    it("getSession 에러 발생 시 API 요청에 대해 500 에러를 반환해야 함", async () => {
      // Arrange
      mockGetSession.mockRejectedValue(new Error("Session error"));
      const request = new NextRequest("http://localhost:3000/api/users/me");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Internal Server Error" });
    });

    it("일반 에러 발생 시 500 에러를 반환해야 함", async () => {
      // Arrange
      mockGetSession.mockRejectedValue(new Error("Database connection failed"));
      const request = new NextRequest("http://localhost:3000/api/users/me");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Internal Server Error" });
    });

    it("페이지 요청에서 에러 발생 시 500 에러를 반환해야 함", async () => {
      // Arrange
      mockGetSession.mockRejectedValue(
        new Error("Session service unavailable")
      );
      const request = new NextRequest("http://localhost:3000/user");

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ error: "Internal Server Error" });
    });
  });
});
