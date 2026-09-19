import { colourName } from "@/lib/behavioural";
import type { StoredCoachSession } from "@/lib/types";

export function sessionsToCsv(sessions: StoredCoachSession[]) {
  const headers = [
    "Created",
    "Name",
    "Email",
    "Organisation",
    "Role",
    "Stage",
    "Status",
    "Profile confidence",
    "Dominant energy",
    "Challenge type",
    "AI status",
    "PDF deleted"
  ];

  const rows = sessions.map((session) => [
    session.createdAt.toISOString(),
    session.participantName,
    session.participantEmail,
    session.organisation,
    session.roleTitle,
    session.stage,
    session.status,
    session.profileConfirmed?.confidence ?? session.profileExtraction?.confidence ?? "",
    colourName(session.profileConfirmed?.dominantEnergy ?? session.profileExtraction?.dominantEnergy ?? ""),
    session.challenge?.challengeType ?? "",
    session.aiStatus ?? "",
    session.pdfDeletedAt ? session.pdfDeletedAt.toISOString() : ""
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
