
const TABS = [
  {
    name: "URL Index",
    href: "/urls",
    what: "Every GitHub repo, Jira board/ticket, and Confluence page you track, each with a one-line description.",
    when: "Start here. Add a URL before referencing it anywhere else — adding a GitHub repo auto-creates the Repo row every other tab reads from.",
  },
  {
    name: "Repository Analyzer",
    href: "/analyzer",
    what: "Versioned, frozen snapshots of a repo's screens/data-sources/features, plus a comparer that diffs two repos or two versions of one repo.",
    when: "Use when you want a point-in-time record of a repo's analysis (before/after a migration step), or to see what two similar repos have in common.",
  },
  {
    name: "Screen Documentation",
    href: "/screens",
    what: "The live, editable view for one repo: app-level summary (SSO/AD, microservice flags), a per-screen table of front-end/back-end components and data sources, and screen-to-screen navigation flow.",
    when: "Use this as your working notes while actually documenting a repo. Click \"Record new version\" on the Analyzer tab when you want to lock in a snapshot.",
  },
  {
    name: "Feature Completion",
    href: "/features",
    what: "Features linked to a Jira ticket, with a cached status and completion % shown as a progress bar.",
    when: "Use for tracking delivery status against Jira without leaving the app. Click Refresh to queue a Jira status pull.",
  },
  {
    name: "Communications",
    href: "/communications",
    what: "Pasted emails, chat messages, meeting transcripts, and generic docs, stored verbatim with a category and a permanent C-<id> reference.",
    when: "Use whenever you want to keep a decision, instruction, or meeting note referenceable later — by you or by pointing Claude at \"C-14\".",
  },
  {
    name: "Team",
    href: "/team",
    what: "Name, role, email, and project for everyone you work with, with a copy-to-clipboard button on every email.",
    when: "Use to look up or share someone's contact info without digging through Slack or an org chart.",
  },
  {
    name: "App MD File",
    href: "/app-md",
    what: "OPSPANE.md itself, readable and editable in-app — this app's own architecture description.",
    when: "Use to check what Claude Code currently believes about this app's shape, or to correct it directly.",
  },
  {
    name: "Help",
    href: "/help",
    what: "This page — what every tab does and when to reach for it.",
    when: "Use when you forget which tab does what.",
  },
  {
    name: "Commands",
    href: "/commands",
    what: "Copy-pasteable prompts for a Claude Code session, e.g. draining the pending-task queue.",
    when: "Use when you want Claude to do something specific and don't want to type the exact phrasing from memory.",
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
