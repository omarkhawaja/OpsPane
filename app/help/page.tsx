
// Ordered by expected daily-use frequency, matching app/components/Nav.tsx —
// keep the two in sync.
const TABS = [
  {
    name: "Feature Completion",
    href: "/features",
    what: "Features linked to a Jira ticket, with a cached status and completion % shown as a progress bar.",
    when: "Use for tracking delivery status against Jira without leaving the app. Click Refresh to queue a Jira status pull.",
  },
  {
    name: "Team",
    href: "/team",
    what: "Name, role, email, and project for everyone you work with, with a copy-to-clipboard button on every email.",
    when: "Use to look up or share someone's contact info without digging through Slack or an org chart.",
  },
  {
    name: "Documentation",
    href: "/urls",
    what: "Every GitHub repo, Jira board/ticket, and Confluence page you track, plus uploaded documents (PDF, PowerPoint, Word, etc.) — each with a one-line description.",
    when: "Start here for anything new. Add a link or upload a file before referencing it anywhere else — adding a GitHub repo auto-creates the Repo row every other tab reads from.",
  },
  {
    name: "Communications",
    href: "/communications",
    what: "Pasted emails, chat messages, meeting transcripts, and generic docs, stored verbatim with a category and a permanent C-<id> reference.",
    when: "Use whenever you want to keep a decision, instruction, or meeting note referenceable later — by you or by pointing Claude at \"C-14\".",
  },
  {
    name: "Screen Documentation",
    href: "/screens",
    what: "The live, editable view for one repo: a high-level app summary, then a per-screen table of front-end/back-end components, data sources, a screenshot, and screen-to-screen navigation flow.",
    when: "Use this as your working notes while actually documenting a repo. Click \"Record new version\" on the Analyzer tab when you want to lock in a snapshot.",
  },
  {
    name: "Repository Analyzer",
    href: "/analyzer",
    what: "Versioned, frozen snapshots of a repo's screens/data-sources/features, plus a comparer that diffs two repos or two versions of one repo.",
    when: "Use when you want a point-in-time record of a repo's analysis (before/after a migration step), or to see what two similar repos have in common.",
  },
  {
    name: "App MD File",
    href: "/app-md",
    what: "OPSPANE.md itself, readable and editable in-app — this app's own architecture description.",
    when: "Use to check what Claude Code currently believes about this app's shape, or to correct it directly.",
  },
  {
    name: "Commands",
    href: "/commands",
    what: "Copy-pasteable prompts for a Claude Code session, e.g. draining the pending-task queue.",
    when: "Use when you want Claude to do something specific and don't want to type the exact phrasing from memory.",
  },
  {
    name: "Change Queue",
    href: "/change-queue",
    what: "The list the \"Point at element\" pointer tool feeds: click an element, describe what should change, and it's queued here instead of just your clipboard.",
    when: "Use when you want to line up several UI changes across different tabs before handing them all to Claude in one batched prompt, instead of a point-copy-paste-describe round trip per element.",
  },
  {
    name: "Help",
    href: "/help",
    what: "This page — what every tab does and when to reach for it.",
    when: "Use when you forget which tab does what.",
  },
  {
    name: "What's New",
    href: "/whats-new",
    what: "A changelog of shipped features and versions, each tied to the git commit it shipped in.",
    when: "Use to see what changed recently, or to find the commit SHA to check out if you need to roll back.",
  },
] as const;

export default function HelpPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">Help</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          What each tab does and when to use it.
        </p>

        <section className="mb-8 rounded-lg border border-black/10 dark:border-white/15 p-5">
          <h2 className="font-medium mb-2">What OpsPane is</h2>
          <p className="text-sm text-black/70 dark:text-white/70 mb-3">
            OpsPane is a single local dashboard for managing a POC-to-production
            migration and everything around it: what a given codebase actually
            does, how far along it is, who&apos;s working on it, and every
            scrap of communication tied to that work. It replaces jumping
            between GitHub, Jira, Confluence, email, and your own notes for
            the questions you ask every day.
          </p>
          <h2 className="font-medium mb-2">How it&apos;s meant to be used</h2>
          <p className="text-sm text-black/60 dark:text-white/60 mb-2">
            Tabs in the sidebar are ordered by how often you&apos;d actually
            reach for them day to day, not by when they were built:
          </p>
          <ol className="list-decimal list-inside text-sm text-black/70 dark:text-white/70 space-y-1 mb-3">
            <li>
              Check delivery status against Jira on{" "}
              <a href="/features" className="underline">Feature Completion</a>, and look up who owns what on{" "}
              <a href="/team" className="underline">Team</a> — the two things you probably check daily.
            </li>
            <li>
              Add every repo, Jira board/ticket, Confluence page, and uploaded
              document (PDF, PowerPoint, Word, etc.) you care about on{" "}
              <a href="/urls" className="underline">Documentation</a> — everything else links back to it, so add things here first.
            </li>
            <li>
              Keep every relevant email, message, or transcript on{" "}
              <a href="/communications" className="underline">Communications</a> so it&apos;s referenceable later.
            </li>
            <li>
              Document a repo&apos;s screens, components, and data sources on{" "}
              <a href="/screens" className="underline">Screen Documentation</a>, then lock in a point-in-time copy on{" "}
              <a href="/analyzer" className="underline">Repository Analyzer</a> whenever it&apos;s worth freezing (e.g. before/after a migration step).
            </li>
            <li>
              <a href="/app-md" className="underline">App MD File</a> and{" "}
              <a href="/whats-new" className="underline">What&apos;s New</a> are how the app describes itself to a fresh Claude Code session; use{" "}
              <a href="/commands" className="underline">Commands</a> whenever you want Claude to act on any of this (e.g. drain the refresh queue).
            </li>
            <li>
              Making several small UI changes? Use the &quot;Point at
              element&quot; button (bottom-right, on every page), describe
              each one, and they stack up on{" "}
              <a href="/change-queue" className="underline">Change Queue</a> — copy them all as one prompt instead of asking for each one individually.
            </li>
          </ol>
          <p className="text-sm text-black/60 dark:text-white/60">
            Nothing refreshes from an external system on its own — every
            &quot;Refresh&quot; button just queues a task for a Claude Code
            session to actually fulfill, which keeps OpsPane&apos;s own API/
            token usage at zero.
          </p>
        </section>

        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/10 text-left">
              <tr>
                <th className="px-4 py-2 font-medium w-[160px]">Tab</th>
                <th className="px-4 py-2 font-medium">What it does</th>
                <th className="px-4 py-2 font-medium">When to use it</th>
              </tr>
            </thead>
            <tbody>
              {TABS.map((t) => (
                <tr key={t.href} className="border-t border-black/10 dark:border-white/10 align-top">
                  <td className="px-4 py-2 font-medium whitespace-nowrap">
                    <a href={t.href} className="underline">
                      {t.name}
                    </a>
                  </td>
                  <td className="px-4 py-2">{t.what}</td>
                  <td className="px-4 py-2 text-black/70 dark:text-white/70">{t.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
