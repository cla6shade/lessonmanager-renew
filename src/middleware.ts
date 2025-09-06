import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEFAULT_ADMIN_MENU,
  DEFAULT_USER_MENU,
} from "./features/navigation/menu/menus";

export async function middleware(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
