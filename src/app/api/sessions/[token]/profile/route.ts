import { behaviouralContextSchema } from "@/lib/validation";
import { confirmProfile, findSessionByToken, trackAnalyticsEvent } from "@/lib/repository";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const current = await findSessionByToken(token);
  if (!current) return NextResponse.json({ ok: false, message: "Session not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = behaviouralContextSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Please check the preference summary." },
      { status: 400 }
    );
  }

  const updated = await confirmProfile(token, parsed.data);
  await trackAnalyticsEvent({
    sessionId: current.id,
    eventType: "profile_confirmed",
    stage: "CHALLENGE",
    metadata: { stage: "CHALLENGE", profileConfidence: parsed.data.confidence }
  });
  return NextResponse.json({ ok: true, session: updated });
}
