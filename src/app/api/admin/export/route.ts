import { requireAdminSession } from "@/lib/adminAuth";
import { sessionsToCsv } from "@/lib/csv";
import { listCoachSessions, type SessionFilters } from "@/lib/repository";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const url = new URL(request.url);
  const filters: SessionFilters = {
    query: url.searchParams.get("query") || undefined,
    stage: url.searchParams.get("stage") || "ALL",
    status: url.searchParams.get("status") || "ALL",
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined
  };
  const csv = sessionsToCsv(await listCoachSessions(filters));
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="tcw-manager-coach-sessions-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
