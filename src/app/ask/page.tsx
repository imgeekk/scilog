"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";

import { askLogs } from "./actions";
import { INITIAL_ASK_STATE } from "./types";

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

  return (
    <main className="ml-2 grid min-h-full w-full grid-cols-1 gap-2 overflow-hidden bg-[#091d1d] text-white lg:grid-cols-[0.95fr_1.25fr]">
      <section className="flex flex-col border border-[#123a3a] bg-[radial-gradient(circle_at_top,#123331_0%,#091d1d_55%)]">
        <header className="border-b border-[#123a3a] px-4 py-4">
          <p className="text-[10px] uppercase text-[#6da6a1]">Query interface</p>
          <h1 className="mt-2 text-3xl leading-none text-[#ebfff8]">Ask the archive</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#98b7b3]">
            Ask about themes, dates, or periods in your journal. The answer is
            generated from the logs and backed by citations.
          </p>
        </header>

        <form action={formAction} className="flex flex-1 flex-col gap-3 p-4">
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
              disabled={isPending}
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
      </section>

      <section className="flex min-h-0 flex-col border border-[#123a3a] bg-[linear-gradient(180deg,#0c2222_0%,#081616_100%)]">
        <header className="border-b border-[#123a3a] px-4 py-4">
          <p className="text-[10px] uppercase text-[#6da6a1]">Answer channel</p>
          <h2 className="mt-2 text-2xl leading-none text-[#ebfff8]">Response</h2>
        </header>

        <div className="scifi-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          {state.status === "idle" ? (
            <div className="border border-dashed border-[#1f4b49] bg-[#081818] px-4 py-10 text-center text-sm leading-6 text-[#82a4a0]">
              Ask one question at a time. The archive will return an answer and
              the strongest supporting logs.
            </div>
          ) : null}

          {state.status === "validation_error" ||
          state.status === "no_matches" ||
          state.status === "server_error" ? (
            <div className="space-y-3">
              {state.question ? (
                <p className="text-xs uppercase text-[#6f918d]">Q: {state.question}</p>
              ) : null}
              <div
                className={`border px-4 py-4 text-sm leading-6 ${
                  state.status === "validation_error"
                    ? "border-[#6a4b20] bg-[#24190c] text-[#f7ca7f]"
                    : state.status === "no_matches"
                      ? "border-[#214847] bg-[#0d2222] text-[#b7cbc8]"
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
        </div>
      </section>
    </main>
  );
}
