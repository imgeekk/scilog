"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";

import { askLogs, removeGroqApiKey, saveGroqApiKey } from "./actions";
import { INITIAL_ASK_STATE, INITIAL_GROQ_KEY_STATE } from "./types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [state, formAction, isPending] = useActionState(
    askLogs,
    INITIAL_ASK_STATE
  );
  const [saveState, saveKeyAction, isSavingKey] = useActionState(
    saveGroqApiKey,
    INITIAL_GROQ_KEY_STATE
  );
  const [removeState, removeKeyAction, isRemovingKey] = useActionState(
    removeGroqApiKey,
    INITIAL_GROQ_KEY_STATE
  );

  const keyStatus = removeState.status !== "idle" ? removeState : saveState;

  return (
    <main className="ml-2 grid min-h-full w-full grid-cols-1 gap-2 overflow-hidden bg-[#091d1d] text-white lg:grid-cols-[0.95fr_1.25fr]">
      <section className="flex flex-col border border-[#123a3a] bg-[radial-gradient(circle_at_top,#123331_0%,#091d1d_55%)]">
        <motion.header 
          className="border-b border-[#123a3a] px-4 py-4 origin-center"
          initial={{ opacity: 0, scaleX: 0.001, filter: "brightness(2.4)" }}
          animate={{
            opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
            scaleX: [0.001, 0.28, 0.88, 1],
            filter: [
              "brightness(2.4)",
              "brightness(1.75)",
              "brightness(1.15)",
              "brightness(1)",
            ],
          }}
          transition={{ duration: 0.86, ease: "easeOut" }}
        >
          <p className="text-[10px] uppercase text-[#6da6a1]">Query interface</p>
          <h1 className="mt-2 text-3xl leading-none text-[#ebfff8]">Ask the archive</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#98b7b3]">
            Ask about themes, dates, or periods in your journal. The answer is
            generated from the logs and backed by citations.
          </p>
        </motion.header>

        <motion.div
          className="flex flex-1 flex-col gap-3 p-4 origin-center"
          initial={{ opacity: 0, scaleX: 0.001, filter: "brightness(2.4)" }}
          animate={{
            opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
            scaleX: [0.001, 0.28, 0.88, 1],
            filter: [
              "brightness(2.4)",
              "brightness(1.75)",
              "brightness(1.15)",
              "brightness(1)",
            ],
          }}
          transition={{ duration: 0.86, delay: 0.05, ease: "easeOut" }}
        >
          <div className="space-y-3 border border-[#123a3a] bg-[#081918]/90 p-3">
            <p className="text-[10px] uppercase text-[#6da6a1]">Groq API key</p>
            <form action={saveKeyAction} className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <input
                type="password"
                name="apiKey"
                placeholder="gsk_..."
                className="h-11 flex-1 border border-[#1c5a55] bg-[#0b2424] px-3 text-sm text-white outline-none placeholder:text-[#50706d]"
              />
              <button
                type="submit"
                disabled={isSavingKey || isRemovingKey}
                className="h-11 border border-[#1c5a55] bg-[#0b2424] px-4 text-xs uppercase text-[#d8f5ee] transition hover:cursor-pointer hover:bg-[#123131] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingKey ? "Verifying..." : "Save key"}
              </button>
            </form>

            <form action={removeKeyAction}>
              <button
                type="submit"
                disabled={isSavingKey || isRemovingKey}
                className="h-10 border border-[#5c2930] bg-[#201116] px-4 text-xs uppercase text-[#f7b6b0] transition hover:cursor-pointer hover:bg-[#2a151c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRemovingKey ? "Removing..." : "Remove saved key"}
              </button>
            </form>

            {keyStatus.status !== "idle" ? (
              <div
                className={`border px-3 py-2 text-sm leading-6 ${
                  keyStatus.status === "success"
                    ? "border-[#214847] bg-[#0d2222] text-[#b7cbc8]"
                    : keyStatus.status === "removed"
                      ? "border-[#6a4b20] bg-[#24190c] text-[#f7ca7f]"
                      : keyStatus.status === "invalid_key"
                        ? "border-[#5c2930] bg-[#201116] text-[#f7b6b0]"
                        : "border-[#6a4b20] bg-[#24190c] text-[#f7ca7f]"
                }`}
              >
                {keyStatus.message}
              </div>
            ) : null}

            <p className="text-xs text-[#89a9a5]">
              Your key is encrypted before storage and used only for your own ask requests.
            </p>
          </div>

          <form action={formAction} className="flex flex-1 flex-col gap-3">
          <div className="relative flex-1 border border-[#123a3a] bg-[#081918]/90">
            <textarea
              name="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What have I been writing about this week?"
              className="scifi-scrollbar min-h-52 w-full resize-none bg-transparent px-4 py-4 pr-20 text-sm leading-7 text-white outline-none placeholder:text-[#50706d]"
            />
            <button
              type="submit"
              aria-label="Ask archive"
              disabled={isPending || isSavingKey || isRemovingKey}
              className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center border border-[#1c5a55] bg-[#0b2424] text-[#d8f5ee] transition hover:cursor-pointer hover:bg-[#123131] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs uppercase text-[#6f918d]">
            {isPending ? (
              <div className="flex items-center gap-2">
                <motion.span
                  className="h-2 w-2 rounded-full bg-[#f7ca7f]"
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <p>Searching logs and drafting answer</p>
              </div>
            ) : (
              <p>{question.trim() ? "Question ready" : "Waiting for query"}</p>
            )}
            <p>One-shot ask</p>
          </div>
          </form>
        </motion.div>
      </section>

      <section className="flex min-h-0 flex-col border border-[#123a3a] bg-[linear-gradient(180deg,#0c2222_0%,#081616_100%)]">
        <motion.header 
          className="border-b border-[#123a3a] px-4 py-4 origin-center"
          initial={{ opacity: 0, scaleX: 0.001, filter: "brightness(2.4)" }}
          animate={{
            opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
            scaleX: [0.001, 0.28, 0.88, 1],
            filter: [
              "brightness(2.4)",
              "brightness(1.75)",
              "brightness(1.15)",
              "brightness(1)",
            ],
          }}
          transition={{ duration: 0.86, delay: 0.1, ease: "easeOut" }}
        >
          <p className="text-[10px] uppercase text-[#6da6a1]">Answer channel</p>
          <h2 className="mt-2 text-2xl leading-none text-[#ebfff8]">Response</h2>
        </motion.header>

        <motion.div 
          className="scifi-scrollbar min-h-0 flex-1 overflow-y-auto p-4 origin-center"
          initial={{ opacity: 0, scaleX: 0.001, filter: "brightness(2.4)" }}
          animate={{
            opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
            scaleX: [0.001, 0.28, 0.88, 1],
            filter: [
              "brightness(2.4)",
              "brightness(1.75)",
              "brightness(1.15)",
              "brightness(1)",
            ],
          }}
          transition={{ duration: 0.86, delay: 0.15, ease: "easeOut" }}
        >
          {state.status === "idle" ? (
            <div className="border border-dashed border-[#1f4b49] bg-[#081818] px-4 py-10 text-center text-sm leading-6 text-[#82a4a0]">
              Ask one question at a time. The archive will return an answer and
              the strongest supporting logs.
            </div>
          ) : null}

          {state.status === "validation_error" ||
          state.status === "no_matches" ||
          state.status === "missing_api_key" ||
          state.status === "invalid_api_key" ||
          state.status === "server_error" ? (
            <div className="space-y-3">
              {state.question ? (
                <p className="text-xs uppercase text-[#6f918d]">Q: {state.question}</p>
              ) : null}
              <div
                className={`border px-4 py-4 text-sm leading-6 ${
                  state.status === "validation_error"
                    ? "border-[#6a4b20] bg-[#24190c] text-[#f7ca7f]"
                    : state.status === "no_matches" || state.status === "missing_api_key"
                      ? "border-[#214847] bg-[#0d2222] text-[#b7cbc8]"
                      : state.status === "invalid_api_key"
                        ? "border-[#5c2930] bg-[#201116] text-[#f7b6b0]"
                        : "border-[#5c2930] bg-[#201116] text-[#f7b6b0]"
                }`}
              >
                {state.message}
              </div>
            </div>
          ) : null}

          {state.status === "success" ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-[#6f918d]">Q: {state.question}</p>
                <div className="mt-3 border border-[#123a3a] bg-[#081918]/90 p-4">
                  <p className="text-sm leading-7 text-[#d4e5e1]">{state.answer}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase text-[#6f918d]">Supporting logs</p>
                {state.citations?.map((citation) => (
                  <article
                    key={citation.id}
                    className="grid gap-3 border border-[#123a3a] bg-[#081918]/90 p-3 lg:grid-cols-[92px_1fr]"
                  >
                    <div className="text-[11px] text-[#7aa9a3]">
                      <p>{formatDate(citation.createdAt)}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm leading-6 text-[#9eb9b6]">
                        {citation.excerpt}
                      </p>
                      <span className="inline-flex border border-[#214847] bg-[#0d2222] px-2 py-1 text-sm text-[#b7cbc8]">
                        #{citation.tag}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>
      </section>
    </main>
  );
}
