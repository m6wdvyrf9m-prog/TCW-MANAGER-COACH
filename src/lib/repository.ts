import { PRIVACY_VERSION } from "@/config/coachingFramework";
import { shouldUseFileStore } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { createPublicToken } from "@/lib/tokens";
import type {
  ActionPlan,
  AnalyticsEventInput,
  BehaviouralContext,
  ChallengeInput,
  CoachStage,
  CoachingPlan,
  Reflection,
  StoredCoachSession
} from "@/lib/types";
import type { StartSessionInput } from "@/lib/validation";
import fs from "node:fs/promises";
import path from "node:path";

export type SessionFilters = {
  query?: string;
  stage?: string;
  status?: string;
  from?: string;
  to?: string;
};

export async function createCoachSession(input: StartSessionInput) {
  const data = {
    publicToken: createPublicToken(),
    participantName: input.participantName,
    participantEmail: input.participantEmail,
    organisation: input.organisation,
    roleTitle: input.roleTitle,
    consentAccepted: input.consentAccepted,
    privacyVersion: PRIVACY_VERSION,
    stage: "PROFILE_UPLOAD" as CoachStage,
    status: "ACTIVE" as const
  };

  const prisma = getPrisma();
  if (prisma) {
    const session = await prisma.coachSession.create({ data });
    return fromPrisma(session);
  }

  const store = await readFileStore();
  const now = new Date();
  const session: StoredCoachSession = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    ...data,
    profileExtraction: null,
    profileConfirmed: null,
    challenge: null,
    coachingPlan: null,
    actionPlan: null,
    reflection: null,
    aiModel: null,
    aiStatus: null,
    pdfDeletedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now
  };
  store.sessions.push(session);
  await writeFileStore(store);
  return session;
}

export async function findSessionByToken(publicToken: string) {
  const prisma = getPrisma();
  if (prisma) {
    const session = await prisma.coachSession.findUnique({ where: { publicToken } });
    return session ? fromPrisma(session) : null;
  }

  const store = await readFileStore();
  return store.sessions.find((session) => session.publicToken === publicToken) ?? null;
}

export async function updateProfileExtraction(publicToken: string, profileExtraction: BehaviouralContext) {
  return updateSession(publicToken, {
    profileExtraction,
    pdfDeletedAt: new Date(),
    stage: "PROFILE_CONFIRM"
  });
}

export async function confirmProfile(publicToken: string, profileConfirmed: BehaviouralContext) {
  return updateSession(publicToken, {
    profileConfirmed: {
      ...profileConfirmed,
      source: profileConfirmed.source === "pdf-extracted" ? "mixed" : profileConfirmed.source
    },
    stage: "CHALLENGE"
  });
}

export async function saveChallenge(publicToken: string, challenge: ChallengeInput) {
  return updateSession(publicToken, { challenge, stage: "CHALLENGE" });
}

export async function saveCoachingPlan(publicToken: string, coachingPlan: CoachingPlan, aiModel: string, aiStatus: string) {
  return updateSession(publicToken, {
    coachingPlan,
    aiModel,
    aiStatus,
    stage: "PLAN_READY"
  });
}

export async function saveActionPlan(publicToken: string, actionPlan: ActionPlan) {
  return updateSession(publicToken, {
    actionPlan,
    stage: "ACTION_PLAN"
  });
}

export async function saveReflection(publicToken: string, reflection: Reflection) {
  return updateSession(publicToken, {
    reflection,
    stage: "COMPLETE",
    status: "COMPLETE",
    completedAt: new Date()
  });
}

export async function listCoachSessions(filters: SessionFilters = {}) {
  const prisma = getPrisma();
  if (prisma) {
    const query = filters.query?.trim();
    const createdAt =
      filters.from || filters.to
        ? {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: endOfDay(filters.to) } : {})
          }
        : undefined;

    const rows = await prisma.coachSession.findMany({
      where: {
        ...(filters.stage && filters.stage !== "ALL" ? { stage: filters.stage } : {}),
        ...(filters.status && filters.status !== "ALL" ? { status: filters.status } : {}),
        ...(createdAt ? { createdAt } : {}),
        ...(query
          ? {
              OR: [
                { participantName: { contains: query, mode: "insensitive" } },
                { participantEmail: { contains: query, mode: "insensitive" } },
                { organisation: { contains: query, mode: "insensitive" } },
                { roleTitle: { contains: query, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      take: 500
    });
    return rows.map(fromPrisma);
  }

  const store = await readFileStore();
  return store.sessions
    .filter((session) => matchesFilters(session, filters))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 500);
}

export async function trackAnalyticsEvent(input: AnalyticsEventInput) {
  const safeMetadata = sanitizeMetadata(input.metadata ?? {});
  const prisma = getPrisma();
  if (prisma) {
    await prisma.analyticsEvent.create({
      data: {
        sessionId: input.sessionId,
        eventType: input.eventType,
        stage: input.stage,
        metadata: safeMetadata
      }
    });
    return;
  }

  const store = await readFileStore();
  store.analyticsEvents.push({
    id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    sessionId: input.sessionId ?? null,
    eventType: input.eventType,
    stage: input.stage ?? null,
    metadata: safeMetadata,
    createdAt: new Date()
  });
  await writeFileStore(store);
}

export async function getAnalyticsSummary() {
  const prisma = getPrisma();
  if (prisma) {
    const [events, sessions] = await Promise.all([
      prisma.analyticsEvent.groupBy({ by: ["eventType"], _count: { eventType: true } }),
      prisma.coachSession.groupBy({ by: ["stage"], _count: { stage: true } })
    ]);
    return {
      events: events.map((event) => ({ name: event.eventType, count: event._count.eventType })),
      stages: sessions.map((stage) => ({ name: stage.stage, count: stage._count.stage }))
    };
  }

  const store = await readFileStore();
  return {
    events: countBy(store.analyticsEvents.map((event) => event.eventType)),
    stages: countBy(store.sessions.map((session) => session.stage))
  };
}

async function updateSession(
  publicToken: string,
  data: Partial<StoredCoachSession>
): Promise<StoredCoachSession | null> {
  const prisma = getPrisma();
  if (prisma) {
    const session = await prisma.coachSession.update({
      where: { publicToken },
      data: toPrismaUpdate(data)
    });
    return fromPrisma(session);
  }

  const store = await readFileStore();
  const index = store.sessions.findIndex((session) => session.publicToken === publicToken);
  if (index === -1) return null;
  store.sessions[index] = {
    ...store.sessions[index],
    ...data,
    updatedAt: new Date()
  };
  await writeFileStore(store);
  return store.sessions[index];
}

function toPrismaUpdate(data: Partial<StoredCoachSession>) {
  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "id" || key === "publicToken" || key === "createdAt" || key === "updatedAt") continue;
    update[key] = value;
  }
  return update;
}

function matchesFilters(session: StoredCoachSession, filters: SessionFilters) {
  if (filters.stage && filters.stage !== "ALL" && session.stage !== filters.stage) return false;
  if (filters.status && filters.status !== "ALL" && session.status !== filters.status) return false;
  if (filters.from && session.createdAt < new Date(filters.from)) return false;
  if (filters.to && session.createdAt > endOfDay(filters.to)) return false;

  const query = filters.query?.trim().toLowerCase();
  if (!query) return true;
  return [session.participantName, session.participantEmail, session.organisation, session.roleTitle]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function endOfDay(value: string) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function fromPrisma(session: {
  id: string;
  publicToken: string;
  participantName: string;
  participantEmail: string;
  organisation: string;
  roleTitle: string;
  consentAccepted: boolean;
  privacyVersion: string;
  stage: string;
  status: string;
  profileExtraction: unknown;
  profileConfirmed: unknown;
  challenge: unknown;
  coachingPlan: unknown;
  actionPlan: unknown;
  reflection: unknown;
  aiModel: string | null;
  aiStatus: string | null;
  pdfDeletedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): StoredCoachSession {
  return {
    ...session,
    stage: session.stage as CoachStage,
    status: session.status as StoredCoachSession["status"],
    profileExtraction: (session.profileExtraction as BehaviouralContext | null) ?? null,
    profileConfirmed: (session.profileConfirmed as BehaviouralContext | null) ?? null,
    challenge: (session.challenge as ChallengeInput | null) ?? null,
    coachingPlan: (session.coachingPlan as CoachingPlan | null) ?? null,
    actionPlan: (session.actionPlan as ActionPlan | null) ?? null,
    reflection: (session.reflection as Reflection | null) ?? null
  };
}

function sanitizeMetadata(metadata: Record<string, string | number | boolean | null>) {
  const allowed: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (!["stage", "challengeType", "hasOpenAI", "profileConfidence", "selectedActionCount", "fileSizeBucket"].includes(key)) {
      continue;
    }
    allowed[key] = value;
  }
  return allowed;
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

type FileStore = {
  sessions: StoredCoachSession[];
  analyticsEvents: Array<{
    id: string;
    sessionId: string | null;
    eventType: string;
    stage: string | null;
    metadata: Record<string, string | number | boolean | null>;
    createdAt: Date;
  }>;
};

async function readFileStore(): Promise<FileStore> {
  const filePath = getStorePath();
  try {
    const raw = await fs.readFile(/*turbopackIgnore: true*/ filePath, "utf8");
    const parsed = JSON.parse(raw) as {
      sessions: Array<Omit<StoredCoachSession, "createdAt" | "updatedAt" | "pdfDeletedAt" | "completedAt"> & {
        createdAt: string;
        updatedAt: string;
        pdfDeletedAt: string | null;
        completedAt: string | null;
      }>;
      analyticsEvents: Array<{
        id: string;
        sessionId: string | null;
        eventType: string;
        stage: string | null;
        metadata: Record<string, string | number | boolean | null>;
        createdAt: string;
      }>;
    };
    return {
      sessions: parsed.sessions.map((session) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        pdfDeletedAt: session.pdfDeletedAt ? new Date(session.pdfDeletedAt) : null,
        completedAt: session.completedAt ? new Date(session.completedAt) : null
      })),
      analyticsEvents: parsed.analyticsEvents.map((event) => ({
        ...event,
        createdAt: new Date(event.createdAt)
      }))
    };
  } catch {
    return { sessions: [], analyticsEvents: [] };
  }
}

async function writeFileStore(store: FileStore) {
  const filePath = getStorePath();
  await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(filePath), { recursive: true });
  await fs.writeFile(/*turbopackIgnore: true*/ filePath, JSON.stringify(store, null, 2));
}

function getStorePath() {
  if (shouldUseFileStore()) {
    return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.TCW_FILE_STORE_PATH || ".data/coach-sessions.json");
  }
  return path.resolve(process.cwd(), ".data/coach-sessions.json");
}
