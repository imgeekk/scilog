import { LogTag } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";

const STOP_WORDS = new Set([
  "a",
  "about",
  "after",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "been",
  "before",
  "but",
  "by",
  "did",
  "do",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "last",
  "me",
  "my",
  "of",
  "on",
  "or",
  "recent",
  "show",
  "tell",
  "that",
  "the",
  "this",
  "to",
  "today",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
]);

const TAG_VALUES = Object.values(LogTag).map((value) => value.toLowerCase());

export type RetrievedLog = {
  id: string;
  body: string;
  tag: Lowercase<LogTag>;
  createdAt: string;
  excerpt: string;
  score: number;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function parseDateRange(question: string) {
  const normalized = question.toLowerCase();
  const now = new Date();

  if (normalized.includes("today")) {
    return { gte: startOfDay(now) };
  }

  if (normalized.includes("yesterday")) {
    const yesterday = startOfDay(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return { gte: yesterday, lt: startOfDay(now) };
  }

  if (
    normalized.includes("last week") ||
    normalized.includes("past week") ||
    normalized.includes("last 7 days")
  ) {
    const value = new Date(now);
    value.setDate(value.getDate() - 7);
    return { gte: value };
  }

  if (normalized.includes("last month") || normalized.includes("last 30 days")) {
    const value = new Date(now);
    value.setDate(value.getDate() - 30);
    return { gte: value };
  }

  const explicitDates = normalized.match(/\d{4}-\d{2}-\d{2}/g);

  if (explicitDates?.length) {
    const [firstDate, secondDate] = explicitDates;
    const gte = new Date(`${firstDate}T00:00:00`);

    if (secondDate) {
      const lte = new Date(`${secondDate}T23:59:59`);
      return { gte, lte };
    }

    const lte = new Date(`${firstDate}T23:59:59`);
    return { gte, lte };
  }

  return undefined;
}

function extractQueryTokens(question: string) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .slice(0, 8);
}

function detectTags(question: string): Lowercase<LogTag>[] {
  const normalized = question.toLowerCase();
  return TAG_VALUES.filter((tag) => normalized.includes(tag)) as Lowercase<LogTag>[];
}

function buildExcerpt(body: string, tokens: string[]) {
  const normalizedBody = body.toLowerCase();
  const matchedToken = tokens.find((token) => normalizedBody.includes(token));

  if (!matchedToken) {
    return body.length > 180 ? `${body.slice(0, 177)}...` : body;
  }

  const matchIndex = normalizedBody.indexOf(matchedToken);
  const start = Math.max(0, matchIndex - 70);
  const end = Math.min(body.length, matchIndex + 110);
  const excerpt = body.slice(start, end).trim();

  return `${start > 0 ? "..." : ""}${excerpt}${end < body.length ? "..." : ""}`;
}

function scoreLog({
  body,
  tag,
  createdAt,
  tokens,
  tags,
}: {
  body: string;
  tag: Lowercase<LogTag>;
  createdAt: Date;
  tokens: string[];
  tags: Lowercase<LogTag>[];
}) {
  const normalizedBody = body.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (normalizedBody.includes(token)) {
      score += 3;
    }
  }

  if (tags.includes(tag)) {
    score += 5;
  }

  const ageInDays = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );

  if (ageInDays <= 7) {
    score += 2;
  } else if (ageInDays <= 30) {
    score += 1;
  }

  return score;
}

export async function retrieveLogsForQuestion(question: string) {
  const tokens = extractQueryTokens(question);
  const tags = detectTags(question);
  const dateRange = parseDateRange(question);

  const logs = await getPrisma().logEntry.findMany({
    where: {
      ...(dateRange ? { createdAt: dateRange } : {}),
      ...(tags.length
        ? { tag: { in: tags.map((tag) => tag.toUpperCase() as LogTag) } }
        : {}),
      ...(tokens.length
        ? {
            OR: tokens.map((token) => ({
              body: {
                contains: token,
                mode: "insensitive",
              },
            })),
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const fallbackLogs =
    logs.length === 0
      ? await getPrisma().logEntry.findMany({
          where: dateRange ? { createdAt: dateRange } : undefined,
          orderBy: { createdAt: "desc" },
          take: 12,
        })
      : logs;

  return fallbackLogs
    .map((log) => {
      const lowerTag = log.tag.toLowerCase() as Lowercase<LogTag>;
      return {
        id: log.id,
        body: log.body,
        tag: lowerTag,
        createdAt: log.createdAt.toISOString(),
        excerpt: buildExcerpt(log.body, tokens),
        score: scoreLog({
          body: log.body,
          tag: lowerTag,
          createdAt: log.createdAt,
          tokens,
          tags,
        }),
      } satisfies RetrievedLog;
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);
}
