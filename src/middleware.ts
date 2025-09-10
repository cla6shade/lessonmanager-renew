import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEFAULT_ADMIN_MENU,
  DEFAULT_USER_MENU,
} from "./features/navigation/menu/menus";
import z from "zod";

export async function middleware(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      if (request.nextUrl.pathname === "/login") {
        return NextResponse.next();
      }
      if (request.nextUrl.pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(
        new URL(
          session.isAdmin ? DEFAULT_ADMIN_MENU.href : DEFAULT_USER_MENU.href,
          request.url
        )
      );
    }

    if (!session.isAdmin) {
      if (request.nextUrl.pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (request.nextUrl.pathname.startsWith("/teacher")) {
        return NextResponse.redirect(new URL("/user", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in middleware:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          errors: z.flattenError(error),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
