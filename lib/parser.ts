import { getIsoWeekNumber, parseDayMonthToken } from "@/lib/date";
import type { NotePriority, QuickParseResult } from "@/lib/types";

const CLASS_TAG_PATTERN = /^\d{1,2}[A-Z]$/;

const PRIORITY_MAP: Record<string, NotePriority> = {
  "hög": "high",
  hog: "high",
  high: "high",
  prio1: "high",
  p1: "high",
  "medel": "medium",
  medium: "medium",
  prio2: "medium",
  p2: "medium",
  "låg": "low",
  lag: "low",
  low: "low",
  prio3: "low",
  p3: "low"
};

function getTitleTokenCount(words: string[]): number {
  if (words.length <= 4) {
    return words.length;
  }

  return Math.min(6, Math.max(4, Math.round(words.length * 0.6)));
}

export function parseQuickInput(input: string, now: Date = new Date()): QuickParseResult {
  const cleaned = input.trim().replace(/\s+/g, " ");
  const tokens = cleaned.length > 0 ? cleaned.split(" ") : [];
  const usedIndices = new Set<number>();

  let classTag: string | undefined;
  let reminderAt: string | undefined;
  let weekNumber: number | undefined;
  let priority: NotePriority = "medium";

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!classTag && CLASS_TAG_PATTERN.test(token)) {
      classTag = token;
      usedIndices.add(index);
      continue;
    }

    if (!reminderAt) {
      const parsedDate = parseDayMonthToken(token, now);
      if (parsedDate) {
        reminderAt = parsedDate;
        weekNumber = getIsoWeekNumber(new Date(parsedDate));
        usedIndices.add(index);
        continue;
      }
    }

    const mappedPriority = PRIORITY_MAP[token.toLowerCase()];
    if (mappedPriority && priority === "medium") {
      priority = mappedPriority;
      usedIndices.add(index);
    }
  }

  const contentTokens = tokens.filter((_, index) => !usedIndices.has(index));
  const titleTokenCount = getTitleTokenCount(contentTokens);
  const title = contentTokens.slice(0, titleTokenCount).join(" ").trim() || "Ny lapp";
  const body = contentTokens.slice(titleTokenCount).join(" ").trim();

  return {
    title,
    body,
    classTag,
    priority,
    reminderAt,
    weekNumber
  };
}
