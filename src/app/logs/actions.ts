"use server";

import { LogTag } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import type { CreateLogState } from "./types";

export async function createLogEntry(
  _previousState: CreateLogState,
  formData: FormData
): Promise<CreateLogState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { status: "validation_error", message: "You must be signed in to create a log." };
  }

  const body = formData.get("body");
  const tag = formData.get("tag");

  if (typeof body !== "string" || !body.trim()) {
    return { status: "validation_error", message: "Log body is required." };
  }

  if (typeof tag !== "string" || !Object.values(LogTag).includes(tag as LogTag)) {
    return { status: "validation_error", message: "Choose a valid tag." };
  }

  try {
    await getPrisma().logEntry.create({
      data: {
        body: body.trim(),
        tag: tag as LogTag,
        userId: session.user.id,
      },
    });
  } catch {
    return {
      status: "server_error",
      message: "Unable to save the log right now. Check the database connection.",
    };
  }

  revalidatePath("/logs");

  return { status: "success", message: "Log committed to archive." };
}
