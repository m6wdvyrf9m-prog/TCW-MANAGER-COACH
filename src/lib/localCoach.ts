import { CHALLENGE_TYPES, COLOUR_ENERGIES, TCW_HUMAN_COACHING_CTA } from "@/config/coachingFramework";
import { colourName } from "@/lib/behavioural";
import type { BehaviouralContext, ChallengeInput, CoachingPlan, ColourEnergy } from "@/lib/types";

export function createLocalCoachingPlan({
  profile,
  challenge
}: {
  profile: BehaviouralContext;
  challenge: ChallengeInput;
}): CoachingPlan {
  const dominant = profile.dominantEnergy || "coolBlue";
  const energy = COLOUR_ENERGIES[dominant as ColourEnergy];
  const challengeConfig = CHALLENGE_TYPES.find((item) => item.id === challenge.challengeType);
  const facts = extractFacts(challenge);

  return {
    summary:
      "Treat this as a focused preparation space: clarify what is known, check the preference pattern you may be bringing, then plan a conversation that is specific, humane and action-oriented.",
    facts,
    assumptions: [
      {
        assumption: "The other person understands the impact in the same way you do.",
        reframe: "Test their view first, then share the impact using observable examples.",
        confidence: "medium"
      },
      {
        assumption: "Preference or style is the main cause.",
        reframe: "Consider capability, workload, clarity, incentives and process before making it personal.",
        confidence: "low"
      },
      {
        assumption: "One conversation will solve the whole issue.",
        reframe: "Aim for a clear next agreement, then review what changes.",
        confidence: "medium"
      }
    ],
    preferenceLens: {
      helping: [
        `${colourName(profile.dominantEnergy)} may help you through ${energy.shortLabel.toLowerCase()}.`,
        ...profile.strengths.slice(0, 3)
      ],
      hindering: profile.watchOuts.slice(0, 4),
      stretchPractices: energy.stretchQuestions
    },
    otherPersonHypotheses: [
      {
        hypothesis: "They may need more clarity, reassurance, autonomy or evidence than you naturally provide.",
        signalsToLookFor: "Listen for hesitation, repeated questions, defensiveness, over-agreement or silence.",
        managerResponse: "Ask what would help them commit rather than assuming resistance."
      },
      {
        hypothesis: "Their behaviour may be shaped by the system around them, not only by preference.",
        signalsToLookFor: "Look for conflicting priorities, missing information, unclear ownership or incentives.",
        managerResponse: "Name the process factor and agree what will change."
      }
    ],
    personProcess: {
      personFactors: [
        "Motivation, confidence, capability and preferred communication style.",
        "How safe the person feels to be honest with you.",
        "Their understanding of expectations and impact."
      ],
      processFactors: [
        "Clarity of roles, deadlines and decision rights.",
        "Workload, dependencies and competing priorities.",
        "How follow-up and accountability are currently handled."
      ],
      balanceNote:
        "Start with the process conditions you can see, then explore the personal experience respectfully. Avoid turning a process gap into a character judgement."
    },
    options: [
      {
        title: "Reset expectations",
        whenToUse: "Use when standards, timelines or ownership are unclear.",
        steps: [
          "State the shared purpose.",
          "Name two or three observable facts.",
          "Ask for their view.",
          "Agree the new standard, support and review point."
        ],
        risks: ["Can feel abrupt if you skip empathy.", "Can become too vague if consequences are avoided."],
        preferenceWatchout: "Match your pace and level of detail to the other person's needs."
      },
      {
        title: "Explore before deciding",
        whenToUse: "Use when you may not yet understand the person/process mix.",
        steps: [
          "Ask what is making the situation harder.",
          "Separate facts, interpretations and feelings.",
          "Map blockers into capability, capacity, clarity and commitment.",
          "Choose one practical experiment."
        ],
        risks: ["Can drift without a clear close.", "Can sound like permission to avoid the issue."],
        preferenceWatchout: "Hold both curiosity and accountability."
      },
      {
        title: "Contract the next two weeks",
        whenToUse: "Use when you need movement but the full answer is uncertain.",
        steps: [
          "Agree the next outcome.",
          "Define support and decision rights.",
          "Set a short review date.",
          "Capture what success will look like."
        ],
        risks: ["Can become a task list without learning.", "Can overload someone already stretched."],
        preferenceWatchout: "Make the review supportive, not just evaluative."
      }
    ],
    conversationPlan: {
      purpose: challenge.desiredOutcome || "Create a clear, respectful agreement for what happens next.",
      opening:
        "I want us to talk this through so we are clear on what is happening, what support is needed and what we will both commit to next.",
      keyMessages: [
        "Here are the observable facts I am working from.",
        "I want to understand your perspective before we decide the next step.",
        "We need an agreement that protects both the relationship and the work."
      ],
      questions: [
        "What is your read of the situation?",
        "What is making this harder than it needs to be?",
        "What do you need from me, and what can you commit to?",
        "How should we review progress?"
      ],
      boundaries: [
        "Keep the conversation about behaviour, impact and agreements.",
        "Do not infer the other person's colour energy or personality.",
        "Escalate to HR or specialist support if policy, wellbeing or legal risk appears."
      ],
      close: "Let's write down the agreement, support, owner and review date so we both leave with the same understanding."
    },
    recommendedActions: [
      {
        action: "Write the facts/assumptions list before the conversation.",
        owner: "Manager",
        timing: "Before the meeting",
        successMeasure: "You can name facts without adding interpretation."
      },
      {
        action: "Hold the conversation and agree one short review cycle.",
        owner: "Manager and other person",
        timing: "Within 7 days",
        successMeasure: "There is a clear agreement and review date."
      },
      {
        action: "Reflect on how your preference helped and hindered.",
        owner: "Manager",
        timing: "After the conversation",
        successMeasure: "You can identify one behaviour to repeat and one to adjust."
      }
    ],
    followUpQuestions: challengeConfig?.prompts ?? CHALLENGE_TYPES[0].prompts,
    humanCoachCta: TCW_HUMAN_COACHING_CTA,
    generatedBy: "rules-fallback",
    generatedAt: new Date().toISOString()
  };
}

function extractFacts(challenge: ChallengeInput) {
  const facts = [
    challenge.stakes ? `Stakes: ${challenge.stakes}` : "",
    challenge.desiredOutcome ? `Desired outcome: ${challenge.desiredOutcome}` : "",
    challenge.followUpAnswers.factsKnown ? `Known facts: ${challenge.followUpAnswers.factsKnown}` : "",
    challenge.followUpAnswers.previousAttempts ? `Previous attempts: ${challenge.followUpAnswers.previousAttempts}` : "",
    challenge.followUpAnswers.constraints ? `Constraints: ${challenge.followUpAnswers.constraints}` : ""
  ].filter(Boolean);

  return facts.length ? facts : ["The manager has described a current leadership challenge that needs preparation."];
}
