import { TCW_CONTACT_EMAIL, TCW_HUMAN_COACHING_CTA } from "@/config/coachingFramework";
import { colourName } from "@/lib/behavioural";
import type { StoredCoachSession } from "@/lib/types";
import PDFDocument from "pdfkit";

export async function renderSessionPdf(session: StoredCoachSession) {
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const profile = session.profileConfirmed ?? session.profileExtraction;
  const plan = session.coachingPlan;
  const actionPlan = session.actionPlan;

  header(doc, "THE COLOUR WORKS", "Manager Coach");
  doc.fillColor("#111827").fontSize(20).text("Coaching Preparation Report", { continued: false });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#4b5563").text(`Prepared for ${session.participantName}, ${session.organisation}`);
  doc.text(`Generated ${new Date().toLocaleDateString("en-GB")}`);
  doc.moveDown();

  section(doc, "Behavioural Preference Lens");
  line(doc, "Dominant energy", colourName(profile?.dominantEnergy ?? ""));
  line(doc, "Secondary energy", colourName(profile?.secondaryEnergy ?? ""));
  bulletList(doc, "Strengths to use", profile?.strengths ?? []);
  bulletList(doc, "Watch-outs to manage", profile?.watchOuts ?? []);

  if (session.challenge) {
    section(doc, "Challenge");
    doc.fontSize(10).fillColor("#111827").text(session.challenge.situation);
    line(doc, "Desired outcome", session.challenge.desiredOutcome);
    line(doc, "Stakes", session.challenge.stakes || "Not specified");
  }

  if (plan) {
    section(doc, "Coaching Pathway");
    paragraph(doc, plan.summary);
    bulletList(doc, "Facts", plan.facts);
    bulletList(doc, "Assumptions to test", plan.assumptions.map((item) => `${item.assumption} Reframe: ${item.reframe}`));
    bulletList(doc, "Preference lens", [...plan.preferenceLens.helping, ...plan.preferenceLens.hindering]);

    section(doc, "Conversation Plan");
    paragraph(doc, plan.conversationPlan.opening);
    bulletList(doc, "Questions", plan.conversationPlan.questions);
    bulletList(doc, "Boundaries", plan.conversationPlan.boundaries);

    section(doc, "Recommended Actions");
    bulletList(doc, "Actions", plan.recommendedActions.map((item) => `${item.action} (${item.timing})`));
  }

  if (actionPlan) {
    section(doc, "Selected Action Plan");
    bulletList(doc, "Selected actions", actionPlan.selectedActions);
    line(doc, "First step", actionPlan.firstStep);
    line(doc, "Support needed", actionPlan.supportNeeded || "None recorded");
    line(doc, "Review date", actionPlan.reviewDate || "Not set");
  }

  section(doc, "Human Coaching");
  paragraph(doc, `${TCW_HUMAN_COACHING_CTA} Contact ${TCW_CONTACT_EMAIL}.`);

  addFooters(doc);
  doc.end();
  return done;
}

function header(doc: PDFKit.PDFDocument, brand: string, product: string) {
  doc.rect(0, 0, doc.page.width, 88).fill("#123c69");
  doc.rect(0, 80, doc.page.width * 0.25, 8).fill("#d92d20");
  doc.rect(doc.page.width * 0.25, 80, doc.page.width * 0.25, 8).fill("#f7b500");
  doc.rect(doc.page.width * 0.5, 80, doc.page.width * 0.25, 8).fill("#16803c");
  doc.rect(doc.page.width * 0.75, 80, doc.page.width * 0.25, 8).fill("#2563eb");
  doc.fillColor("#ffffff").fontSize(16).text(brand, 48, 28);
  doc.fontSize(11).text(product, 48, 50);
  doc.moveDown(4);
}

function section(doc: PDFKit.PDFDocument, title: string) {
  if (doc.y > 690) doc.addPage();
  doc.moveDown(0.8);
  doc.fillColor("#123c69").fontSize(14).text(title);
  doc.moveTo(48, doc.y + 4).lineTo(doc.page.width - 48, doc.y + 4).strokeColor("#d1d5db").stroke();
  doc.moveDown(0.5);
}

function line(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value || "Not recorded");
}

function paragraph(doc: PDFKit.PDFDocument, value: string) {
  doc.fillColor("#111827").font("Helvetica").fontSize(10).text(value, { lineGap: 3 });
}

function bulletList(doc: PDFKit.PDFDocument, label: string, items: string[]) {
  if (!items.length) return;
  doc.moveDown(0.4);
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10).text(label);
  doc.font("Helvetica");
  for (const item of items.slice(0, 8)) {
    doc.text(`- ${item}`, { indent: 12, lineGap: 2 });
  }
}

function addFooters(doc: PDFKit.PDFDocument) {
  const pages = doc.bufferedPageRange();
  for (let index = pages.start; index < pages.start + pages.count; index += 1) {
    doc.switchToPage(index);
    doc.fontSize(8).fillColor("#6b7280").text("The Colour Works Manager Coach - confidential coaching preparation", 48, 806, {
      align: "left"
    });
    doc.text(`Page ${index + 1} of ${pages.count}`, 48, 806, { align: "right" });
  }
}
