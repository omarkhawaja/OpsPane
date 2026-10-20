import { prisma } from "@/lib/prisma";
import {
  addDataSource,
  createScreen,
  createTransition,
  deleteDataSource,
  deleteScreen,
  deleteTransition,
  requestRepoScan,
  updateRepoSummary,
} from "./actions";
import { DataSourceKind } from "@/app/generated/prisma/client";

const KIND_LABEL: Record<DataSourceKind, string> = {
  REAL_DB: "Real DB",
  DUMMY: "Dummy data",
  API: "API",
  UNKNOWN: "Unknown",
};

export default async function ScreensPage(props: PageProps<"/screens">) {
  const searchParams = await props.searchParams;
  const repos = await prisma.repo.findMany({
    include: { url: true },
    orderBy: { name: "asc" },
  });

  const selectedRepoId =
    (typeof searchParams.repo === "string" ? searchParams.repo : undefined) ??
    repos[0]?.id;

  const repo = selectedRepoId
    ? await prisma.repo.findUnique({
        where: { id: selectedRepoId },
        include: {
          screens: {
            orderBy: { sortOrder: "asc" },
            include: { dataSources: true },
          },
          url: true,
        },
      })
    : null;

  const transitions = repo
    ? await prisma.screenTransition.findMany({
        where: { repoId: repo.id },
        include: { fromScreen: true, toScreen: true },
      })
    : [];

  const pendingScan = repo
    ? await prisma.task.findFirst({
        where: { kind: "REPO_SCAN", targetId: repo.id, status: "PENDING" },
      })
    : null;

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">Screen Documentation</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Per-repo breakdown: every screen, its front-end/back-end components,
          its data sources, and how screens link to each other.
        </p>

        {repos.length === 0 ? (
          <p className="text-sm text-black/50 dark:text-white/50">
            No repos yet. Add a GitHub repo URL on the{" "}
            <a href="/urls" className="underline">
              URL Index
            </a>{" "}
            tab first.
          </p>
        ) : (
          <>
            <form className="mb-6 flex items-center gap-3" action="/screens">
              <label className="text-sm font-medium" htmlFor="repo">
                Repo
              </label>
              <select
                id="repo"
                name="repo"
                defaultValue={selectedRepoId}
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              >
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 text-sm">
                View
              </button>
            </form>

            {repo && (
              <>
                {/* High-level app table */}
                <section
                  className="mb-8 rounded-lg border border-black/10 dark:border-white/15 p-5"
                  data-ops-ref={`repo:${repo.id}`}
                  data-ops-label={`Repo "${repo.name}" summary`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="font-medium">{repo.name}</h2>
                    <form action={requestRepoScan}>
                      <input type="hidden" name="repoId" value={repo.id} />
                      <button
                        type="submit"
                        disabled={!!pendingScan}
                        className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs disabled:opacity-40"
                      >
                        {pendingScan ? "Scan pending" : "Request repo scan"}
                      </button>
                    </form>
                  </div>
                  <form action={updateRepoSummary} className="grid gap-3">
                    <input type="hidden" name="repoId" value={repo.id} />
                    <textarea
                      name="summary"
                      defaultValue={repo.summary ?? ""}
                      placeholder="High-level summary: stack, overall data sources, deployment model..."
                      className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                      rows={2}
                    />
                    <div className="flex items-center gap-6 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hasSsoAd"
                          defaultChecked={repo.hasSsoAd}
                        />
                        Has SSO / Active Directory integration
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isMicroservice"
                          defaultChecked={repo.isMicroservice}
                        />
                        Split into microservices
                      </label>
                      <button
                        type="submit"
                        className="ml-auto rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                  {repo.lastScannedAt && (
                    <p className="mt-2 text-xs text-black/40 dark:text-white/40">
                      Last scanned {repo.lastScannedAt.toLocaleString()}
                    </p>
                  )}
                </section>

                {/* Screens table */}
                <section className="mb-8">
                  <h3 className="font-medium mb-3">Screens</h3>
                  <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15 mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-black/5 dark:bg-white/10 text-left">
                        <tr>
                          <th className="px-4 py-2 font-medium">Screen</th>
                          <th className="px-4 py-2 font-medium">Route</th>
                          <th className="px-4 py-2 font-medium">Front-end</th>
                          <th className="px-4 py-2 font-medium">Back-end</th>
                          <th className="px-4 py-2 font-medium">Data sources</th>
                          <th className="px-4 py-2 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {repo.screens.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-black/50 dark:text-white/50">
                              No screens yet. Add one below.
                            </td>
                          </tr>
                        )}
                        {repo.screens.map((s) => (
                          <tr
                            key={s.id}
                            className="border-t border-black/10 dark:border-white/10 align-top"
                            data-ops-ref={`screen:${s.id}`}
                            data-ops-label={`Screen "${s.name}" (${repo.name})`}
                          >
                            <td className="px-4 py-2 font-medium whitespace-nowrap">{s.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-black/60 dark:text-white/60">
                              {s.route ?? "—"}
                            </td>
                            <td className="px-4 py-2 max-w-[180px] whitespace-pre-wrap">{s.frontend ?? "—"}</td>
                            <td className="px-4 py-2 max-w-[180px] whitespace-pre-wrap">{s.backend ?? "—"}</td>
                            <td className="px-4 py-2 min-w-[220px]">
                              <ul className="space-y-1 mb-2">
                                {s.dataSources.map((ds) => (
                                  <li key={ds.id} className="flex items-center gap-2">
                                    <span className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-xs">
                                      {KIND_LABEL[ds.kind]}
                                    </span>
                                    <span className="flex-1">{ds.label}</span>
                                    <form action={deleteDataSource}>
                                      <input type="hidden" name="id" value={ds.id} />
                                      <button className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                                        ×
                                      </button>
                                    </form>
                                  </li>
                                ))}
                              </ul>
                              <form action={addDataSource} className="flex gap-1">
                                <input type="hidden" name="screenId" value={s.id} />
                                <select name="kind" className="rounded border border-black/15 dark:border-white/20 bg-transparent text-xs px-1">
                                  {Object.entries(KIND_LABEL).map(([v, l]) => (
                                    <option key={v} value={v}>
                                      {l}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  name="label"
                                  placeholder="e.g. Postgres: users"
                                  className="flex-1 min-w-0 rounded border border-black/15 dark:border-white/20 bg-transparent text-xs px-1"
                                />
                                <button className="rounded border border-black/15 dark:border-white/20 px-1.5 text-xs">
                                  +
                                </button>
                              </form>
                            </td>
                            <td className="px-4 py-2">
                              <form action={deleteScreen}>
                                <input type="hidden" name="id" value={s.id} />
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

                  <form
                    action={createScreen}
                    className="flex flex-wrap gap-2 rounded-lg border border-black/10 dark:border-white/15 p-3"
                  >
                    <input type="hidden" name="repoId" value={repo.id} />
                    <input name="name" required placeholder="Screen name" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm" />
                    <input name="route" placeholder="Route (optional)" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm" />
                    <input name="frontend" placeholder="Front-end components" className="flex-1 min-w-[160px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm" />
                    <input name="backend" placeholder="Back-end components" className="flex-1 min-w-[160px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm" />
                    <button className="rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium">
                      Add screen
                    </button>
                  </form>
                </section>

                {/* Flow */}
                <section>
                  <h3 className="font-medium mb-3">Navigation flow</h3>
                  {transitions.length === 0 ? (
                    <p className="text-sm text-black/50 dark:text-white/50 mb-4">
                      No transitions recorded yet.
                    </p>
                  ) : (
                    <ul className="flex flex-wrap gap-3 mb-4">
                      {transitions.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm"
                        >
                          <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-1">
                            {t.fromScreen.name}
                          </span>
                          <span className="text-black/40 dark:text-white/40">
                            {t.trigger ? `→ (${t.trigger}) →` : "→"}
                          </span>
                          <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-1">
                            {t.toScreen.name}
                          </span>
                          <form action={deleteTransition}>
                            <input type="hidden" name="id" value={t.id} />
                            <button className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                              ×
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}

                  {repo.screens.length >= 2 && (
                    <form
                      action={createTransition}
                      className="flex flex-wrap gap-2 rounded-lg border border-black/10 dark:border-white/15 p-3"
                    >
                      <input type="hidden" name="repoId" value={repo.id} />
                      <select name="fromScreenId" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm">
                        {repo.screens.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <span className="self-center text-sm text-black/40 dark:text-white/40">→</span>
                      <select name="toScreenId" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm">
                        {repo.screens.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <input name="trigger" placeholder="Trigger (e.g. click Save)" className="flex-1 min-w-[160px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm" />
                      <button className="rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium">
                        Add transition
                      </button>
                    </form>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
