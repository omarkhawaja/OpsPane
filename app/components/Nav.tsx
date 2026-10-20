"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

// Ordered by expected daily-use frequency (most-used first), per user
// preference — not alphabetically or by build order. What's New always
// stays last. Keep app/help/page.tsx's table in this same order.
const TABS = [
  { href: "/features", label: "Feature Completion" },
  { href: "/team", label: "Team" },
  { href: "/urls", label: "Documentation" },
  { href: "/communications", label: "Communications" },
  { href: "/screens", label: "Screen Documentation" },
  { href: "/analyzer", label: "Repository Analyzer" },
  { href: "/app-md", label: "App MD File" },
  { href: "/commands", label: "Commands" },
  { href: "/change-queue", label: "Change Queue" },
  { href: "/help", label: "Help" },
  { href: "/whats-new", label: "What's New" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-black/10 dark:border-white/15 flex flex-col">
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-4 border-b border-black/10 dark:border-white/15"
      >
        <Logo className="w-7 h-7 text-foreground shrink-0" />
        <span className="font-semibold tracking-tight text-lg">OpsPane</span>
      </Link>
      <nav className="flex flex-col gap-0.5 p-3 overflow-y-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === tab.href
                ? "bg-foreground text-background"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
