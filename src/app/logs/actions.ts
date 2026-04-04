"use server";

import { LogTag } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getPrisma } from "@/lib/prisma";
import type { CreateLogState } from "./types";

export async function createLogEntry(
  _previousState: CreateLogState,
  formData: FormData
): Promise<CreateLogState> {
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
