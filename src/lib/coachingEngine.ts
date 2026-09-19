import { COACHING_GUARDRAILS, TCW_HUMAN_COACHING_CTA } from "@/config/coachingFramework";
import { getOpenAIConfig } from "@/lib/env";
import { createLocalCoachingPlan } from "@/lib/localCoach";
import type { BehaviouralContext, ChallengeInput, CoachingPlan } from "@/lib/types";
import OpenAI from "openai";
import { z } from "zod";

const assumptionSchema = z.object({
  assumption: z.string(),
  reframe: z.string(),
  confidence: z.enum(["low", "medium", "high"])
});

const coachingPlanSchema = z.object({
  summary: z.string(),
  facts: z.array(z.string()),
  assumptions: z.array(assumptionSchema),
  preferenceLens: z.object({
    helping: z.array(z.string()),
    hindering: z.array(z.string()),
    stretchPractices: z.array(z.string())
  }),
  otherPersonHypotheses: z.array(
    z.object({
      hypothesis: z.string(),
      signalsToLookFor: z.string(),
      managerResponse: z.string()
    })
  ),
  personProcess: z.object({
    personFactors: z.array(z.string()),
    processFactors: z.array(z.string()),
    balanceNote: z.string()
  }),
  options: z.array(
    z.object({
      title: z.string(),
      whenToUse: z.string(),
      steps: z.array(z.string()),
      risks: z.array(z.string()),
      preferenceWatchout: z.string()
    })
  ),
  conversationPlan: z.object({
    purpose: z.string(),
    opening: z.string(),
    keyMessages: z.array(z.string()),
    questions: z.array(z.string()),
    boundaries: z.array(z.string()),
    close: z.string()
  }),
  recommendedActions: z.array(
    z.object({
      action: z.string(),
      owner: z.string(),
      timing: z.string(),
      successMeasure: z.string()
    })
  ),
  followUpQuestions: z.array(z.string()),
  humanCoachCta: z.string()
});

export async function generateCoachingPlan({
  profile,
  challenge
}: {
  profile: BehaviouralContext;
  challenge: ChallengeInput;
}): Promise<{ plan: CoachingPlan; model: string; status: string }> {
  const config = getOpenAIConfig();
  if (!config.apiKey || process.env.E2E_IN_MEMORY === "1") {
    return {
      plan: createLocalCoachingPlan({ profile, challenge }),
      model: "rules-fallback",
      status: config.apiKey ? "LOCAL_TEST_FALLBACK" : "OPENAI_NOT_CONFIGURED"
    };
  }

  try {
    const client = new OpenAI({ apiKey: config.apiKey });
    const response = await client.responses.create({
      model: config.model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You are The Colour Works Manager Coach, a leadership-development coaching assistant.",
                "Return only valid JSON matching the requested schema.",
                "Use Insights/colour language as a preference lens only, never as diagnosis.",
                "Do not infer another person's profile. Offer hypotheses to test.",
                "Keep guidance practical, warm, commercial and manager-ready.",
                ...COACHING_GUARDRAILS
              ].join("\n")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Create a structured coaching pathway for this manager.",
                behaviouralContext: profile,
                challenge,
                requiredSections: [
                  "facts",
                  "assumptions",
                  "preferenceLens",
                  "otherPersonHypotheses",
                  "personProcess",
                  "options",
                  "conversationPlan",
                  "recommendedActions",
                  "followUpQuestions"
                ]
              })
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "tcw_manager_coaching_plan",
          strict: true,
          schema: coachingPlanJsonSchema()
        }
      }
    });

    const parsed = coachingPlanSchema.parse(JSON.parse(response.output_text));
    return {
      plan: {
        ...parsed,
        humanCoachCta: parsed.humanCoachCta || TCW_HUMAN_COACHING_CTA,
        generatedBy: "openai",
        generatedAt: new Date().toISOString()
      },
      model: config.model,
      status: "OPENAI_COMPLETED"
    };
  } catch (error) {
    console.error("OpenAI coaching generation failed", error);
    return {
      plan: createLocalCoachingPlan({ profile, challenge }),
      model: config.model,
      status: "OPENAI_FAILED_RULES_FALLBACK"
    };
  }
}

function coachingPlanJsonSchema() {
  const stringArray = { type: "array", items: { type: "string" } };
  const required = [
    "summary",
    "facts",
    "assumptions",
    "preferenceLens",
    "otherPersonHypotheses",
    "personProcess",
    "options",
    "conversationPlan",
    "recommendedActions",
    "followUpQuestions",
    "humanCoachCta"
  ];

  return {
    type: "object",
    additionalProperties: false,
    required,
    properties: {
      summary: { type: "string" },
      facts: stringArray,
      assumptions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["assumption", "reframe", "confidence"],
          properties: {
            assumption: { type: "string" },
            reframe: { type: "string" },
            confidence: { type: "string", enum: ["low", "medium", "high"] }
          }
        }
      },
      preferenceLens: {
        type: "object",
        additionalProperties: false,
        required: ["helping", "hindering", "stretchPractices"],
        properties: {
          helping: stringArray,
          hindering: stringArray,
          stretchPractices: stringArray
        }
      },
      otherPersonHypotheses: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["hypothesis", "signalsToLookFor", "managerResponse"],
          properties: {
            hypothesis: { type: "string" },
            signalsToLookFor: { type: "string" },
            managerResponse: { type: "string" }
          }
        }
      },
      personProcess: {
        type: "object",
        additionalProperties: false,
        required: ["personFactors", "processFactors", "balanceNote"],
        properties: {
          personFactors: stringArray,
          processFactors: stringArray,
          balanceNote: { type: "string" }
        }
      },
      options: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "whenToUse", "steps", "risks", "preferenceWatchout"],
          properties: {
            title: { type: "string" },
            whenToUse: { type: "string" },
            steps: stringArray,
            risks: stringArray,
            preferenceWatchout: { type: "string" }
          }
        }
      },
      conversationPlan: {
        type: "object",
        additionalProperties: false,
        required: ["purpose", "opening", "keyMessages", "questions", "boundaries", "close"],
        properties: {
          purpose: { type: "string" },
          opening: { type: "string" },
          keyMessages: stringArray,
          questions: stringArray,
          boundaries: stringArray,
          close: { type: "string" }
        }
      },
      recommendedActions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["action", "owner", "timing", "successMeasure"],
          properties: {
            action: { type: "string" },
            owner: { type: "string" },
            timing: { type: "string" },
            successMeasure: { type: "string" }
          }
        }
      },
      followUpQuestions: stringArray,
      humanCoachCta: { type: "string" }
    }
  };
}
