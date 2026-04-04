"use client";

import { motion } from "motion/react";

export function LogsLoadingShell() {
  return (
    <main className="ml-2 flex min-h-full w-full flex-col gap-2 overflow-hidden bg-[#091d1d] text-white">
      <section className="flex min-h-0 flex-1 flex-col border border-[#123a3a] bg-[radial-gradient(circle_at_top,#103733_0%,#091d1d_55%)]">
        <div className="grid gap-3 border-b border-[#123a3a] px-4 py-4 lg:grid-cols-[1.8fr_auto]">
          <RevealBlock className="h-22 border border-[#123a3a] bg-[#081918]/70" />
          <div className="grid auto-rows-min grid-cols-3 gap-2 self-start lg:min-w-[300px]">
            <RevealBlock className="h-18 border border-[#123a3a] bg-[#0a2323]" delay={0.04} />
            <RevealBlock className="h-18 border border-[#123a3a] bg-[#0a2323]" delay={0.08} />
            <RevealBlock className="h-18 border border-[#123a3a] bg-[#0a2323]" delay={0.12} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="grid gap-3 lg:grid-cols-[92px_1fr] lg:items-start"
            >
              <RevealBlock className="h-14 bg-transparent" delay={0.1 + index * 0.04} />
              <RevealBlock
                className="h-28 border border-[#123a3a] bg-[#081918]/90"
                delay={0.14 + index * 0.05}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border border-[#123a3a] bg-[linear-gradient(180deg,#0c2222_0%,#081616_100%)] p-3">
        <RevealBlock className="h-28 border border-[#123a3a] bg-[#071414]" delay={0.18} />
      </section>
    </main>
  );
}

export function AskLoadingShell() {
  return (
    <main className="ml-2 grid min-h-full w-full grid-cols-1 gap-2 overflow-hidden bg-[#091d1d] text-white lg:grid-cols-[0.95fr_1.25fr]">
      <section className="flex flex-col border border-[#123a3a] bg-[radial-gradient(circle_at_top,#123331_0%,#091d1d_55%)]">
        <div className="border-b border-[#123a3a] px-4 py-4">
          <RevealBlock className="h-24 border border-[#123a3a] bg-[#081918]/70" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <RevealBlock className="h-52 border border-[#123a3a] bg-[#081918]/90" delay={0.06} />
          <RevealBlock className="h-8 border border-[#123a3a] bg-[#081918]/60" delay={0.12} />
        </div>
      </section>

      <section className="flex min-h-0 flex-col border border-[#123a3a] bg-[linear-gradient(180deg,#0c2222_0%,#081616_100%)]">
        <div className="border-b border-[#123a3a] px-4 py-4">
          <RevealBlock className="h-18 border border-[#123a3a] bg-[#081918]/70" delay={0.08} />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <RevealBlock className="h-28 border border-[#123a3a] bg-[#081918]/90" delay={0.14} />
          <RevealBlock className="h-22 border border-[#123a3a] bg-[#081918]/90" delay={0.18} />
          <RevealBlock className="h-22 border border-[#123a3a] bg-[#081918]/90" delay={0.22} />
        </div>
      </section>
    </main>
  );
}

function RevealBlock({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`relative origin-left overflow-hidden ${className}`}
      initial={{ opacity: 0, scaleX: 0.001, filter: "brightness(2.4)" }}
      animate={{
        opacity: [0, 0.22, 0.9, 0.4, 1, 0.82, 1],
        scaleX: [0.001, 0.28, 0.88, 1.04, 0.985, 1],
        filter: [
          "brightness(2.4)",
          "brightness(1.75)",
          "brightness(1.15)",
          "brightness(1)",
        ],
      }}
      transition={{ duration: 0.86, delay, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(141,243,210,0.12),transparent_45%,rgba(141,243,210,0.08))]"
        animate={{ opacity: [0.14, 0.7, 0.2], x: ["-12%", "5%", "0%"] }}
        transition={{ duration: 0.72, delay, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(141,243,210,0.22),transparent_28%)]"
        animate={{ opacity: [0.18, 0.62, 0], scaleX: [0.02, 0.86, 1] }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-x-0 top-[38%] h-px bg-[#8df3d2]/70"
        animate={{ opacity: [0, 0.95, 0, 0.75, 0], x: ["-10%", "3%", "-2%", "0%"] }}
        transition={{ duration: 0.36, delay: delay + 0.08, repeat: 1, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
