import { headers } from "next/headers";
import { LogTag } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

import { LogsClient } from "./logs-client";

function LogsOperationalError({ message }: { message: string }) {
  return (
    <main className="ml-2 flex min-h-full w-full items-center justify-center border border-[#123a3a] bg-[radial-gradient(circle_at_top,#103733_0%,#091d1d_55%)] px-6 text-white">
      <div className="max-w-xl border border-[#123a3a] bg-[#081918]/90 p-6 text-sm leading-6 text-[#9eb9b6]">
        {message}
      </div>
    </main>
  );
}

function AuthRequiredNotice() {
  return (
    <main className="ml-2 flex min-h-full w-full items-center justify-center border border-[#123a3a] bg-[radial-gradient(circle_at_top,#103733_0%,#091d1d_55%)] px-6 text-white">
      <div className="max-w-xl space-y-4 border border-[#123a3a] bg-[#081918]/90 p-8 text-center">
        <div className="flex justify-center">
          <svg
            className="h-12 w-12 text-[#4a7a74]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 16l-5-5m5 5m-5-5v12"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#ebfff8]">Access Restricted</h2>
        <p className="text-sm leading-6 text-[#9eb9b6]">
          This archive is secured. You must authenticate with Google to access your personal logs.
        </p>
        <p className="text-xs uppercase tracking-widest text-[#6f918d]">
          Sign in to continue
        </p>
      </div>
    </main>
  );
}

export default async function LogsPage() {
  if (!process.env.DATABASE_URL) {
    return <LogsOperationalError message="DATABASE_URL is missing for the logs backend." />;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <AuthRequiredNotice />;
  }

  let logsData:
    | Array<{
        id: string;
        body: string;
        tag: Lowercase<LogTag>;
        createdAt: string;
      }>
    | null = null;
  let totalWords = 0;
  let databaseError: string | null = null;

  try {
    const databaseLogs = await getPrisma().logEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    totalWords = databaseLogs.reduce((count, log) => {
      return count + log.body.split(/\s+/).filter(Boolean).length;
    }, 0);

    logsData = databaseLogs.map((log) => ({
      id: log.id,
      body: log.body,
      tag: log.tag.toLowerCase() as Lowercase<LogTag>,
      createdAt: log.createdAt.toISOString(),
    }));
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      databaseError =
        "Logs database is reachable, but the expected tables are unavailable. Verify that the latest migration has been applied.";
    } else {
      databaseError =
        "Unable to load logs right now. Check the database connection and try again.";
    }
  }

  if (!logsData || databaseError) {
    return <LogsOperationalError message={databaseError ?? "Unable to load logs."} />;
  }

  return <LogsClient logs={logsData} totalWords={totalWords} />;
}
