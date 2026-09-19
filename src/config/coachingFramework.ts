import type { ColourEnergy } from "@/lib/types";

export const APP_NAME = "The Colour Works Manager Coach";
export const PRIVACY_VERSION = "2026-09-19";
export const TCW_CONTACT_EMAIL = "office@thecolourworks.com";
export const TCW_HUMAN_COACHING_CTA =
  "For complex, high-stakes or emotionally charged situations, speak with a The Colour Works coach to rehearse the conversation and pressure-test your plan.";

export const COLOUR_ENERGIES: Record<
  ColourEnergy,
  {
    label: string;
    shortLabel: string;
    strengths: string[];
    watchOuts: string[];
    motivators: string[];
    stressors: string[];
    communicationNeeds: string[];
    decisionStyle: string;
    leadershipImpact: string;
    blindSpots: string[];
    stretchQuestions: string[];
  }
> = {
  fieryRed: {
    label: "Fiery Red",
    shortLabel: "Action and direction",
    strengths: [
      "Gets to the point quickly",
      "Creates momentum when progress has stalled",
      "Makes expectations explicit",
      "Is willing to address difficult issues"
    ],
    watchOuts: [
      "May move to solution before hearing the whole story",
      "Can sound more certain than intended",
      "May underplay relationship repair",
      "Can interpret hesitation as lack of commitment"
    ],
    motivators: ["Clear outcomes", "Autonomy", "Progress", "Decisive action"],
    stressors: ["Ambiguity", "Slow decisions", "Avoided accountability", "Overlong discussion"],
    communicationNeeds: [
      "Lead with the outcome",
      "Be brief and specific",
      "Show the decision required",
      "Agree clear next steps"
    ],
    decisionStyle: "Direct, fast and outcome-led.",
    leadershipImpact: "Brings pace and clarity, especially when the team needs decisive movement.",
    blindSpots: ["Impact on quieter voices", "Signals of fear or overload", "Unspoken resistance"],
    stretchQuestions: [
      "What might I be simplifying too quickly?",
      "Who needs more time or context to commit?",
      "How can I be direct and still leave space?"
    ]
  },
  sunshineYellow: {
    label: "Sunshine Yellow",
    shortLabel: "Energy and involvement",
    strengths: [
      "Builds enthusiasm and optimism",
      "Finds possibilities quickly",
      "Encourages participation",
      "Keeps conversations human and engaging"
    ],
    watchOuts: [
      "May move past detail or risk too quickly",
      "Can rely on optimism where structure is needed",
      "May avoid dampening the mood with difficult facts",
      "Can overestimate shared understanding"
    ],
    motivators: ["Ideas", "Variety", "Recognition", "Collaboration"],
    stressors: ["Overly rigid process", "Isolation", "Negative tone", "Detail-heavy critique"],
    communicationNeeds: [
      "Keep the tone warm",
      "Invite ideas before narrowing",
      "Confirm commitments in writing",
      "Balance possibility with specifics"
    ],
    decisionStyle: "Inclusive, possibility-led and fast once people are energised.",
    leadershipImpact: "Raises energy and confidence, especially when morale or creativity is low.",
    blindSpots: ["Unfinished detail", "Quiet disagreement", "The emotional cost of disappointment"],
    stretchQuestions: [
      "What evidence do I need before I decide?",
      "What detail must be pinned down?",
      "Who may not feel heard yet?"
    ]
  },
  earthGreen: {
    label: "Earth Green",
    shortLabel: "Support and steadiness",
    strengths: [
      "Creates psychological safety",
      "Listens patiently",
      "Protects trust and inclusion",
      "Considers impact on people"
    ],
    watchOuts: [
      "May delay a necessary challenge",
      "Can soften the message until it becomes unclear",
      "May take too much responsibility for others' reactions",
      "Can tolerate poor process to preserve harmony"
    ],
    motivators: ["Trust", "Fairness", "Time to consider", "Meaningful support"],
    stressors: ["Abrupt change", "Conflict", "Being rushed", "Perceived unfairness"],
    communicationNeeds: [
      "Show genuine care",
      "Explain the reason for change",
      "Give time to process",
      "Separate the person from the issue"
    ],
    decisionStyle: "Considered, values-led and attentive to the effect on relationships.",
    leadershipImpact: "Builds trust and steadiness, especially through uncertainty or difficult feedback.",
    blindSpots: ["Avoided accountability", "Indirect messages", "Unclear consequences"],
    stretchQuestions: [
      "What truth needs saying kindly and clearly?",
      "Where am I rescuing rather than helping?",
      "What boundary would protect everyone?"
    ]
  },
  coolBlue: {
    label: "Cool Blue",
    shortLabel: "Clarity and analysis",
    strengths: [
      "Finds patterns in complex information",
      "Clarifies standards and process",
      "Thinks before acting",
      "Reduces ambiguity with evidence"
    ],
    watchOuts: [
      "May over-analyse before engaging people",
      "Can sound detached when care is needed",
      "May expect more detail than others can provide",
      "Can underplay urgency or emotion"
    ],
    motivators: ["Accuracy", "Preparation", "Clear criteria", "Time to think"],
    stressors: ["Vagueness", "Unsubstantiated claims", "Last-minute change", "Emotional pressure"],
    communicationNeeds: [
      "Share the data and criteria",
      "Allow preparation time",
      "Be precise about expectations",
      "Name feelings as useful information, not noise"
    ],
    decisionStyle: "Evidence-led, structured and cautious about unintended consequences.",
    leadershipImpact: "Creates confidence through rigour, standards and thoughtful diagnosis.",
    blindSpots: ["Relationship signals", "Need for pace", "When enough data is enough"],
    stretchQuestions: [
      "What can I decide with the information I have?",
      "What human signal matters as much as the data?",
      "How can I make the structure feel supportive?"
    ]
  }
};

export const CHALLENGE_TYPES = [
  {
    id: "performance",
    label: "Performance or accountability",
    prompts: [
      "What observable facts tell you performance is not where it needs to be?",
      "What support, clarity or resources may be missing?",
      "What standard or agreement needs to be made explicit?"
    ]
  },
  {
    id: "relationship",
    label: "Relationship or conflict",
    prompts: [
      "What has each person experienced or interpreted differently?",
      "What assumptions might be hardening into facts?",
      "What would a repaired working relationship make possible?"
    ]
  },
  {
    id: "change",
    label: "Change, uncertainty or resistance",
    prompts: [
      "What is changing, and what is genuinely still undecided?",
      "Who needs involvement, reassurance, data or direction?",
      "What is the smallest useful next commitment?"
    ]
  },
  {
    id: "delegation",
    label: "Delegation or ownership",
    prompts: [
      "What decision rights or boundaries are unclear?",
      "Where might you be holding on too tightly or stepping back too far?",
      "How will you review progress without taking the work back?"
    ]
  },
  {
    id: "team",
    label: "Team dynamics",
    prompts: [
      "What pattern is showing up across the team?",
      "What is a person issue and what is a process issue?",
      "Which team norm needs to be named or reset?"
    ]
  }
];

export const COACHING_GUARDRAILS = [
  "Keep advice practical, kind and direct.",
  "Separate observable facts from interpretations and assumptions.",
  "Use colour-energy language as a preference lens, not as a diagnosis.",
  "Never diagnose another person's Insights profile or personality.",
  "Encourage the manager to test hypotheses in conversation.",
  "Escalate to human support for high-risk, HR, safeguarding, legal or health issues."
];
