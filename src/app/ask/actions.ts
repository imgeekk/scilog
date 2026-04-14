"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { askLogsQuestion, GroqAuthError, verifyGroqApiKey } from "@/lib/groq";
import { retrieveLogsForQuestion } from "@/lib/log-search";
import { getPrisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/secret-crypto";
import type { AskState, GroqKeyState } from "./types";

export async function askLogs(
  _previousState: AskState,
  formData: FormData
): Promise<AskState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      status: "validation_error",
      message: "You must be signed in to ask questions about your logs.",
    };
  }

  const question = formData.get("question");

  if (typeof question !== "string" || !question.trim()) {
    return {
      status: "validation_error",
      message: "Ask a question about your logs first.",
    };
  }

  const user = await getPrisma().user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      groqApiKeyEncrypted: true,
    },
  });

  if (!user?.groqApiKeyEncrypted) {
    return {
      status: "missing_api_key",
      message: "Add your Groq API key below before asking questions about your logs.",
      question: question.trim(),
    };
  }

  let apiKey: string;

  try {
    apiKey = decryptSecret(user.groqApiKeyEncrypted);
  } catch {
    return {
      status: "server_error",
      message: "Unable to read your saved key. Set your Groq API key again.",
      question: question.trim(),
    };
  }

  try {
    const retrievedLogs = await retrieveLogsForQuestion(question.trim(), session.user.id);

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

    const answer = await askLogsQuestion(question.trim(), retrievedLogs.slice(0, 4), apiKey);

    return {
      status: "success",
      question: question.trim(),
      answer,
      citations,
    };
  } catch (error) {
    if (error instanceof GroqAuthError) {
      return {
        status: "invalid_api_key",
        message: "Your saved Groq API key is invalid or expired. Update it below.",
        question: question.trim(),
      };
    }

    return {
      status: "server_error",
      message: "Unable to answer right now. Check the Groq or database configuration.",
      question: question.trim(),
    };
  }
}

export async function saveGroqApiKey(
  _previousState: GroqKeyState,
  formData: FormData
): Promise<GroqKeyState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      status: "validation_error",
      message: "You must be signed in to save a Groq API key.",
    };
  }

  const apiKey = formData.get("apiKey");

  if (typeof apiKey !== "string" || !apiKey.trim()) {
    return {
      status: "validation_error",
      message: "Enter a Groq API key first.",
    };
  }

  try {
    await verifyGroqApiKey(apiKey.trim());
  } catch (error) {
    if (error instanceof GroqAuthError) {
      return {
        status: "invalid_key",
        message: "Groq rejected that key. Check it and try again.",
      };
    }

    return {
      status: "server_error",
      message: "Could not verify key with Groq right now. Try again shortly.",
    };
  }

  try {
    await getPrisma().user.update({
      where: {
        id: session.user.id,
      },
      data: {
        groqApiKeyEncrypted: encryptSecret(apiKey.trim()),
        groqApiKeyUpdatedAt: new Date(),
      },
    });
  } catch {
    return {
      status: "server_error",
      message: "Unable to save your key right now.",
    };
  }

  return {
    status: "success",
    message: "Groq API key saved.",
  };
}

export async function removeGroqApiKey(
  _previousState: GroqKeyState
): Promise<GroqKeyState> {
  void _previousState;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      status: "validation_error",
      message: "You must be signed in to remove a Groq API key.",
    };
  }

  try {
    await getPrisma().user.update({
      where: {
        id: session.user.id,
      },
      data: {
        groqApiKeyEncrypted: null,
        groqApiKeyUpdatedAt: null,
      },
    });
  } catch {
    return {
      status: "server_error",
      message: "Unable to remove your key right now.",
    };
  }

  return {
    status: "removed",
    message: "Groq API key removed.",
  };
}
