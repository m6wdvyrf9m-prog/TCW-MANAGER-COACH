import { findSessionByToken, saveActionPlan, trackAnalyticsEvent } from "@/lib/repository";
import { actionPlanSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const session = await findSessionByToken(token);
  if (!session) return NextResponse.json({ ok: false, message: "Session not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = actionPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Please check the action plan." },
      { status: 400 }
    );
  }

  const updated = await saveActionPlan(token, parsed.data);
  await trackAnalyticsEvent({
    sessionId: session.id,
    eventType: "action_plan_saved",
    stage: "ACTION_PLAN",
    metadata: { stage: "ACTION_PLAN", selectedActionCount: parsed.data.selectedActions.length }
  });
  return NextResponse.json({ ok: true, session: updated });
}
