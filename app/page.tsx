import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-12 flex-1">
        <h1 className="text-2xl font-semibold mb-2">OpsPane</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-8 max-w-2xl">
          One place to track repo documentation, screen-level architecture, and
          feature completion across the teams/repos you manage. Everything
          lives in a local database — nothing refreshes from GitHub, Jira, or
          Confluence until you ask Claude Code to do it.
        </p>
        {/* Ordered by expected daily-use frequency, matching the sidebar nav. */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card
            href="/features"
            title="Feature Completion"
            body="Features linked to Jira tickets, with a completion % you refresh on demand."
          />
          <Card
            href="/team"
            title="Team"
            body="Who's on each project, their role, and a copy-clip button for their email."
          />
          <Card
            href="/urls"
            title="Documentation"
            body="Every GitHub repo, Jira board, Confluence page, and uploaded document (PDF, PowerPoint, etc.) you track."
          />
          <Card
            href="/communications"
            title="Communications"
            body="Paste emails, messages, and meeting transcripts — each one gets a permanent reference you can point Claude at."
          />
          <Card
            href="/screens"
            title="Screen Documentation"
            body="Per-repo screen table: front-end/back-end components and data sources per screen, plus navigation flow."
          />
          <Card
            href="/analyzer"
            title="Repository Analyzer"
            body="Versioned analysis snapshots per repo, plus a comparer to diff two repos or two versions."
          />
          <Card
            href="/app-md"
            title="App MD File"
            body="This app's own self-describing architecture doc — editable here, read by Claude Code at session start."
          />
          <Card
            href="/commands"
            title="Commands"
            body="Copy-pasteable prompts for a Claude Code session, with a one-click copy button."
          />
          <Card
            href="/change-queue"
            title="Change Queue"
            body="Point at an element, describe the change, and batch several of them into one prompt."
          />
          <Card
            href="/help"
            title="Help"
            body="What every tab does, when to use it, and how the whole app fits together."
          />
          <Card
            href="/whats-new"
            title="What's New"
            body="A changelog of shipped features, each tied to the git commit it shipped in."
          />
        </div>
      </main>
    </>
  );
}

function Card({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-black/10 dark:border-white/15 p-5 hover:border-black/30 dark:hover:border-white/30 transition-colors"
    >
      <h2 className="font-medium mb-1">{title}</h2>
      <p className="text-sm text-black/60 dark:text-white/60">{body}</p>
    </Link>
  );
}
