import Link from "next/link";

const TABS = [
  { href: "/urls", label: "URL Index" },
  { href: "/screens", label: "Screen Documentation" },
  { href: "/features", label: "Feature Completion" },
  { href: "/team", label: "Team" },
  { href: "/app-md", label: "App MD File" },
] as const;

export function Nav({ active }: { active: string }) {
  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-8">
        <Link href="/" className="font-semibold tracking-tight">
          OpsPane
        </Link>
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active === tab.href
                  ? "bg-foreground text-background"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
