import { createCoachSession, trackAnalyticsEvent } from "@/lib/repository";
import { startSessionSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = startSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Please check the session details." },
      { status: 400 }
    );
  }

  const session = await createCoachSession(parsed.data);
  await trackAnalyticsEvent({
    sessionId: session.id,
    eventType: "session_started",
    stage: session.stage,
    metadata: { stage: session.stage }
  });
  return NextResponse.json({ ok: true, url: `/coach/${session.publicToken}` });
}
