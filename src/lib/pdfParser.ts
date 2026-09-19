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

const FOOTER_PATTERNS = [
  /\bthe insights group\b/i,
  /\binsights learning and development\b/i,
  /\binsights discovery\b.*\ball rights reserved\b/i,
  /\bcopyright\b.*\binsights\b/i,
  /\bwww\.insights\.com\b/i,
  /\bpersonal profile\b.*\bpage\b/i,
  /^page\s+\d+(\s+of\s+\d+)?$/i,
  /^©?\s*\d{4}\s+the insights group/i
];

const COLOUR_LABELS: Record<ColourEnergy, string[]> = {
  coolBlue: ["cool blue", "blue"],
  earthGreen: ["earth green", "green"],
  sunshineYellow: ["sunshine yellow", "yellow"],
  fieryRed: ["fiery red", "red"]
};

export async function extractTextFromPdf(buffer: Buffer) {
  const errors: string[] = [];
  for (const extractor of [extractWithPdf2Json, extractWithPdfJs, extractWithPdfParse]) {
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
  const cleanedText = cleanExtractedText(text);
  const normalized = cleanedText.replace(/\s+/g, " ").trim();
  const colourScores = extractColourScores(cleanedText);
  const counts = COLOUR_PATTERNS.map(([energy, pattern]) => ({
    energy,
    count: (normalized.match(pattern) ?? []).length
  })).sort((a, b) => b.count - a.count);
  const rankedScores = Object.entries(colourScores)
    .map(([energy, score]) => ({ energy: energy as ColourEnergy, score }))
    .filter((item) => typeof item.score === "number" && Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score);

  const dominant = rankedScores[0]?.energy ?? (counts[0]?.count ? counts[0].energy : "");
  const secondary = rankedScores[1]?.energy ?? (counts[1]?.count ? counts[1].energy : "");
  const scoreNote = rankedScores.length
    ? `Detected Colour Dynamics scores: ${rankedScores.map((item) => `${friendlyEnergy(item.energy)} ${item.score}`).join(", ")}.`
    : "";
  const base = defaultBehaviouralContext({
    dominantEnergy: dominant,
    secondaryEnergy: secondary,
    source: "pdf-extracted",
    confidence: rankedScores.length >= 2 ? "high" : counts[0]?.count >= 4 ? "high" : counts[0]?.count >= 2 ? "medium" : "low",
    extractionNotes: [
      "The PDF was parsed in memory and the original file was not stored.",
      scoreNote || (dominant ? `Detected strongest colour signal: ${friendlyEnergy(dominant)}.` : "No strong colour-energy signal was detected.")
    ].filter(Boolean)
  });

  const conscious = findPersona(normalized, "conscious persona");
  const lessConscious = findPersona(normalized, "less conscious persona");
  const strengths = extractListAfterHeading(cleanedText, ["strengths", "value to the team"], base.strengths);
  const watchOuts = extractListAfterHeading(cleanedText, ["possible blind spots", "blind spots", "watch outs"], base.watchOuts);
  const communicationNeeds = extractListAfterHeading(cleanedText, ["communication", "communicating with"], base.communicationNeeds);
  const motivators = extractListAfterHeading(cleanedText, ["motivators", "what motivates"], base.motivators);
  const stressors = extractListAfterHeading(cleanedText, ["stress", "may become stressed"], base.stressors);

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
  await installPdfRuntimePolyfills();
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
  await installPdfRuntimePolyfills();
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText({ pageJoiner: "\n" });
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractWithPdf2Json(buffer: Buffer) {
  const PDFParser = (await import("pdf2json")).default;
  const parser = new PDFParser(null, true);
  const data = await new Promise<{
    Pages?: Array<{
      Texts?: Array<{
        R?: Array<{ T?: string }>;
      }>;
    }>;
  }>((resolve, reject) => {
    parser.on("pdfParser_dataError", (error: Error | { parserError: Error }) => {
      reject("parserError" in error ? error.parserError : error);
    });
    parser.on("pdfParser_dataReady", resolve);
    parser.parseBuffer(buffer);
  });

  return (
    data.Pages?.map((page) =>
      page.Texts?.map((text) =>
        text.R?.map((run) => decodePdfTextRun(run.T ?? "")).join("")
      ).join(" ") ?? ""
    ).join("\n") ?? ""
  );
}

function decodePdfTextRun(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function installPdfRuntimePolyfills() {
  const globalScope = globalThis as unknown as Record<string, unknown>;
  if (globalScope.DOMMatrix && globalScope.ImageData && globalScope.Path2D) return;

  const canvas = await import("@napi-rs/canvas");
  globalScope.DOMMatrix ??= canvas.DOMMatrix;
  globalScope.ImageData ??= canvas.ImageData;
  globalScope.Path2D ??= canvas.Path2D;
}

function findPersona(text: string, label: string) {
  const index = text.toLowerCase().indexOf(label);
  if (index === -1) return "";
  const snippet = text.slice(index + label.length, index + label.length + 120);
  const match = snippet.match(/[:\-]?\s*([A-Za-z ]{3,60})/);
  return match?.[1]?.trim() ?? "";
}

function extractListAfterHeading(text: string, headings: string[], fallback: string[]) {
  const lines = cleanExtractedLines(text);

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

function cleanExtractedText(text: string) {
  return cleanExtractedLines(text).join("\n");
}

function cleanExtractedLines(text: string) {
  return text
    .split(/\r?\n|[•\u2022]/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line && !isFooterLine(line));
}

function isFooterLine(line: string) {
  const compact = line.replace(/\s+/g, " ").trim();
  if (!compact) return true;
  return FOOTER_PATTERNS.some((pattern) => pattern.test(compact));
}

function extractColourScores(text: string): Partial<Record<ColourEnergy, number>> {
  const lines = cleanExtractedLines(text);
  const windows = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /colour dynamics|cool blue|earth green|sunshine yellow|fiery red/i.test(line))
    .map(({ index }) => lines.slice(Math.max(0, index - 2), index + 8).join(" "));

  const candidates = [lines.join(" "), ...windows];
  const scores: Partial<Record<ColourEnergy, number>> = {};

  for (const candidate of candidates) {
    const normalized = candidate.replace(/\s+/g, " ").trim();
    for (const energy of Object.keys(COLOUR_LABELS) as ColourEnergy[]) {
      const score = scoreNearColourLabel(normalized, energy);
      if (score === null) continue;
      scores[energy] = Math.max(scores[energy] ?? Number.NEGATIVE_INFINITY, score);
    }
    if (Object.keys(scores).length >= 2) break;
  }

  return Object.fromEntries(Object.entries(scores).filter(([, score]) => score !== Number.NEGATIVE_INFINITY)) as Partial<Record<ColourEnergy, number>>;
}

function scoreNearColourLabel(text: string, energy: ColourEnergy) {
  const labels = COLOUR_LABELS[energy].map(escapeRegExp).join("|");
  const after = text.match(new RegExp(`(?:${labels})\\D{0,28}(\\d{1,3}(?:\\.\\d+)?)`, "i"));
  const before = text.match(new RegExp(`(\\d{1,3}(?:\\.\\d+)?)\\D{0,28}(?:${labels})`, "i"));
  return validColourScore(after?.[1]) ?? validColourScore(before?.[1]);
}

function validColourScore(value?: string) {
  if (!value) return null;
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 100) return null;
  return score;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function friendlyEnergy(energy: ColourEnergy | "") {
  const labels: Record<ColourEnergy, string> = {
    fieryRed: "Fiery Red",
    sunshineYellow: "Sunshine Yellow",
    earthGreen: "Earth Green",
    coolBlue: "Cool Blue"
  };
  return energy ? labels[energy] : "";
}

export function normaliseProfileFormValue(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
