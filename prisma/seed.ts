import { PrismaClient } from "@prisma/client";
import { createPublicToken } from "../src/lib/tokens";
import { createLocalCoachingPlan } from "../src/lib/localCoach";
import { defaultBehaviouralContext } from "../src/lib/behavioural";

const prisma = new PrismaClient();

async function main() {
  const profile = defaultBehaviouralContext({
    dominantEnergy: "sunshineYellow",
    secondaryEnergy: "earthGreen"
  });
  const challenge = {
    situation: "I need to reset expectations with a team member who is missing deadlines but is trying hard.",
    desiredOutcome: "A fair, practical conversation that protects the relationship and improves delivery.",
    otherPersonContext: "Direct report in a busy operations team.",
    stakes: "Project timelines and team confidence.",
    followUpAnswers: {
      factsKnown: "Deadlines have slipped twice in the last month.",
      previousAttempts: "I have checked in informally but not agreed a recovery plan.",
      constraints: "The team member is overloaded and may need clearer prioritisation."
    },
    challengeType: "performance"
  };
  const plan = createLocalCoachingPlan({ profile, challenge });

  await prisma.coachSession.upsert({
    where: { publicToken: "demo-manager-coach-session" },
    update: {},
    create: {
      publicToken: "demo-manager-coach-session",
      participantName: "Jordan Taylor",
      participantEmail: "jordan@example.com",
      organisation: "Example Organisation",
      roleTitle: "Operations Manager",
      consentAccepted: true,
      privacyVersion: "2026-09-19",
      stage: "PLAN_READY",
      status: "ACTIVE",
      profileExtraction: profile,
      profileConfirmed: profile,
      challenge,
      coachingPlan: plan,
      aiModel: "local-seed",
      aiStatus: "SEEDED",
      pdfDeletedAt: new Date()
    }
  });

  await prisma.coachSession.create({
    data: {
      publicToken: createPublicToken(),
      participantName: "Sam Patel",
      participantEmail: "sam@example.com",
      organisation: "Example Organisation",
      roleTitle: "Team Lead",
      consentAccepted: true,
      privacyVersion: "2026-09-19",
      stage: "PROFILE_UPLOAD",
      status: "ACTIVE"
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
