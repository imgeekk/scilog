"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "motion/react";

import { createLogEntry } from "./actions";
import { INITIAL_CREATE_LOG_STATE, type CreateLogState } from "./types";

type LogTag = "campus" | "work" | "reflection";

type LogItem = {
  id: string;
  body: string;
  tag: LogTag;
  createdAt: string;
};

const tagLabel: Record<LogTag, string> = {
  campus: "#campus",
  work: "#work",
  reflection: "#reflection",
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export function LogsClient({
  logs,
  totalWords,
}: {
  logs: LogItem[];
  totalWords: number;
}) {
  const [tag, setTag] = useState<LogTag>("reflection");
  const [body, setBody] = useState("");
  const [state, setState] = useState<CreateLogState>(INITIAL_CREATE_LOG_STATE);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const latestLog = logs[0];

  const submitAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createLogEntry(INITIAL_CREATE_LOG_STATE, formData);

      setState(result);

      if (result.status === "success") {
        formRef.current?.reset();
        setBody("");
        setTag("reflection");
      }
    });
  };

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setState(INITIAL_CREATE_LOG_STATE);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [state.status]);

  return (
    <main className="ml-2 flex min-h-full w-full flex-col gap-2 overflow-hidden bg-[#091d1d] text-white">
      <section className="flex min-h-0 flex-1 flex-col border border-[#123a3a] bg-[radial-gradient(circle_at_top,#103733_0%,#091d1d_55%)]">
        <motion.header 
          className="grid gap-3 border-b border-[#123a3a] px-4 py-4 origin-center lg:grid-cols-[1.8fr_auto]"
          initial={{ opacity: 0, filter: "brightness(2.4)" }}
          animate={{
            opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
            filter: [
              "brightness(2.4)",
              "brightness(1.75)",
              "brightness(1.15)",
              "brightness(1)",
            ],
          }}
          transition={{ duration: 0.86, ease: "easeOut" }}
        >
          <div>
            <p className="text-[10px] uppercase text-[#6da6a1]">
              Personal archive
            </p>
            <h1 className="mt-2 text-3xl leading-none text-[#ebfff8]">Journal logs</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#98b7b3]">
              A running timeline of personal entries, daily fragments, and
              small status updates captured in one place.
            </p>
          </div>
          <div className="grid auto-rows-min grid-cols-3 gap-2 self-start text-xs uppercase text-[#88aaa6] lg:min-w-[300px]">
            <div className="border border-[#123a3a] bg-[#0a2323] px-3 py-2">
              <p>Entries</p>
              <p className="mt-1 text-lg text-[#f1f7f3]">{logs.length}</p>
            </div>
            <div className="border border-[#123a3a] bg-[#0a2323] px-3 py-2">
              <p>Words</p>
              <p className="mt-1 text-lg text-[#f1f7f3]">{totalWords}</p>
            </div>
            <div className="border border-[#123a3a] bg-[#0a2323] px-3 py-2">
              <p>Latest</p>
              <p className="mt-1 text-lg text-[#f1f7f3]">
                {latestLog ? formatTime(latestLog.createdAt) : "--:--"}
              </p>
            </div>
          </div>
        </motion.header>

        <motion.div 
          className="scifi-scrollbar min-h-0 flex-1 overflow-y-scroll px-4 py-4 origin-center"
          initial={{ opacity: 0, filter: "brightness(2.4)" }}
          animate={{
            opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
            filter: [
              "brightness(2.4)",
              "brightness(1.75)",
              "brightness(1.15)",
              "brightness(1)",
            ],
          }}
          transition={{ duration: 0.86, delay: 0.05, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-3 pb-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="grid gap-3 lg:grid-cols-[92px_1fr] lg:items-start"
              >
                <div className="flex flex-col pt-3 text-[11px] text-[#7aa9a3]">
                  <p>{formatDate(log.createdAt)}</p>
                  <p className="mt-1 text-[11px] text-[#f1f7f3]">
                    {formatTime(log.createdAt)}
                  </p>
                </div>

                <article className="space-y-4 border border-[#123a3a] bg-[#081918]/90 p-3">
                  <p className="text-sm leading-6 text-[#9eb9b6]">{log.body}</p>
                  <div className="pt-1">
                    <span className="inline-flex border border-[#214847] bg-[#0d2222] px-2 py-1 text-sm text-[#b7cbc8]">
                      {tagLabel[log.tag]}
                    </span>
                  </div>
                </article>
              </div>
            ))}

            {logs.length === 0 ? (
              <div className="border border-dashed border-[#1f4b49] bg-[#081818] px-4 py-10 text-center text-sm text-[#82a4a0]">
                No logs recorded yet. Commit your first entry from the panel
                below.
              </div>
            ) : null}
          </div>
        </motion.div>
      </section>

      <motion.aside className="border border-[#123a3a] bg-[linear-gradient(180deg,#0c2222_0%,#081616_100%)] p-3">
        <motion.div 
          className="border-b border-[#123a3a] px-4 py-3 origin-center"
          initial={{ opacity: 0, filter: "brightness(2.4)" }}
          animate={{
            opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
            filter: [
              "brightness(2.4)",
              "brightness(1.75)",
              "brightness(1.15)",
              "brightness(1)",
            ],
          }}
          transition={{ duration: 0.86, delay: 0.1, ease: "easeOut" }}
        >
          <h2 className="text-xl uppercase text-[#f1f7f3]">Commit a log</h2>
        </motion.div>

        <motion.form 
          ref={formRef} 
          action={submitAction} 
          className="grid gap-3 p-3 origin-center"
          initial={{ opacity: 0, filter: "brightness(2.4)" }}
          animate={{
            opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
            filter: [
              "brightness(2.4)",
              "brightness(1.75)",
              "brightness(1.15)",
              "brightness(1)",
            ],
          }}
          transition={{ duration: 0.86, delay: 0.15, ease: "easeOut" }}
        >
          <input type="hidden" name="tag" value={tag} />

          <div className="relative">
            <textarea
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the memory, event, or daily reflection."
              className="scifi-scrollbar min-h-28 w-full resize-none border border-[#123a3a] bg-[#071414] px-3 py-3 pr-30 text-sm leading-6 text-white outline-none placeholder:text-[#50706d] focus:border-[#2f8d84]"
            />
            <button
              type="submit"
              aria-label="Commit log"
              disabled={isPending}
              className="absolute right-3 top-3 flex bottom-6 w-20 items-center justify-center border border-[#1c5a55] bg-[#0b2424] text-[#d8f5ee] transition hover:cursor-pointer hover:bg-[#123131] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
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

          <div className="flex flex-wrap items-center gap-2">
            {(["campus", "work", "reflection"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTag(option)}
                className={`border px-3 py-2 text-sm transition ${
                  tag === option
                    ? "border-[#5f7b78] bg-[#0b1b1b] text-white"
                    : "border-[#123a3a] bg-[#071414] text-[#7a9a96]"
                }`}
              >
                {tagLabel[option]}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-xs uppercase text-[#6f918d]">
              {isPending ? (
                <>
                  <motion.span
                    className="h-2 w-2 rounded-full bg-[#f7ca7f]"
                    animate={{ opacity: [0.45, 1, 0.45], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <p>Committing log</p>
                </>
              ) : state.status === "success" ? (
                <>
                  <motion.span
                    className="h-2 w-2 rounded-full bg-[#8df3d2]"
                    initial={{ opacity: 0.4, scale: 0.85 }}
                    animate={{
                      opacity: [0.4, 1, 0.7],
                      scale: [0.85, 1.25, 1],
                      boxShadow: [
                        "0 0 4px rgba(141,243,210,0.35)",
                        "0 0 16px rgba(141,243,210,0.95)",
                        "0 0 6px rgba(141,243,210,0.5)",
                      ],
                    }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                  <p>{state.message}</p>
                </>
              ) : body.trim() ? (
                <p>{`${body.trim().split(/\s+/).filter(Boolean).length} words ready`}</p>
              ) : (
                <>
                  <motion.span
                    className="h-2 w-2 rounded-full bg-[#8df3d2]"
                    animate={{
                      opacity: [0.35, 1, 0.35],
                      scale: [0.85, 1.2, 0.85],
                      boxShadow: [
                        "0 0 4px rgba(141,243,210,0.35)",
                        "0 0 14px rgba(141,243,210,0.95)",
                        "0 0 4px rgba(141,243,210,0.35)",
                      ],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.p
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Waiting for input
                  </motion.p>
                </>
              )}
            </div>
          </div>

          {state.status === "validation_error" || state.status === "server_error" ? (
            <p
              className={`text-sm ${
                state.status === "validation_error"
                  ? "text-[#f7ca7f]"
                  : "text-[#f7b6b0]"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </motion.form>
      </motion.aside>
    </main>
  );
}
