import { generateCoachingPlan } from "@/lib/coachingEngine";
import { findSessionByToken, saveChallenge, saveCoachingPlan, trackAnalyticsEvent } from "@/lib/repository";
import { challengeSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const session = await findSessionByToken(token);
  if (!session) return NextResponse.json({ ok: false, message: "Session not found." }, { status: 404 });
  if (!session.profileConfirmed) {
    return NextResponse.json({ ok: false, message: "Confirm the preference summary before generating coaching." }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = challengeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Please check the challenge details." },
      { status: 400 }
    );
  }

  await saveChallenge(token, parsed.data);
  const result = await generateCoachingPlan({ profile: session.profileConfirmed, challenge: parsed.data });
  const updated = await saveCoachingPlan(token, result.plan, result.model, result.status);
  await trackAnalyticsEvent({
    sessionId: session.id,
    eventType: "coaching_plan_generated",
    stage: "PLAN_READY",
    metadata: {
      stage: "PLAN_READY",
      challengeType: parsed.data.challengeType,
      hasOpenAI: result.plan.generatedBy === "openai"
    }
  });
  return NextResponse.json({ ok: true, session: updated });
}
