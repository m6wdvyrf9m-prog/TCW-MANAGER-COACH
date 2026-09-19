import { requireAdminConfig } from "@/lib/env";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "tcw_manager_coach_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export async function verifyAdminLogin(username: string, password: string) {
  const config = requireAdminConfig();
  if (username !== config.username) return false;
  return bcrypt.compare(password, config.passwordHash);
}

export async function createAdminSession(username: string) {
  const cookieStore = await cookies();
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ username, expires })).toString("base64url");
  const signature = sign(payload);
  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !timingSafeEqual(signature, sign(payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username: string;
      expires: number;
    };
    if (parsed.expires < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  return getAdminSession();
}

function sign(payload: string) {
  const { sessionSecret } = requireAdminConfig();
  return crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
