import { Nav } from "@/app/components/Nav";
import { prisma } from "@/lib/prisma";
import {
  createFeature,
  deleteFeature,
  requestFeatureRefresh,
  updateFeatureStatus,
} from "./actions";
import { UrlType } from "@/app/generated/prisma/client";

export default async function FeaturesPage() {
  const [features, repos, jiraUrls, pendingTasks] = await Promise.all([
    prisma.feature.findMany({
      include: { repo: true, jiraUrl: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.repo.findMany({ orderBy: { name: "asc" } }),
    prisma.url.findMany({
      where: { type: UrlType.JIRA_TICKET },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({ where: { status: "PENDING", kind: "JIRA_STATUS" } }),
  ]);
  const pendingByTarget = new Set(pendingTasks.map((t) => t.targetId));

  return (
    <>
      <Nav active="/features" />
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">Feature Completion</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Features you&apos;re tracking, each linked to a Jira ticket. Status
          and completion % are cached here — click Refresh to ask Claude Code
          to pull the real ticket state via the Jira MCP.
        </p>

        <form
          action={createFeature}
          className="flex flex-wrap gap-2 mb-8 rounded-lg border border-black/10 dark:border-white/15 p-4"
        >
          <input
            name="name"
            required
            placeholder="Feature name"
            className="flex-1 min-w-[200px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          />
          <select
            name="repoId"
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">No repo</option>
            {repos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            name="jiraUrlId"
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">No Jira ticket</option>
            {jiraUrls.map((u) => (
              <option key={u.id} value={u.id}>
                {u.description ?? u.url}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
            Add feature
          </button>
        </form>

        {jiraUrls.length === 0 && (
          <p className="mb-4 text-xs text-black/50 dark:text-white/50">
            No Jira ticket URLs yet — add one on the{" "}
            <a href="/urls" className="underline">
              URL Index
            </a>{" "}
            tab (type: Jira ticket) to link features to real tickets.
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/10 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Feature</th>
                <th className="px-4 py-2 font-medium">Repo</th>
                <th className="px-4 py-2 font-medium">Jira ticket</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium w-[160px]">Completion</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {features.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-black/50 dark:text-white/50">
                    No features tracked yet.
                  </td>
                </tr>
              )}
              {features.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-black/10 dark:border-white/10 align-top"
                  data-ops-ref={`feature:${f.id}`}
                  data-ops-label={`Feature "${f.name}"`}
                >
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{f.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{f.repo?.name ?? "—"}</td>
                  <td className="px-4 py-2 max-w-[220px] truncate">
                    {f.jiraUrl ? (
                      <a href={f.jiraUrl.url} target="_blank" rel="noreferrer" className="underline">
                        {f.jiraUrl.description ?? f.jiraUrl.url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <form action={updateFeatureStatus} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={f.id} />
                      <input
                        name="status"
                        defaultValue={f.status ?? ""}
                        placeholder="e.g. In Progress"
                        className="w-28 rounded border border-black/15 dark:border-white/20 bg-transparent px-1.5 py-1 text-xs"
                      />
                      <input
                        name="completionPct"
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={f.completionPct ?? ""}
                        placeholder="%"
                        className="w-14 rounded border border-black/15 dark:border-white/20 bg-transparent px-1.5 py-1 text-xs"
                      />
                      <button className="rounded border border-black/15 dark:border-white/20 px-1.5 py-1 text-xs">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${f.completionPct ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-black/50 dark:text-white/50">
                      {f.completionPct != null ? `${f.completionPct}%` : "no data"}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2 justify-end">
                    <form action={requestFeatureRefresh}>
                      <input type="hidden" name="id" value={f.id} />
                      <button
                        disabled={pendingByTarget.has(f.id) || !f.jiraUrl}
                        className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs disabled:opacity-40"
                      >
                        {pendingByTarget.has(f.id) ? "Pending" : "Refresh"}
                      </button>
                    </form>
                    <form action={deleteFeature}>
                      <input type="hidden" name="id" value={f.id} />
                      <button className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
