import { requireAdminSession } from "@/lib/adminAuth";
import { colourName } from "@/lib/behavioural";
import { getAnalyticsSummary, listCoachSessions, type SessionFilters } from "@/lib/repository";
import Link from "next/link";
import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminSession();
  if (!admin) redirect("/admin/login");

  const params = await searchParams;
  const filters: SessionFilters = {
    query: asString(params.query),
    stage: asString(params.stage) || "ALL",
    status: asString(params.status) || "ALL",
    from: asString(params.from),
    to: asString(params.to)
  };
  const [sessions, analytics] = await Promise.all([listCoachSessions(filters), getAnalyticsSummary()]);
  const exportQuery = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "ALL") exportQuery.set(key, String(value));
  });

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">The Colour Works</p>
          <h1>Manager Coach Admin</h1>
          <p>Privacy-conscious reporting for coaching sessions and journey progress.</p>
        </div>
        <nav>
          <Link href="/">New session</Link>
          <a href="/admin/logout">Sign out</a>
        </nav>
      </header>

      <section className="admin-stats" aria-label="Admin summary">
        <div>
          <span>Matching sessions</span>
          <strong>{sessions.length}</strong>
        </div>
        <div>
          <span>Plans generated</span>
          <strong>{sessions.filter((session) => Boolean(session.coachingPlan)).length}</strong>
        </div>
        <div>
          <span>Completed reflections</span>
          <strong>{sessions.filter((session) => session.status === "COMPLETE").length}</strong>
        </div>
        <div>
          <span>PDFs retained</span>
          <strong>{sessions.filter((session) => !session.pdfDeletedAt && session.profileExtraction).length}</strong>
        </div>
      </section>

      <form className="admin-filters">
        <label>
          <span>Search</span>
          <input name="query" defaultValue={filters.query} placeholder="Name, email, organisation or role" />
        </label>
        <label>
          <span>Stage</span>
          <select name="stage" defaultValue={filters.stage || "ALL"}>
            <option value="ALL">All</option>
            <option value="PROFILE_UPLOAD">Profile upload</option>
            <option value="PROFILE_CONFIRM">Profile confirm</option>
            <option value="CHALLENGE">Challenge</option>
            <option value="PLAN_READY">Plan ready</option>
            <option value="ACTION_PLAN">Action plan</option>
            <option value="COMPLETE">Complete</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select name="status" defaultValue={filters.status || "ALL"}>
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETE">Complete</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
        <label>
          <span>From</span>
          <input type="date" name="from" defaultValue={filters.from} />
        </label>
        <label>
          <span>To</span>
          <input type="date" name="to" defaultValue={filters.to} />
        </label>
        <button className="primary-button" type="submit">Filter</button>
        <a className="secondary-link" href={`/api/admin/export?${exportQuery.toString()}`}>Export CSV</a>
      </form>

      <section className="analytics-strip" aria-label="Analytics events">
        {analytics.events.slice(0, 6).map((event) => (
          <span key={event.name}>{event.name.replaceAll("_", " ")}: {event.count}</span>
        ))}
      </section>

      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Organisation</th>
              <th>Stage</th>
              <th>Preference</th>
              <th>Challenge</th>
              <th>AI</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>
                  <strong>{session.participantName}</strong>
                  <span>{session.participantEmail}</span>
                </td>
                <td>
                  <strong>{session.organisation}</strong>
                  <span>{session.roleTitle}</span>
                </td>
                <td><span className="status-pill">{labelStage(session.stage)}</span></td>
                <td>
                  {colourName(session.profileConfirmed?.dominantEnergy ?? session.profileExtraction?.dominantEnergy ?? "")}
                  <span>{session.profileConfirmed?.confidence ?? session.profileExtraction?.confidence ?? "not started"}</span>
                </td>
                <td>{session.challenge?.challengeType ?? "Not recorded"}</td>
                <td>{session.aiStatus ?? "Not run"}</td>
                <td>{session.createdAt.toLocaleDateString("en-GB")}</td>
                <td><a className="text-button" href={`/coach/${session.publicToken}`}>Open</a></td>
              </tr>
            ))}
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={8}>No sessions match these filters yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function labelStage(stage: string) {
  return stage.replaceAll("_", " ").toLowerCase();
}
