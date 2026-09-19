import { parseColourEnergy } from "@/lib/behavioural";
import { z } from "zod";

const trimmedString = z.string().trim();
const requiredText = trimmedString.min(2);

export const startSessionSchema = z.object({
  participantName: requiredText.max(120),
  participantEmail: trimmedString.email().max(200).transform((value) => value.toLowerCase()),
  organisation: requiredText.max(160),
  roleTitle: requiredText.max(140),
  consentAccepted: z.boolean().refine((value) => value, "Please confirm the privacy notice before starting.")
});

export const behaviouralContextSchema = z.object({
  source: z.enum(["pdf-extracted", "manual", "mixed"]),
  confidence: z.enum(["low", "medium", "high"]),
  dominantEnergy: z.string().transform(parseColourEnergy),
  secondaryEnergy: z.string().transform(parseColourEnergy),
  consciousPersona: trimmedString.max(160),
  lessConsciousPersona: trimmedString.max(160),
  strengths: z.array(trimmedString.max(180)).max(12),
  watchOuts: z.array(trimmedString.max(180)).max(12),
  motivators: z.array(trimmedString.max(180)).max(10),
  stressors: z.array(trimmedString.max(180)).max(10),
  communicationNeeds: z.array(trimmedString.max(180)).max(12),
  decisionStyle: trimmedString.max(300),
  leadershipImpact: trimmedString.max(400),
  blindSpots: z.array(trimmedString.max(180)).max(12),
  extractionNotes: z.array(trimmedString.max(240)).max(12),
  userCorrections: z.array(trimmedString.max(240)).max(12)
});

export const challengeSchema = z.object({
  situation: requiredText.min(20).max(2500),
  desiredOutcome: requiredText.min(10).max(800),
  otherPersonContext: trimmedString.max(900),
  stakes: trimmedString.max(900),
  challengeType: z.enum(["performance", "relationship", "change", "delegation", "team"]),
  followUpAnswers: z.record(z.string(), trimmedString.max(1000)).default({})
});

export const actionPlanSchema = z.object({
  selectedActions: z.array(trimmedString.max(300)).max(8),
  firstStep: requiredText.max(800),
  supportNeeded: trimmedString.max(800),
  reviewDate: trimmedString.max(80),
  notes: trimmedString.max(1200)
});

export const reflectionSchema = z.object({
  happened: requiredText.max(1600),
  worked: trimmedString.max(1200),
  changeNextTime: trimmedString.max(1200),
  supportNeeded: trimmedString.max(1000)
});

export const adminLoginSchema = z.object({
  username: trimmedString.min(1),
  password: z.string().min(1)
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
