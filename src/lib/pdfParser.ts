import { defaultBehaviouralContext, unique } from "@/lib/behavioural";
import type { BehaviouralContext, ColourEnergy } from "@/lib/types";

const COLOUR_PATTERNS: Array<[ColourEnergy, RegExp]> = [
  ["fieryRed", /\b(fiery\s+red|red\s+energy|red)\b/gi],
  ["sunshineYellow", /\b(sunshine\s+yellow|yellow\s+energy|yellow)\b/gi],
  ["earthGreen", /\b(earth\s+green|green\s+energy|green)\b/gi],
  ["coolBlue", /\b(cool\s+blue|blue\s+energy|blue)\b/gi]
];

const SECTION_HEADINGS = [
  "strengths",
  "value to the team",
  "possible blind spots",
  "blind spots",
  "communication",
  "motivators",
  "management style",
  "stress",
  "opposite type"
];

export async function extractTextFromPdf(buffer: Buffer) {
  const errors: string[] = [];
  for (const extractor of [extractWithPdfJs, extractWithPdfParse]) {
    try {
      const text = await extractor(buffer);
      if (text.trim().length >= 20) return text;
      errors.push("empty-text");
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(`No selectable PDF text could be extracted. ${errors.join(" | ")}`);
}

export async function parseInsightsPdf(buffer: Buffer): Promise<BehaviouralContext> {
  const text = await extractTextFromPdf(buffer);
  return extractProfileFromText(text);
}

export function extractProfileFromText(text: string): BehaviouralContext {
  const normalized = text.replace(/\s+/g, " ").trim();
  const counts = COLOUR_PATTERNS.map(([energy, pattern]) => ({
    energy,
    count: (normalized.match(pattern) ?? []).length
  })).sort((a, b) => b.count - a.count);

  const dominant = counts[0]?.count ? counts[0].energy : "";
  const secondary = counts[1]?.count ? counts[1].energy : "";
  const base = defaultBehaviouralContext({
    dominantEnergy: dominant,
    secondaryEnergy: secondary,
    source: "pdf-extracted",
    confidence: counts[0]?.count >= 4 ? "high" : counts[0]?.count >= 2 ? "medium" : "low",
    extractionNotes: [
      "The PDF was parsed in memory and the original file was not stored.",
      dominant ? `Detected strongest colour signal: ${dominant}.` : "No strong colour-energy signal was detected."
    ]
  });

  const conscious = findPersona(normalized, "conscious persona");
  const lessConscious = findPersona(normalized, "less conscious persona");
  const strengths = extractListAfterHeading(text, ["strengths", "value to the team"], base.strengths);
  const watchOuts = extractListAfterHeading(text, ["possible blind spots", "blind spots", "watch outs"], base.watchOuts);
  const communicationNeeds = extractListAfterHeading(text, ["communication", "communicating with"], base.communicationNeeds);
  const motivators = extractListAfterHeading(text, ["motivators", "what motivates"], base.motivators);
  const stressors = extractListAfterHeading(text, ["stress", "may become stressed"], base.stressors);

  return {
    ...base,
    consciousPersona: conscious,
    lessConsciousPersona: lessConscious,
    strengths,
    watchOuts,
    motivators,
    stressors,
    communicationNeeds,
    source: "pdf-extracted",
    extractionNotes: [
      ...base.extractionNotes,
      "Please confirm and correct the extracted summary before using it for coaching."
    ]
  };
}

async function extractWithPdfJs(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true
  }).promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
      );
      page.cleanup();
    }
  } finally {
    await document.destroy();
  }

  return pages.join("\n");
}

async function extractWithPdfParse(buffer: Buffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText({ pageJoiner: "\n" });
    return result.text;
  } finally {
    await parser.destroy();
  }
}

function findPersona(text: string, label: string) {
  const index = text.toLowerCase().indexOf(label);
  if (index === -1) return "";
  const snippet = text.slice(index + label.length, index + label.length + 120);
  const match = snippet.match(/[:\-]?\s*([A-Za-z ]{3,60})/);
  return match?.[1]?.trim() ?? "";
}

function extractListAfterHeading(text: string, headings: string[], fallback: string[]) {
  const lines = text
    .split(/\r?\n|[•\u2022]/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const found: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].toLowerCase();
    if (!headings.some((heading) => line.includes(heading))) continue;
    for (let offset = 1; offset <= 8; offset += 1) {
      const candidate = lines[index + offset];
      if (!candidate) continue;
      const lower = candidate.toLowerCase();
      if (SECTION_HEADINGS.some((heading) => lower === heading || lower.startsWith(`${heading}:`))) break;
      if (candidate.length > 8 && candidate.length < 180) found.push(candidate.replace(/^[-:]\s*/, ""));
    }
  }

  return unique(found.length ? found : fallback).slice(0, 8);
}

export function normaliseProfileFormValue(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
