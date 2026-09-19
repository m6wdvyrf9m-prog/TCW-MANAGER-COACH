import { sessionsToCsv } from "@/lib/csv";
import type { StoredCoachSession } from "@/lib/types";
import { describe, expect, it } from "vitest";

describe("admin export privacy", () => {
  it("excludes sensitive challenge and coaching payload text", () => {
    const session: StoredCoachSession = {
      id: "s1",
      publicToken: "secret-token",
      participantName: "Alex Manager",
      participantEmail: "alex@example.com",
      organisation: "Example Ltd",
      roleTitle: "Manager",
      consentAccepted: true,
      privacyVersion: "2026-09-19",
      stage: "PLAN_READY",
      status: "ACTIVE",
      profileExtraction: null,
      profileConfirmed: null,
      challenge: {
        situation: "Sensitive employee relations content",
        desiredOutcome: "Private desired outcome",
        otherPersonContext: "Private context",
        stakes: "Private stakes",
        challengeType: "relationship",
        followUpAnswers: { factsKnown: "Private facts" }
      },
      coachingPlan: null,
      actionPlan: null,
      reflection: null,
      aiModel: "test",
      aiStatus: "OPENAI_COMPLETED",
      pdfDeletedAt: new Date("2026-09-19T10:00:00Z"),
      completedAt: null,
      createdAt: new Date("2026-09-19T09:00:00Z"),
      updatedAt: new Date("2026-09-19T09:30:00Z")
    };

    const csv = sessionsToCsv([session]);
    expect(csv).toContain("relationship");
    expect(csv).not.toContain("Sensitive employee relations content");
    expect(csv).not.toContain("Private facts");
    expect(csv).not.toContain("secret-token");
  });
});
