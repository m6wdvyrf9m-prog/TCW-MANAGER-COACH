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

  it("extracts Colour Dynamics scores when labels and values are on separate rows", () => {
    const profile = extractProfileFromText(`
      The Insights Discovery Colour Dynamics
      Cool Blue Earth Green Sunshine Yellow Fiery Red
      14 28 39 52
      Personal Profile Page 8
      © 2026 The Insights Group Ltd. All rights reserved.
      Possible Weaknesses
      Can move too quickly for quieter colleagues.
      May overlook detailed follow-through.
      What Motivates
      Visible progress and energetic collaboration.
      Barriers to Effective Communication
      Too much ambiguity without a clear decision point.
    `);

    expect(profile.dominantEnergy).toBe("fieryRed");
    expect(profile.secondaryEnergy).toBe("sunshineYellow");
    expect(profile.confidence).toBe("high");
    expect(profile.watchOuts).toContain("Can move too quickly for quieter colleagues.");
    expect(profile.motivators).toContain("Visible progress and energetic collaboration.");
    expect(profile.stressors).toContain("Too much ambiguity without a clear decision point.");
    expect(profile.watchOuts.join(" ")).not.toMatch(/Insights Group|Personal Profile Page/i);
  });
});
