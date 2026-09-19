import { findSessionByToken, saveReflection, trackAnalyticsEvent } from "@/lib/repository";
import { reflectionSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const session = await findSessionByToken(token);
  if (!session) return NextResponse.json({ ok: false, message: "Session not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = reflectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Please check the reflection." },
      { status: 400 }
    );
  }

  const updated = await saveReflection(token, { ...parsed.data, reflectedAt: new Date().toISOString() });
  await trackAnalyticsEvent({
    sessionId: session.id,
    eventType: "reflection_saved",
    stage: "COMPLETE",
    metadata: { stage: "COMPLETE" }
  });
  return NextResponse.json({ ok: true, session: updated });
}
