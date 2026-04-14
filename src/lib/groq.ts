import type { RetrievedLog } from "./log-search";

const GROQ_API_URL = "https://api.groq.com/openai/v1/responses";
const DEFAULT_MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

export class GroqAuthError extends Error {}

type ResponsesApiOutput = {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  output_text?: string;
  error?: {
    message?: string;
  };
};

function buildPrompt(question: string, citations: RetrievedLog[]) {
  const context = citations
    .map((log, index) =>
      [
        `Source ${index + 1}:`,
        `id=${log.id}`,
        `date=${log.createdAt}`,
        `tag=${log.tag}`,
        `body=${log.body}`,
      ].join("\n")
    )
    .join("\n\n");

  return [
    "You answer questions about a user's personal journal.",
    "Use only the provided sources.",
    "If the sources are not enough to answer confidently, say that clearly.",
    "Keep the answer concise and grounded in the journal content.",
    "",
    `Question: ${question}`,
    "",
    "Sources:",
    context,
  ].join("\n");
}

function extractOutputText(payload: ResponsesApiOutput) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const text = payload.output
    ?.flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n\n");

  return text?.trim() || null;
}

async function sendGroqRequest(input: string, apiKey: string) {
  if (!apiKey.trim()) {
    throw new GroqAuthError("Groq API key is missing.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input,
    }),
  });

  const payload = (await response.json()) as ResponsesApiOutput;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new GroqAuthError(payload.error?.message || "Groq rejected the API key.");
    }

    throw new Error(payload.error?.message || "Groq request failed.");
  }

  return payload;
}

export async function verifyGroqApiKey(apiKey: string) {
  await sendGroqRequest("Reply with the single word OK.", apiKey);
}

export async function askLogsQuestion(
  question: string,
  citations: RetrievedLog[],
  apiKey: string
) {
  const payload = await sendGroqRequest(buildPrompt(question, citations), apiKey);

  const answer = extractOutputText(payload);

  if (!answer) {
    throw new Error("Groq returned an empty answer.");
  }

  return answer;
}
