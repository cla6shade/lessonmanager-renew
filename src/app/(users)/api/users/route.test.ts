import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { mockUsers } from "@mocks/users";
import prisma from "@/lib/prisma";

describe("GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(prisma.user, "findMany");
    vi.spyOn(prisma.user, "count");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("사용자 검색", () => {
    it("기본 쿼리로 모든 사용자를 조회할 수 있어야 함", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/users?page=1&limit=20"
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toHaveLength(mockUsers.length);
      expect(body.total).toBe(mockUsers.length);
      expect(body.totalPages).toBe(1);

      // relation 필드들의 ID가 올바르게 연결되어 있는지 확인
      body.data.forEach((user: any) => {
        expect(user.location).toBeDefined();
        expect(user.location.id).toBe(user.locationId);

        if (user.teacherInCharge) {
          expect(user.teacherInCharge.id).toBe(user.teacherInChargeId);
        }
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { isLeaved: false },
        include: {
          location: true,
          teacherInCharge: {
            omit: {
              password: true,
            },
          },
          latestLesson: true,
        },
        omit: {
          password: true,
        },
        orderBy: {
          registeredAt: "desc",
        },
        skip: 0,
        take: 20,
      });
    });

    it("이름으로 사용자를 필터링할 수 있어야 함", async () => {
      // Arrange
      const nameFilter = "User1";
      const expectedFilteredCount = mockUsers.filter((user) =>
        user.name.includes(nameFilter)
      ).length;

      const request = new NextRequest(
        `http://localhost:3000/api/users?name=${nameFilter}&page=1&limit=20`
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toHaveLength(expectedFilteredCount);
      expect(body.total).toBe(expectedFilteredCount);
      expect(body.totalPages).toBe(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          isLeaved: false,
          name: { contains: nameFilter },
        },
        include: {
          location: true,
          teacherInCharge: {
            omit: {
              password: true,
            },
          },
          latestLesson: true,
        },
        omit: {
          password: true,
        },
        orderBy: {
          registeredAt: "desc",
        },
        skip: 0,
        take: 20,
      });
    });

    it("연락처로 사용자를 필터링할 수 있어야 함", async () => {
      // Arrange
      const contactFilter = "01055550000";
      const expectedFilteredCount = mockUsers.filter((user) =>
        user.contact.includes(contactFilter)
      ).length;

      const request = new NextRequest(
        `http://localhost:3000/api/users?contact=${contactFilter}&page=1&limit=20`
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toHaveLength(expectedFilteredCount);
      expect(body.total).toBe(expectedFilteredCount);
      expect(body.totalPages).toBe(1);
    });

    it("지점 ID로 사용자를 필터링할 수 있어야 함", async () => {
      // Arrange
      const locationId = 0;
      const expectedFilteredCount = mockUsers.filter(
        (user) => user.locationId === locationId
      ).length;

      const request = new NextRequest(
        `http://localhost:3000/api/users?locationId=${locationId}&page=1&limit=20`
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toHaveLength(expectedFilteredCount);
      expect(body.total).toBe(expectedFilteredCount);
      expect(body.totalPages).toBe(1);
    });

    it("여러 필터를 조합하여 사용자를 검색할 수 있어야 함", async () => {
      // Arrange
      const nameFilter = "User";
      const locationId = 0;
      const expectedFilteredCount = mockUsers.filter(
        (user) =>
          user.name.includes(nameFilter) && user.locationId === locationId
      ).length;

      const request = new NextRequest(
        `http://localhost:3000/api/users?name=${nameFilter}&locationId=${locationId}&page=1&limit=20`
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toHaveLength(expectedFilteredCount);
      expect(body.total).toBe(expectedFilteredCount);
      expect(body.totalPages).toBe(1);
    });

    it("페이지네이션이 올바르게 작동해야 함", async () => {
      // Arrange
      const page = 2;
      const limit = 5;

      const request = new NextRequest(
        `http://localhost:3000/api/users?page=${page}&limit=${limit}`
      );

      // Act
      const response = await GET(request);

      // Assert
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toHaveLength(limit);
      expect(body.total).toBe(mockUsers.length);
      expect(body.totalPages).toBe(Math.ceil(mockUsers.length / limit));
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { isLeaved: false },
        include: {
          location: true,
          teacherInCharge: {
            omit: {
              password: true,
            },
          },
          latestLesson: true,
        },
        omit: {
          password: true,
        },
        orderBy: {
          registeredAt: "desc",
        },
        skip: 5, // (page - 1) * limit
        take: limit,
      });
    });
  });
});
