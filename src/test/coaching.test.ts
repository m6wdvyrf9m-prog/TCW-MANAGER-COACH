import { defaultBehaviouralContext } from "@/lib/behavioural";
import { createLocalCoachingPlan } from "@/lib/localCoach";
import { describe, expect, it } from "vitest";

describe("local coaching plan", () => {
  it("returns the required TCW coaching sections without diagnosing the other person", () => {
    const plan = createLocalCoachingPlan({
      profile: defaultBehaviouralContext({ dominantEnergy: "coolBlue", secondaryEnergy: "earthGreen" }),
      challenge: {
        situation: "A team member is missing deadlines and I need to have a clear but supportive conversation.",
        desiredOutcome: "Agree realistic expectations and a review rhythm.",
        otherPersonContext: "Direct report",
        stakes: "Delivery confidence",
        challengeType: "performance",
        followUpAnswers: {
          factsKnown: "Two missed deadlines in four weeks.",
          previousAttempts: "Informal check-in.",
          constraints: "Competing priorities."
        }
      }
    });

    expect(plan.facts.length).toBeGreaterThan(0);
    expect(plan.assumptions.length).toBeGreaterThan(0);
    expect(plan.preferenceLens.helping.join(" ")).toContain("Cool Blue");
    expect(plan.otherPersonHypotheses[0].hypothesis).toMatch(/may need/i);
    expect(JSON.stringify(plan).toLowerCase()).not.toContain("the other person is");
    expect(plan.conversationPlan.questions.length).toBeGreaterThan(2);
    expect(plan.generatedBy).toBe("rules-fallback");
  });
});
