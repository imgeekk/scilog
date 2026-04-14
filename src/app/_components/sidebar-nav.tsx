"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

const navItems = [
  { href: "/logs", label: "Logs" },
  { href: "/ask", label: "Ask" },
];

type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
};

type SessionState = {
  user: SessionUser | null;
  isPending: boolean;
};

export function SidebarNav() {
  const pathname = usePathname();
  const [session, setSession] = useState<SessionState>({ user: null, isPending: true });

  useEffect(() => {
    authClient.getSession().then(({ data, error }) => {
      if (error) {
        setSession({ user: null, isPending: false });
      } else {
        setSession({ user: data?.user ?? null, isPending: false });
      }
    });
  }, []);

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setSession({ user: null, isPending: false });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`border px-3 py-3 text-sm uppercase transition ${
                isActive
                  ? "border-[#315d59] bg-[#0a2323] text-white"
                  : "border-[#123a3a] bg-[#081918]/90 text-[#89a9a5] hover:bg-[#0a2323] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-[#123a3a] pt-4">
        {session.isPending ? (
          <div className="flex items-center justify-center border border-[#123a3a] bg-[#081918]/90 px-3 py-3">
            <div className="h-4 w-4 animate-spin rounded-full border border-[#2f8d84] border-t-transparent" />
          </div>
        ) : session.user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 border border-[#123a3a] bg-[#081918]/90 px-3 py-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#123a3a] text-xs text-[#ebfff8]">
                  {session.user.name?.[0] || session.user.email[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm text-[#ebfff8]">
                  {session.user.name || session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="border border-[#123a3a] bg-[#081918]/90 px-3 py-2 text-xs uppercase text-[#89a9a5] transition hover:bg-[#0a2323] hover:text-white"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="flex w-full items-center justify-center gap-2 border border-[#1c5a55] bg-[#0b2424] px-3 py-3 text-sm uppercase text-[#d8f5ee] transition hover:bg-[#123131]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </section>
  );
}
