import PDFDocument from "pdfkit";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

async function main() {
  const created = await postJson("/api/sessions", {
    participantName: "Jordan Taylor",
    participantEmail: "jordan.verify@example.com",
    organisation: "Example Ltd",
    roleTitle: "Operations Manager",
    consentAccepted: true
  });
  assert(created.ok && created.url, "session created");
  const token = String(created.url).split("/").pop();
  assert(token, "token returned");

  const pdf = await syntheticPdf();
  const form = new FormData();
  form.append("profilePdf", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), "synthetic-insights-profile.pdf");
  const uploaded = await fetchJson(`/api/sessions/${token}/upload`, { method: "POST", body: form });
  assert(uploaded.ok && uploaded.session?.profileExtraction, "profile parsed");
  assert(Boolean(uploaded.session.pdfDeletedAt), "pdf deletion timestamp recorded");

  const profile = uploaded.session.profileExtraction;
  const confirmed = await fetchJson(`/api/sessions/${token}/profile`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...profile, confidence: "high", userCorrections: ["Verified locally"] })
  });
  assert(confirmed.ok && confirmed.session?.profileConfirmed, "profile confirmed");

  const coached = await postJson(`/api/sessions/${token}/challenge`, {
    situation: "A valued team member has missed two deadlines and I need a clear but supportive reset conversation.",
    desiredOutcome: "Agree a recovery plan, support and review rhythm.",
    otherPersonContext: "Direct report who is usually committed but currently overloaded.",
    stakes: "Client delivery and team confidence.",
    challengeType: "performance",
    followUpAnswers: {
      factsKnown: "Two missed deadlines in four weeks.",
      previousAttempts: "One informal check-in.",
      constraints: "Competing priorities."
    }
  });
  assert(coached.ok && coached.session?.coachingPlan, "coaching plan generated");

  const firstAction = coached.session.coachingPlan.recommendedActions[0].action;
  const actions = await fetchJson(`/api/sessions/${token}/action-plan`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      selectedActions: [firstAction],
      firstStep: "Write down the facts and agree a 30-minute conversation.",
      supportNeeded: "Diary space and a quiet room.",
      reviewDate: "2026-10-01",
      notes: "Keep the conversation specific and supportive."
    })
  });
  assert(actions.ok && actions.session?.actionPlan, "action plan saved");

  const reflection = await fetchJson(`/api/sessions/${token}/reflection`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      happened: "We agreed a shorter review cycle and removed one blocker.",
      worked: "Starting with facts reduced defensiveness.",
      changeNextTime: "Be clearer about the review measure.",
      supportNeeded: "A follow-up in one week."
    })
  });
  assert(reflection.ok && reflection.session?.status === "COMPLETE", "reflection saved");

  const pdfResponse = await fetch(`${baseUrl}/coach/${token}/pdf`);
  assert(pdfResponse.ok && pdfResponse.headers.get("content-type")?.includes("application/pdf"), "pdf export returned");

  const login = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "admin-password" })
  });
  assert(login.ok, "admin login returned ok");
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert(Boolean(cookie), "admin cookie returned");
  const exportResponse = await fetch(`${baseUrl}/api/admin/export`, { headers: { cookie: cookie ?? "" } });
  const csv = await exportResponse.text();
  assert(exportResponse.ok && csv.includes("Jordan Taylor"), "admin export includes verified session");
  assert(!csv.includes("missed two deadlines"), "admin export excludes sensitive challenge text");

  console.log("Local route verification passed.");
}

async function postJson(path: string, payload: unknown) {
  return fetchJson(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
}

async function fetchJson(path: string, init: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Verification failed: ${label}`);
}

async function syntheticPdf() {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
  doc.fontSize(16).text("Synthetic Insights Discovery Personal Profile");
  doc.moveDown();
  doc.text("Conscious Persona: Motivating Supporter");
  doc.text("Less Conscious Persona: Focused Helper");
  doc.text("Sunshine Yellow Sunshine Yellow Sunshine Yellow");
  doc.text("Earth Green Earth Green");
  doc.moveDown();
  doc.text("Strengths");
  doc.text("Builds energy in the team");
  doc.text("Invites people into the conversation");
  doc.moveDown();
  doc.text("Possible Blind Spots");
  doc.text("May skip detail when excited");
  doc.text("May assume agreement too quickly");
  doc.moveDown();
  doc.text("Communication");
  doc.text("Keep people involved");
  doc.text("Confirm commitments in writing");
  doc.end();
  return done;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
