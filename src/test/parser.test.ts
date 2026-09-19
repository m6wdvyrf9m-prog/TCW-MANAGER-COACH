import { extractProfileFromText } from "@/lib/pdfParser";
import { describe, expect, it } from "vitest";

describe("Insights profile extraction", () => {
  it("extracts colour signals and behavioural sections from synthetic text", () => {
    const profile = extractProfileFromText(`
      Insights Discovery Personal Profile
      Conscious Persona: Motivating Supporter
      Less Conscious Persona: Focused Helper
      The Insights Discovery Colour Dynamics
      Cool Blue 22
      Earth Green 31
      Sunshine Yellow 44
      Fiery Red 28
      Sunshine Yellow energy appears throughout this synthetic training document.
      Sunshine Yellow helps the manager include others and create optimism.
      Earth Green appears as a secondary preference.
      Strengths
      Builds energy in the team
      Invites people into the conversation
      Value to the Team
      Keeps morale visible
      Possible Blind Spots
      May skip detail when excited
      May assume agreement too quickly
      Communication
      Keep people involved
      Confirm commitments in writing
      Motivators
      Recognition and variety
      Stress
      Rigid process without room for discussion
      © 2026 The Insights Group Ltd. All rights reserved.
      www.insights.com
    `);

    expect(profile.dominantEnergy).toBe("sunshineYellow");
    expect(profile.secondaryEnergy).toBe("earthGreen");
    expect(profile.consciousPersona).toContain("Motivating Supporter");
    expect(profile.strengths).toContain("Builds energy in the team");
    expect(profile.watchOuts).toContain("May skip detail when excited");
    expect(profile.communicationNeeds).toContain("Keep people involved");
    expect(profile.strengths.join(" ")).not.toMatch(/Insights Group|www\.insights/i);
    expect(profile.extractionNotes.join(" ")).toContain("Colour Dynamics scores");
    expect(profile.extractionNotes.join(" ")).toContain("not stored");
  });
});
