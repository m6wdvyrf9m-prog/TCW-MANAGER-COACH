import { createAdminSession, verifyAdminLogin } from "@/lib/adminAuth";
import { adminLoginSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter your admin username and password." }, { status: 400 });
  }

  try {
    const valid = await verifyAdminLogin(parsed.data.username, parsed.data.password);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "The admin login details were not recognised." }, { status: 401 });
    }
    await createAdminSession(parsed.data.username);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Admin login is not configured yet." }, { status: 503 });
  }
}
