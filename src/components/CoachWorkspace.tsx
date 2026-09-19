"use client";

import { CHALLENGE_TYPES, TCW_CONTACT_EMAIL } from "@/config/coachingFramework";
import type { BehaviouralContext, StoredCoachSession } from "@/lib/types";
import {
  CalendarCheck,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Upload
} from "lucide-react";
import { useMemo, useState } from "react";

type ClientSession = Omit<StoredCoachSession, "createdAt" | "updatedAt" | "pdfDeletedAt" | "completedAt"> & {
  createdAt: string;
  updatedAt: string;
  pdfDeletedAt: string | null;
  completedAt: string | null;
};

const blankProfile: BehaviouralContext = {
  source: "manual",
  confidence: "low",
  dominantEnergy: "",
  secondaryEnergy: "",
  consciousPersona: "",
  lessConsciousPersona: "",
  strengths: [],
  watchOuts: [],
  motivators: [],
  stressors: [],
  communicationNeeds: [],
  decisionStyle: "",
  leadershipImpact: "",
  blindSpots: [],
  extractionNotes: ["Manual entry started by the participant."],
  userCorrections: []
};

export function CoachWorkspace({ initialSession }: { initialSession: ClientSession }) {
  const [session, setSession] = useState(initialSession);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [challengeType, setChallengeType] = useState(session.challenge?.challengeType ?? "performance");

  const profile = useMemo(
    () => session.profileConfirmed ?? session.profileExtraction ?? blankProfile,
    [session.profileConfirmed, session.profileExtraction]
  );
  const selectedChallenge = CHALLENGE_TYPES.find((item) => item.id === challengeType) ?? CHALLENGE_TYPES[0];

  async function uploadPdf(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("upload");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/sessions/${session.publicToken}/upload`, {
      method: "POST",
      body: form
    });
    await handleSessionResponse(response, "Review the extracted preference summary, then correct anything that does not look right.");
    setBusy(null);
  }

  async function confirmProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("profile");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload: BehaviouralContext = {
      source: session.profileExtraction ? "mixed" : "manual",
      confidence: String(form.get("confidence") || "low") as BehaviouralContext["confidence"],
      dominantEnergy: String(form.get("dominantEnergy") || "") as BehaviouralContext["dominantEnergy"],
      secondaryEnergy: String(form.get("secondaryEnergy") || "") as BehaviouralContext["secondaryEnergy"],
      consciousPersona: String(form.get("consciousPersona") || ""),
      lessConsciousPersona: String(form.get("lessConsciousPersona") || ""),
      strengths: listValue(form, "strengths"),
      watchOuts: listValue(form, "watchOuts"),
      motivators: listValue(form, "motivators"),
      stressors: listValue(form, "stressors"),
      communicationNeeds: listValue(form, "communicationNeeds"),
      decisionStyle: String(form.get("decisionStyle") || ""),
      leadershipImpact: String(form.get("leadershipImpact") || ""),
      blindSpots: listValue(form, "blindSpots"),
      extractionNotes: profile.extractionNotes,
      userCorrections: listValue(form, "userCorrections")
    };
    const response = await fetch(`/api/sessions/${session.publicToken}/profile`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    await handleSessionResponse(response, "Preference context confirmed. Describe the situation you want to work on.");
    setBusy(null);
  }

  async function submitChallenge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("challenge");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const followUpAnswers: Record<string, string> = {
      factsKnown: String(form.get("factsKnown") || ""),
      previousAttempts: String(form.get("previousAttempts") || ""),
      constraints: String(form.get("constraints") || "")
    };
    selectedChallenge.prompts.forEach((prompt, index) => {
      followUpAnswers[`adaptive_${index + 1}`] = `${prompt}\n${String(form.get(`adaptive_${index}`) || "")}`;
    });

    const response = await fetch(`/api/sessions/${session.publicToken}/challenge`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        situation: form.get("situation"),
        desiredOutcome: form.get("desiredOutcome"),
        otherPersonContext: form.get("otherPersonContext"),
        stakes: form.get("stakes"),
        challengeType,
        followUpAnswers
      })
    });
    await handleSessionResponse(response, "Your coaching pathway is ready.");
    setBusy(null);
  }

  async function saveActionPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("actions");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/sessions/${session.publicToken}/action-plan`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        selectedActions: form.getAll("selectedActions").map(String),
        firstStep: form.get("firstStep"),
        supportNeeded: form.get("supportNeeded"),
        reviewDate: form.get("reviewDate"),
        notes: form.get("notes")
      })
    });
    await handleSessionResponse(response, "Action plan saved. Return after the conversation to reflect.");
    setBusy(null);
  }

  async function saveReflection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("reflection");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/sessions/${session.publicToken}/reflection`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        happened: form.get("happened"),
        worked: form.get("worked"),
        changeNextTime: form.get("changeNextTime"),
        supportNeeded: form.get("supportNeeded")
      })
    });
    await handleSessionResponse(response, "Reflection saved. Your coaching loop is complete.");
    setBusy(null);
  }

  async function handleSessionResponse(response: Response, success: string) {
    const body = (await response.json()) as { ok: boolean; session?: ClientSession; message?: string };
    if (!response.ok || !body.ok || !body.session) {
      setMessage(body.message || "Something went wrong. Please try again.");
      return;
    }
    setSession(body.session);
    setMessage(success);
  }

  return (
    <div className="coach-layout">
      <aside className="coach-sidebar">
        <p className="eyebrow">Private coaching URL</p>
        <h1>{session.participantName}</h1>
        <p>{session.roleTitle}, {session.organisation}</p>
        <ol className="step-list">
          <Step label="Upload & confirm profile" done={Boolean(session.profileConfirmed)} active={!session.profileConfirmed} />
          <Step label="Describe challenge" done={Boolean(session.coachingPlan)} active={Boolean(session.profileConfirmed && !session.coachingPlan)} />
          <Step label="Use coaching pathway" done={Boolean(session.actionPlan)} active={Boolean(session.coachingPlan && !session.actionPlan)} />
          <Step label="Reflect and follow up" done={session.status === "COMPLETE"} active={Boolean(session.actionPlan && session.status !== "COMPLETE")} />
        </ol>
        <div className="human-cta">
          <HelpCircle aria-hidden="true" />
          <strong>Human coaching support</strong>
          <p>For sensitive or high-stakes situations, rehearse the conversation with a TCW coach.</p>
          <a href={`mailto:${TCW_CONTACT_EMAIL}`}>{TCW_CONTACT_EMAIL}</a>
        </div>
      </aside>

      <main className="coach-main">
        {message ? <p className="notice" role="status" aria-live="polite">{message}</p> : null}

        <section className="workspace-section">
          <div className="section-heading">
            <FileText aria-hidden="true" />
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>Insights PDF Upload</h2>
              <p>The original PDF is parsed in memory, then discarded. Only the confirmed summary is saved.</p>
            </div>
          </div>
          <form className="upload-row" onSubmit={uploadPdf}>
            <input name="profilePdf" type="file" accept="application/pdf,.pdf" aria-label="Insights Discovery PDF" required />
            <button className="secondary-button" disabled={busy === "upload"} type="submit">
              {busy === "upload" ? <Loader2 className="spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
              Upload and extract
            </button>
          </form>
          {session.pdfDeletedAt ? (
            <p className="privacy-note"><ShieldCheck aria-hidden="true" /> PDF deleted after parsing: {new Date(session.pdfDeletedAt).toLocaleString("en-GB")}</p>
          ) : null}
        </section>

        <section className="workspace-section">
          <div className="section-heading">
            <CheckCircle2 aria-hidden="true" />
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Confirm Behavioural Preference Context</h2>
              <p>Correct the extraction before it is used in coaching. This is your working context, not a diagnosis.</p>
            </div>
          </div>
          <form className="profile-grid" onSubmit={confirmProfile}>
            <SelectEnergy name="dominantEnergy" label="Dominant colour energy" value={profile.dominantEnergy} />
            <SelectEnergy name="secondaryEnergy" label="Secondary colour energy" value={profile.secondaryEnergy} />
            <label>
              <span>Confidence</span>
              <select name="confidence" defaultValue={profile.confidence}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              <span>Conscious persona</span>
              <input name="consciousPersona" defaultValue={profile.consciousPersona} />
            </label>
            <label>
              <span>Less conscious persona</span>
              <input name="lessConsciousPersona" defaultValue={profile.lessConsciousPersona} />
            </label>
            <TextList name="strengths" label="Strengths" values={profile.strengths} />
            <TextList name="watchOuts" label="Watch-outs" values={profile.watchOuts} />
            <TextList name="motivators" label="Motivators" values={profile.motivators} />
            <TextList name="stressors" label="Stressors" values={profile.stressors} />
            <TextList name="communicationNeeds" label="Communication needs" values={profile.communicationNeeds} />
            <label>
              <span>Decision style</span>
              <textarea name="decisionStyle" rows={3} defaultValue={profile.decisionStyle} />
            </label>
            <label>
              <span>Leadership impact</span>
              <textarea name="leadershipImpact" rows={3} defaultValue={profile.leadershipImpact} />
            </label>
            <TextList name="blindSpots" label="Possible blind spots" values={profile.blindSpots} />
            <TextList name="userCorrections" label="Corrections or notes" values={profile.userCorrections} />
            <button className="primary-button span-full" disabled={busy === "profile"} type="submit">
              {busy === "profile" ? <Loader2 className="spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
              Confirm preference context
            </button>
          </form>
        </section>

        {session.profileConfirmed ? (
          <section className="workspace-section">
            <div className="section-heading">
              <MessageSquareText aria-hidden="true" />
              <div>
                <p className="eyebrow">Step 3</p>
                <h2>Manager Challenge Intake</h2>
                <p>Describe the real situation. The coaching output will separate facts, assumptions, person factors and process factors.</p>
              </div>
            </div>
            <form className="challenge-form" onSubmit={submitChallenge}>
              <label>
                <span>What is happening?</span>
                <textarea name="situation" rows={6} defaultValue={session.challenge?.situation} required minLength={20} />
              </label>
              <label>
                <span>What outcome do you want?</span>
                <textarea name="desiredOutcome" rows={3} defaultValue={session.challenge?.desiredOutcome} required />
              </label>
              <label>
                <span>Other person or stakeholder context</span>
                <textarea name="otherPersonContext" rows={3} defaultValue={session.challenge?.otherPersonContext} />
              </label>
              <label>
                <span>What is at stake?</span>
                <textarea name="stakes" rows={3} defaultValue={session.challenge?.stakes} />
              </label>
              <label>
                <span>Challenge type</span>
                <select value={challengeType} onChange={(event) => setChallengeType(event.target.value)}>
                  {CHALLENGE_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Known facts</span>
                <textarea name="factsKnown" rows={3} defaultValue={session.challenge?.followUpAnswers.factsKnown} />
              </label>
              <label>
                <span>Previous attempts</span>
                <textarea name="previousAttempts" rows={3} defaultValue={session.challenge?.followUpAnswers.previousAttempts} />
              </label>
              <label>
                <span>Constraints or process factors</span>
                <textarea name="constraints" rows={3} defaultValue={session.challenge?.followUpAnswers.constraints} />
              </label>
              {selectedChallenge.prompts.map((prompt, index) => (
                <label key={prompt}>
                  <span>{prompt}</span>
                  <textarea name={`adaptive_${index}`} rows={3} defaultValue={session.challenge?.followUpAnswers[`adaptive_${index + 1}`]?.split("\n").slice(1).join("\n")} />
                </label>
              ))}
              <button className="primary-button" disabled={busy === "challenge"} type="submit">
                {busy === "challenge" ? <Loader2 className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
                Generate coaching pathway
              </button>
            </form>
          </section>
        ) : null}

        {session.coachingPlan ? (
          <PlanSections session={session} saveActionPlan={saveActionPlan} busy={busy} />
        ) : null}

        {session.actionPlan ? (
          <section className="workspace-section">
            <div className="section-heading">
              <CalendarCheck aria-hidden="true" />
              <div>
                <p className="eyebrow">Step 5</p>
                <h2>Follow-up Reflection</h2>
                <p>Return to this private URL after the conversation and capture what changed.</p>
              </div>
            </div>
            <form className="challenge-form" onSubmit={saveReflection}>
              <label>
                <span>What happened?</span>
                <textarea name="happened" rows={4} defaultValue={session.reflection?.happened} required />
              </label>
              <label>
                <span>What worked?</span>
                <textarea name="worked" rows={3} defaultValue={session.reflection?.worked} />
              </label>
              <label>
                <span>What would you change next time?</span>
                <textarea name="changeNextTime" rows={3} defaultValue={session.reflection?.changeNextTime} />
              </label>
              <label>
                <span>What support is needed now?</span>
                <textarea name="supportNeeded" rows={3} defaultValue={session.reflection?.supportNeeded} />
              </label>
              <button className="primary-button" disabled={busy === "reflection"} type="submit">
                {busy === "reflection" ? <Loader2 className="spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
                Save reflection
              </button>
            </form>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function PlanSections({
  session,
  saveActionPlan,
  busy
}: {
  session: ClientSession;
  saveActionPlan: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  busy: string | null;
}) {
  const plan = session.coachingPlan;
  if (!plan) return null;

  return (
    <section className="workspace-section plan-section">
      <div className="section-heading">
        <Sparkles aria-hidden="true" />
        <div>
          <p className="eyebrow">Step 4</p>
          <h2>Coaching Pathway</h2>
          <p>{plan.summary}</p>
        </div>
        <a className="secondary-link" href={`/coach/${session.publicToken}/pdf`}>
          <Download aria-hidden="true" /> PDF
        </a>
      </div>

      <div className="plan-grid">
        <PlanBlock title="Facts" items={plan.facts} />
        <PlanBlock title="Assumptions to Test" items={plan.assumptions.map((item) => `${item.assumption} Reframe: ${item.reframe}`)} />
        <PlanBlock title="Preference Lens - Helping" items={plan.preferenceLens.helping} />
        <PlanBlock title="Preference Lens - Hindering" items={plan.preferenceLens.hindering} />
        <PlanBlock title="Other-person Hypotheses" items={plan.otherPersonHypotheses.map((item) => `${item.hypothesis} Look for: ${item.signalsToLookFor}`)} />
        <PlanBlock title="Person Factors" items={plan.personProcess.personFactors} />
        <PlanBlock title="Process Factors" items={plan.personProcess.processFactors} />
        <PlanBlock title="Conversation Questions" items={plan.conversationPlan.questions} />
      </div>

      <div className="conversation-planner">
        <h3>Conversation Planner</h3>
        <p><strong>Purpose:</strong> {plan.conversationPlan.purpose}</p>
        <p><strong>Opening:</strong> {plan.conversationPlan.opening}</p>
        <PlanBlock title="Key messages" items={plan.conversationPlan.keyMessages} />
        <PlanBlock title="Boundaries" items={plan.conversationPlan.boundaries} />
        <p><strong>Close:</strong> {plan.conversationPlan.close}</p>
      </div>

      <form className="action-form" onSubmit={saveActionPlan}>
        <h3>Action Plan</h3>
        <div className="action-options">
          {plan.recommendedActions.map((item) => (
            <label className="check-row" key={item.action}>
              <input
                name="selectedActions"
                type="checkbox"
                value={item.action}
                defaultChecked={session.actionPlan?.selectedActions.includes(item.action)}
              />
              <span>{item.action} <small>{item.timing} - {item.successMeasure}</small></span>
            </label>
          ))}
        </div>
        <label>
          <span>First step</span>
          <textarea name="firstStep" rows={3} defaultValue={session.actionPlan?.firstStep} required />
        </label>
        <label>
          <span>Support needed</span>
          <textarea name="supportNeeded" rows={3} defaultValue={session.actionPlan?.supportNeeded} />
        </label>
        <label>
          <span>Review date</span>
          <input name="reviewDate" type="date" defaultValue={session.actionPlan?.reviewDate} />
        </label>
        <label>
          <span>Notes</span>
          <textarea name="notes" rows={3} defaultValue={session.actionPlan?.notes} />
        </label>
        <button className="primary-button" disabled={busy === "actions"} type="submit">
          {busy === "actions" ? <Loader2 className="spin" aria-hidden="true" /> : <CalendarCheck aria-hidden="true" />}
          Save action plan
        </button>
      </form>
    </section>
  );
}

function Step({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <li className={done ? "done" : active ? "active" : ""}>
      <span>{done ? "✓" : "•"}</span>
      {label}
    </li>
  );
}

function SelectEnergy({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} defaultValue={value}>
        <option value="">Not confirmed</option>
        <option value="fieryRed">Fiery Red</option>
        <option value="sunshineYellow">Sunshine Yellow</option>
        <option value="earthGreen">Earth Green</option>
        <option value="coolBlue">Cool Blue</option>
      </select>
    </label>
  );
}

function TextList({ name, label, values }: { name: string; label: string; values: string[] }) {
  return (
    <label>
      <span>{label}</span>
      <textarea name={name} rows={4} defaultValue={values.join("\n")} />
    </label>
  );
}

function PlanBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="plan-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function listValue(form: FormData, name: string) {
  return String(form.get(name) || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
