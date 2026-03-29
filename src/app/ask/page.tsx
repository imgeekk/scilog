export default function AskPage() {
  return (
    <main className="ml-2 flex min-h-full w-full items-center justify-center border border-[#123a3a] bg-[radial-gradient(circle_at_top,#123331_0%,#091d1d_55%)] px-6 text-white">
      <div className="max-w-2xl border border-[#174543] bg-[#081818]/80 p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#6da6a1]">
          Query interface
        </p>
        <h1 className="mt-3 font-[instrumentserif] text-4xl leading-none text-[#ebfff8]">
          Ask route is staged
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#98b7b3]">
          The archive query experience can sit here next. For now, the logs
          route is fully usable for reading and committing entries.
        </p>
      </div>
    </main>
  );
}
