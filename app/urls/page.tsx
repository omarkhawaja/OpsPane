import { Nav } from "@/app/components/Nav";
import { prisma } from "@/lib/prisma";
import { createUrl, deleteUrl, requestUrlRefresh } from "./actions";
import { UrlType } from "@/app/generated/prisma/client";

const TYPE_LABEL: Record<UrlType, string> = {
  GITHUB_REPO: "GitHub repo",
  JIRA_BOARD: "Jira board",
  JIRA_TICKET: "Jira ticket",
  CONFLUENCE_PAGE: "Confluence page",
  OTHER: "Other",
};

export default async function UrlsPage() {
  const urls = await prisma.url.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { features: true } },
    },
  });

  const pendingTasks = await prisma.task.findMany({
    where: { status: "PENDING" },
  });
  const pendingByTarget = new Set(pendingTasks.map((t) => t.targetId));

  return (
    <>
      <Nav active="/urls" />
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">URL Index</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Every repo, board, and page you reference elsewhere in OpsPane lives
          here first. Add a URL, then link it from Screen Documentation or
          Feature Completion.
        </p>

        <form
          action={createUrl}
          className="flex flex-wrap gap-2 mb-8 rounded-lg border border-black/10 dark:border-white/15 p-4"
        >
          <input
            name="url"
            required
            placeholder="https://github.com/org/repo"
            className="flex-1 min-w-[240px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          />
          <select
            name="type"
            defaultValue="GITHUB_REPO"
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          >
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            name="description"
            placeholder="One-line description"
            className="flex-1 min-w-[240px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium"
          >
            Add URL
          </button>
        </form>

        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/10 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">URL</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {urls.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-black/50 dark:text-white/50">
                    No URLs yet. Add your first GitHub repo above.
                  </td>
                </tr>
              )}
              {urls.map((u) => (
                <tr key={u.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-2 max-w-[280px] truncate">
                    <a href={u.url} target="_blank" className="underline" rel="noreferrer">
                      {u.url}
                    </a>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{TYPE_LABEL[u.type]}</td>
                  <td className="px-4 py-2">{u.description ?? "—"}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {pendingByTarget.has(u.id) ? (
                      <span className="text-amber-600 dark:text-amber-400">Refresh pending</span>
                    ) : (
                      <span className="text-black/40 dark:text-white/40">Idle</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2 justify-end">
                    <form action={requestUrlRefresh}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="type" value={u.type} />
                      <button
                        type="submit"
                        disabled={pendingByTarget.has(u.id)}
                        className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs disabled:opacity-40"
                      >
                        Refresh
                      </button>
                    </form>
                    <form action={deleteUrl}>
                      <input type="hidden" name="id" value={u.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pendingTasks.length > 0 && (
          <p className="mt-4 text-xs text-black/50 dark:text-white/50">
            {pendingTasks.length} refresh task(s) pending. Ask Claude Code to
            &quot;process pending OpsPane tasks&quot; to fetch real data via
            GitHub/Jira/Confluence and clear them.
          </p>
        )}
      </main>
    </>
  );
}
