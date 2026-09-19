import { getPdfMaxUploadBytes } from "@/lib/env";
import { parseInsightsPdf } from "@/lib/pdfParser";
import { findSessionByToken, trackAnalyticsEvent, updateProfileExtraction } from "@/lib/repository";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const session = await findSessionByToken(token);
  if (!session) return NextResponse.json({ ok: false, message: "Session not found." }, { status: 404 });

  const form = await request.formData();
  const file = form.get("profilePdf");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Choose an Insights PDF to upload." }, { status: 400 });
  }

  if (file.size > getPdfMaxUploadBytes()) {
    return NextResponse.json({ ok: false, message: "The PDF is larger than the configured upload limit." }, { status: 413 });
  }

  const nameIsPdf = file.name.toLowerCase().endsWith(".pdf");
  const typeIsPdf = file.type === "application/pdf" || file.type === "";
  if (!nameIsPdf || !typeIsPdf) {
    return NextResponse.json({ ok: false, message: "Only PDF files are accepted." }, { status: 415 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const profile = await parseInsightsPdf(buffer);
    const updated = await updateProfileExtraction(token, profile);
    await trackAnalyticsEvent({
      sessionId: session.id,
      eventType: "profile_pdf_parsed",
      stage: "PROFILE_CONFIRM",
      metadata: {
        stage: "PROFILE_CONFIRM",
        profileConfidence: profile.confidence,
        fileSizeBucket: file.size < 1_000_000 ? "under_1mb" : file.size < 5_000_000 ? "under_5mb" : "over_5mb"
      }
    });
    return NextResponse.json({ ok: true, session: updated });
  } catch (error) {
    console.error("PDF parsing failed", error);
    await trackAnalyticsEvent({
      sessionId: session.id,
      eventType: "profile_pdf_parse_failed",
      stage: session.stage,
      metadata: { stage: session.stage }
    });
    return NextResponse.json(
      { ok: false, message: "The PDF could not be parsed. You can still enter the preference summary manually." },
      { status: 422 }
    );
  }
}
