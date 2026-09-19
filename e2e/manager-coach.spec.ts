import { expect, test } from "@playwright/test";
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

test("manager can complete a full coaching journey and admin can view it", async ({ page }, testInfo) => {
  const pdfPath = path.join(testInfo.outputDir, "synthetic-insights-profile.pdf");
  await createSyntheticPdf(pdfPath);

  await page.goto("/");
  await page.getByLabel("Name").fill("Jordan Taylor");
  await page.getByLabel("Email").fill("jordan@example.com");
  await page.getByLabel("Organisation").fill("Example Ltd");
  await page.getByLabel("Role title").fill("Operations Manager");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Start coaching session/i }).click();

  await expect(page).toHaveURL(/\/coach\//);
  await page.getByLabel("Insights Discovery PDF").setInputFiles(pdfPath);
  await page.getByRole("button", { name: /Upload and extract/i }).click();
  await expect(page.getByText(/PDF deleted after parsing/i)).toBeVisible();

  await page.getByRole("button", { name: /Confirm preference context/i }).click();
  await expect(page.getByRole("heading", { name: "Manager Challenge Intake" })).toBeVisible();

  await page.getByLabel("What is happening?").fill("A valued team member has missed two deadlines and I need to reset expectations without damaging trust.");
  await page.getByLabel("What outcome do you want?").fill("Agree a clear recovery plan, support and review rhythm.");
  await page.getByLabel("Other person or stakeholder context").fill("Direct report who is usually committed but currently overloaded.");
  await page.getByLabel("What is at stake?").fill("Client delivery, team confidence and the working relationship.");
  await page.getByLabel("Known facts").fill("Two deadlines slipped in four weeks.");
  await page.getByLabel("Previous attempts").fill("One informal check-in.");
  await page.getByLabel("Constraints or process factors").fill("Several competing priorities.");
  await page.getByRole("button", { name: /Generate coaching pathway/i }).click();

  await expect(page.getByRole("heading", { name: "Coaching Pathway" })).toBeVisible();
  await expect(page.getByRole("link", { name: /PDF/i })).toBeVisible();

  await page.locator('input[name="selectedActions"]').first().check();
  await page.getByLabel("First step").fill("Write down the facts and agree a 30-minute conversation.");
  await page.getByLabel("Support needed").fill("Diary space and a quiet room.");
  await page.getByLabel("Review date").fill("2026-10-01");
  await page.getByLabel("Notes").fill("Keep the conversation specific and supportive.");
  await page.getByRole("button", { name: /Save action plan/i }).click();

  await expect(page.getByRole("heading", { name: "Follow-up Reflection" })).toBeVisible();
  await page.getByLabel("What happened?").fill("We agreed a shorter review cycle and removed one blocker.");
  await page.getByLabel("What worked?").fill("Starting with facts reduced defensiveness.");
  await page.getByLabel("What would you change next time?").fill("Be clearer about the review measure.");
  await page.getByLabel("What support is needed now?").fill("A follow-up in one week.");
  await page.getByRole("button", { name: /Save reflection/i }).click();
  await expect(page.getByText(/coaching loop is complete/i)).toBeVisible();

  await page.goto("/admin/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Manager Coach Admin" })).toBeVisible();
  await expect(page.getByText("Jordan Taylor")).toBeVisible();
  await expect(page.getByText("Example Ltd")).toBeVisible();
});

async function createSyntheticPdf(filePath: string) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  doc.fontSize(16).text("Synthetic Insights Discovery Personal Profile");
  doc.moveDown();
  doc.text("Conscious Persona: Motivating Supporter");
  doc.text("Less Conscious Persona: Focused Helper");
  doc.text("Sunshine Yellow Sunshine Yellow Sunshine Yellow");
  doc.text("Earth Green Earth Green");
  doc.moveDown();
  doc.text("Strengths");
  doc.text("Builds energy in the team");
  doc.text("Invites people into the conversation");
  doc.moveDown();
  doc.text("Possible Blind Spots");
  doc.text("May skip detail when excited");
  doc.text("May assume agreement too quickly");
  doc.moveDown();
  doc.text("Communication");
  doc.text("Keep people involved");
  doc.text("Confirm commitments in writing");
  doc.end();
  await new Promise<void>((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
