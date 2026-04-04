"use server";

import { askLogsQuestion } from "@/lib/groq";
import { retrieveLogsForQuestion } from "@/lib/log-search";
import type { AskState } from "./types";

export async function askLogs(
  _previousState: AskState,
  formData: FormData
): Promise<AskState> {
  const question = formData.get("question");

  if (typeof question !== "string" || !question.trim()) {
    return {
      status: "validation_error",
      message: "Ask a question about your logs first.",
    };
  }

  try {
    const retrievedLogs = await retrieveLogsForQuestion(question.trim());

    if (retrievedLogs.length === 0 || retrievedLogs[0].score <= 0) {
      return {
        status: "no_matches",
        message: "No matching logs were strong enough to answer that question.",
        question: question.trim(),
      };
    }

    const citations = retrievedLogs.slice(0, 3).map((log) => ({
      id: log.id,
      createdAt: log.createdAt,
      tag: log.tag,
      excerpt: log.excerpt,
    }));

    const answer = await askLogsQuestion(question.trim(), retrievedLogs.slice(0, 4));

    return {
      status: "success",
      question: question.trim(),
      answer,
      citations,
    };
  } catch {
    return {
      status: "server_error",
      message: "Unable to answer right now. Check the Groq or database configuration.",
      question: question.trim(),
    };
  }
}
