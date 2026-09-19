CREATE TABLE "CoachSession" (
    "id" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "participantEmail" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "consentAccepted" BOOLEAN NOT NULL,
    "privacyVersion" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'PROFILE_UPLOAD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "profileExtraction" JSONB,
    "profileConfirmed" JSONB,
    "challenge" JSONB,
    "coachingPlan" JSONB,
    "actionPlan" JSONB,
    "reflection" JSONB,
    "aiModel" TEXT,
    "aiStatus" TEXT,
    "pdfDeletedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CoachSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "stage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CoachSession_publicToken_key" ON "CoachSession"("publicToken");
CREATE INDEX "CoachSession_createdAt_idx" ON "CoachSession"("createdAt");
CREATE INDEX "CoachSession_participantEmail_idx" ON "CoachSession"("participantEmail");
CREATE INDEX "CoachSession_organisation_idx" ON "CoachSession"("organisation");
CREATE INDEX "CoachSession_status_idx" ON "CoachSession"("status");
CREATE INDEX "CoachSession_stage_idx" ON "CoachSession"("stage");
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX "AnalyticsEvent_stage_idx" ON "AnalyticsEvent"("stage");
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoachSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
