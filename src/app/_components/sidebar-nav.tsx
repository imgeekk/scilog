"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/logs", label: "Logs" },
  { href: "/ask", label: "Ask" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <section className="flex flex-col gap-2">
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
    </section>
  );
}
