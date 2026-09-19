import { COLOUR_ENERGIES } from "@/config/coachingFramework";
import type { BehaviouralContext, ColourEnergy } from "@/lib/types";

export const COLOUR_LABELS: Record<ColourEnergy, string> = {
  fieryRed: "Fiery Red",
  sunshineYellow: "Sunshine Yellow",
  earthGreen: "Earth Green",
  coolBlue: "Cool Blue"
};

export function defaultBehaviouralContext(input: {
  dominantEnergy?: ColourEnergy | "";
  secondaryEnergy?: ColourEnergy | "";
  source?: BehaviouralContext["source"];
  confidence?: BehaviouralContext["confidence"];
  extractionNotes?: string[];
} = {}): BehaviouralContext {
  const dominant = input.dominantEnergy || "";
  const secondary = input.secondaryEnergy || "";
  const dominantConfig = dominant ? COLOUR_ENERGIES[dominant] : null;
  const secondaryConfig = secondary ? COLOUR_ENERGIES[secondary] : null;

  return {
    source: input.source ?? "manual",
    confidence: input.confidence ?? "low",
    dominantEnergy: dominant,
    secondaryEnergy: secondary,
    consciousPersona: "",
    lessConsciousPersona: "",
    strengths: unique([
      ...(dominantConfig?.strengths ?? []),
      ...(secondaryConfig?.strengths.slice(0, 2) ?? [])
    ]).slice(0, 6),
    watchOuts: unique([
      ...(dominantConfig?.watchOuts ?? []),
      ...(secondaryConfig?.watchOuts.slice(0, 2) ?? [])
    ]).slice(0, 6),
    motivators: unique([
      ...(dominantConfig?.motivators ?? []),
      ...(secondaryConfig?.motivators.slice(0, 2) ?? [])
    ]).slice(0, 5),
    stressors: unique([
      ...(dominantConfig?.stressors ?? []),
      ...(secondaryConfig?.stressors.slice(0, 2) ?? [])
    ]).slice(0, 5),
    communicationNeeds: unique([
      ...(dominantConfig?.communicationNeeds ?? []),
      ...(secondaryConfig?.communicationNeeds.slice(0, 2) ?? [])
    ]).slice(0, 6),
    decisionStyle: dominantConfig?.decisionStyle ?? "",
    leadershipImpact: dominantConfig?.leadershipImpact ?? "",
    blindSpots: dominantConfig?.blindSpots ?? [],
    extractionNotes: input.extractionNotes ?? [],
    userCorrections: []
  };
}

export function colourName(value: ColourEnergy | "") {
  return value ? COLOUR_LABELS[value] : "Not confirmed";
}

export function parseColourEnergy(value: string): ColourEnergy | "" {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("fiery") || normalized.includes("red")) return "fieryRed";
  if (normalized.includes("sunshine") || normalized.includes("yellow")) return "sunshineYellow";
  if (normalized.includes("earth") || normalized.includes("green")) return "earthGreen";
  if (normalized.includes("cool") || normalized.includes("blue")) return "coolBlue";
  return "";
}

export function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
