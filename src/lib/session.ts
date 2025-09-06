"use server";

import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isAdmin: boolean;
  isLoggedIn: boolean;
  teacherId?: number;
  userId?: number;
  name: string;
  locationId: number;
}

const sessionOptions: SessionOptions = {
  cookieName: "lmsession",
  password: process.env.SESSION_SECRET!,
  ttl: 60 * 60 * 24 * 30, // 30 days
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function createSession(
  sessionData: Omit<SessionData, "isLoggedIn">
) {
  const session = await getSession();

  session.isLoggedIn = true;

  session.isAdmin = sessionData.isAdmin;
  session.teacherId = sessionData.teacherId;
  session.userId = sessionData.userId;
  session.name = sessionData.name;
  session.locationId = sessionData.locationId;

  return session.save();
}

export async function destroySession() {
  const session = await getSession();
  return session.destroy();
}
