import { renderSessionPdf } from "@/lib/pdfExport";
import { findSessionByToken } from "@/lib/repository";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const session = await findSessionByToken(token);
  if (!session || !session.coachingPlan) {
    return NextResponse.json({ ok: false, message: "Coaching plan not found." }, { status: 404 });
  }
  const pdf = await renderSessionPdf(session);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="tcw-manager-coach-${session.publicToken.slice(0, 8)}.pdf"`
    }
  });
}
