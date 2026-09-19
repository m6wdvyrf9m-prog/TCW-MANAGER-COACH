export type ColourEnergy = "fieryRed" | "sunshineYellow" | "earthGreen" | "coolBlue";

export type ConfidenceLevel = "low" | "medium" | "high";

export type BehaviouralContext = {
  source: "pdf-extracted" | "manual" | "mixed";
  confidence: ConfidenceLevel;
  dominantEnergy: ColourEnergy | "";
  secondaryEnergy: ColourEnergy | "";
  consciousPersona: string;
  lessConsciousPersona: string;
  strengths: string[];
  watchOuts: string[];
  motivators: string[];
  stressors: string[];
  communicationNeeds: string[];
  decisionStyle: string;
  leadershipImpact: string;
  blindSpots: string[];
  extractionNotes: string[];
  userCorrections: string[];
};

export type ChallengeInput = {
  situation: string;
  desiredOutcome: string;
  otherPersonContext: string;
  stakes: string;
  challengeType: string;
  followUpAnswers: Record<string, string>;
};

export type CoachingPlan = {
  summary: string;
  facts: string[];
  assumptions: Array<{
    assumption: string;
    reframe: string;
    confidence: ConfidenceLevel;
  }>;
  preferenceLens: {
    helping: string[];
    hindering: string[];
    stretchPractices: string[];
  };
  otherPersonHypotheses: Array<{
    hypothesis: string;
    signalsToLookFor: string;
    managerResponse: string;
  }>;
  personProcess: {
    personFactors: string[];
    processFactors: string[];
    balanceNote: string;
  };
  options: Array<{
    title: string;
    whenToUse: string;
    steps: string[];
    risks: string[];
    preferenceWatchout: string;
  }>;
  conversationPlan: {
    purpose: string;
    opening: string;
    keyMessages: string[];
    questions: string[];
    boundaries: string[];
    close: string;
  };
  recommendedActions: Array<{
    action: string;
    owner: string;
    timing: string;
    successMeasure: string;
  }>;
  followUpQuestions: string[];
  humanCoachCta: string;
  generatedBy: "openai" | "rules-fallback";
  generatedAt: string;
};

export type ActionPlan = {
  selectedActions: string[];
  firstStep: string;
  supportNeeded: string;
  reviewDate: string;
  notes: string;
};

export type Reflection = {
  happened: string;
  worked: string;
  changeNextTime: string;
  supportNeeded: string;
  reflectedAt: string;
};

export type CoachStage =
  | "PROFILE_UPLOAD"
  | "PROFILE_CONFIRM"
  | "CHALLENGE"
  | "PLAN_READY"
  | "ACTION_PLAN"
  | "REFLECTION"
  | "COMPLETE";

export type StoredCoachSession = {
  id: string;
  publicToken: string;
  participantName: string;
  participantEmail: string;
  organisation: string;
  roleTitle: string;
  consentAccepted: boolean;
  privacyVersion: string;
  stage: CoachStage;
  status: "ACTIVE" | "COMPLETE" | "ARCHIVED";
  profileExtraction: BehaviouralContext | null;
  profileConfirmed: BehaviouralContext | null;
  challenge: ChallengeInput | null;
  coachingPlan: CoachingPlan | null;
  actionPlan: ActionPlan | null;
  reflection: Reflection | null;
  aiModel: string | null;
  aiStatus: string | null;
  pdfDeletedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AnalyticsEventInput = {
  sessionId?: string;
  eventType: string;
  stage?: string;
  metadata?: Record<string, string | number | boolean | null>;
};
