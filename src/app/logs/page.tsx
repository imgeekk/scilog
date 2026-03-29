"use client";

import { motion } from "motion/react";
import { FormEvent, useMemo, useState } from "react";

type LogEntry = {
  id: number;
  body: string;
  tag: "campus" | "work" | "reflection";
  createdAt: string;
};

const initialLogs: LogEntry[] = [
  {
    id: 1,
    body:
      "Woke before sunrise and made it to campus on time for once. The day felt surprisingly stable, like everything was finally aligned for a few hours.",
    tag: "campus",
    createdAt: "2026-03-27T06:42:00",
  },
  {
    id: 2,
    body:
      "The afternoon hit hard with too many tasks at once, but I still shipped the work I needed to finish. Tired, but not disappointed.",
    tag: "work",
    createdAt: "2026-03-26T18:10:00",
  },
  {
    id: 3,
    body:
      "Spent the evening offline and wrote things down instead of doom-scrolling. That helped more than I expected.",
    tag: "reflection",
    createdAt: "2026-03-25T21:24:00",
  },
  {
    id: 4,
    body:
      "Woke before sunrise and made it to campus on time for once. The day felt surprisingly stable, like everything was finally aligned for a few hours.",
    tag: "campus",
    createdAt: "2026-03-27T06:42:00",
  },
  {
    id: 5,
    body:
      "The afternoon hit hard with too many tasks at once, but I still shipped the work I needed to finish. Tired, but not disappointed.",
    tag: "work",
    createdAt: "2026-03-26T18:10:00",
  },
  {
    id: 6,
    body:
      "Spent the evening offline and wrote things down instead of doom-scrolling. That helped more than I expected.",
    tag: "reflection",
    createdAt: "2026-03-25T21:24:00",
  },
];

const tagLabel: Record<LogEntry["tag"], string> = {
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

export default function LogsPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<LogEntry["tag"]>("reflection");

  const latestLog = logs[0];
  const totalWords = useMemo(
    () =>
      logs.reduce((count, log) => {
        return count + log.body.split(/\s+/).filter(Boolean).length;
      }, 0),
    [logs]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!body.trim()) {
      return;
    }

    const newLog: LogEntry = {
      id: Date.now(),
      body: body.trim(),
      tag,
      createdAt: new Date().toISOString(),
    };

    setLogs((currentLogs) => [newLog, ...currentLogs]);
    setBody("");
    setTag("reflection");
  };

  return (
    <main className="ml-2 flex min-h-full w-full flex-col gap-2 overflow-hidden bg-[#091d1d] text-white">
      <section className="flex min-h-0 flex-1 flex-col border border-[#123a3a] bg-[radial-gradient(circle_at_top,#103733_0%,#091d1d_55%)]">
        <header className="grid gap-3 border-b border-[#123a3a] px-4 py-4 lg:grid-cols-[1.8fr_auto]">
          <div>
            <p className="text-[10px] uppercase text-[#6da6a1]">
              Personal archive
            </p>
            <h1 className="mt-2 text-3xl leading-none text-[#ebfff8]">
              Logs for user cm3343m234jh2l3j43l
            </h1>
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
        </header>

        <div className="scifi-scrollbar min-h-0 flex-1 overflow-y-scroll px-4 py-4">
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
        </div>
      </section>

      <aside className="border border-[#123a3a] bg-[linear-gradient(180deg,#0c2222_0%,#081616_100%)]">
        <div className="border-b border-[#123a3a] px-4 py-3">
          <h2 className="text-xl uppercase text-[#f1f7f3]">Commit a log</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 p-3">
          <div className="relative">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the memory, event, or daily reflection."
              className="scifi-scrollbar min-h-28 w-full resize-none border border-[#123a3a] bg-[#071414] px-3 py-3 pr-30 text-sm leading-6 text-white outline-none placeholder:text-[#50706d] focus:border-[#2f8d84]"
            />
            <button
              type="submit"
              aria-label="Commit log"
              className="absolute right-3 top-3 flex bottom-6 w-20 items-center justify-center border border-[#1c5a55] bg-[#0b2424] text-[#d8f5ee] transition hover:cursor-pointer hover:bg-[#123131]"
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
              {body.trim() ? (
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
        </form>
      </aside>
    </main>
  );
}
