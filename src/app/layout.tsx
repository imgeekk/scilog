import type { Metadata } from "next";
import "./globals.css";
import { SidebarNav } from "./_components/sidebar-nav";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Scilog",
  description: "A sci-fi journal interface for personal logs and prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen bg-[#051213] p-2 font-[font] tracking-tight text-white">
        <div className="flex h-full">
          <aside className="flex h-full w-74 flex-col border border-[#123a3a] bg-[radial-gradient(circle_at_top,#103733_0%,#091d1d_58%)]">
              <header className="border-b border-[#123a3a] px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Image src="/image.png" alt="Logo" width={25} height={25} />
                    <h1 className="text-md text-[#ebfff8]">SCILOG</h1>
                  </div>
                  <h1 className="text-sm text-[#6da6a1]">v0.0.1</h1>
                </div>
                <p className="mt-3 text-[10px] uppercase text-[#6da6a1]">
                  Personal archive
                </p>
              </header>
              <div className="flex flex-1 flex-col justify-between px-3 py-3">
                <SidebarNav />
                <section className="border border-[#123a3a] bg-[#081918]/90 px-3 py-3 text-sm uppercase text-[#9eb9b6]">
                  <p>Today - {new Date().toLocaleDateString()}</p>
                </section>
              </div>
              <div className="border-t border-[#123a3a] p-3">
                <button className="w-full border border-[#123a3a] bg-[#081918]/90 p-2 text-sm uppercase text-[#d8f5ee] transition hover:cursor-pointer hover:bg-[#0a2323]">
                  Sign Out
                </button>
              </div>
            </aside>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {children}
            </div>
          </div>
      </body>
    </html>
  );
}
