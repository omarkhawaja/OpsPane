import { prisma } from "@/lib/prisma";
import { deleteAnalysisVersion, recordAnalysisVersion, requestReanalysis } from "./actions";

type ScreenSnapshot = {
  name: string;
  route: string | null;
  frontend: string | null;
  backend: string | null;
  dataSources: { kind: string; label: string }[];
};

type FeatureSnapshot = { name: string; description: string | null };

function parseScreens(json: string): ScreenSnapshot[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function parseFeatures(json: string): FeatureSnapshot[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export default async function AnalyzerPage(props: PageProps<"/analyzer">) {
  const sp = await props.searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  const repos = await prisma.repo.findMany({ orderBy: { name: "asc" } });
  if (repos.length === 0) {
    return (
      <>
        <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
          <h1 className="text-xl font-semibold mb-1">Repository Analyzer</h1>
          <p className="text-sm text-black/50 dark:text-white/50">
            No repos yet. Add a GitHub repo URL on the{" "}
            <a href="/urls" className="underline">
              URL Index
            </a>{" "}
            tab first.
          </p>
        </main>
      </>
    );
  }

  const selectedRepoId = str(sp.repo) ?? repos[0].id;
  const versions = await prisma.repoAnalysisVersion.findMany({
    where: { repoId: selectedRepoId },
    orderBy: { versionNumber: "desc" },
  });
  const selectedVersionNum = str(sp.version)
    ? Number(str(sp.version))
    : versions[0]?.versionNumber;
  const selectedVersion = versions.find((v) => v.versionNumber === selectedVersionNum) ?? versions[0];
  const selectedRepo = repos.find((r) => r.id === selectedRepoId)!;

  const pendingScan = await prisma.task.findFirst({
    where: { kind: "REPO_SCAN", targetId: selectedRepoId, status: "PENDING" },
  });

  // Comparer
  const repoAId = str(sp.repoA) ?? repos[0].id;
  const repoBId = str(sp.repoB) ?? repos[Math.min(1, repos.length - 1)].id;
  const [versionsA, versionsB] = await Promise.all([
    prisma.repoAnalysisVersion.findMany({ where: { repoId: repoAId }, orderBy: { versionNumber: "desc" } }),
    prisma.repoAnalysisVersion.findMany({ where: { repoId: repoBId }, orderBy: { versionNumber: "desc" } }),
  ]);
  const versionANum = str(sp.versionA) ? Number(str(sp.versionA)) : versionsA[0]?.versionNumber;
  const versionBNum = str(sp.versionB) ? Number(str(sp.versionB)) : versionsB[0]?.versionNumber;
  const versionA = versionsA.find((v) => v.versionNumber === versionANum);
  const versionB = versionsB.find((v) => v.versionNumber === versionBNum);

  let comparison: {
    screensCommon: string[];
    screensOnlyA: string[];
    screensOnlyB: string[];
    featuresCommon: string[];
    featuresOnlyA: string[];
    featuresOnlyB: string[];
  } | null = null;

  if (versionA && versionB) {
    const screensA = new Set(parseScreens(versionA.screensJson).map((s) => s.name));
    const screensB = new Set(parseScreens(versionB.screensJson).map((s) => s.name));
    const featuresA = new Set(parseFeatures(versionA.featuresJson).map((f) => f.name));
    const featuresB = new Set(parseFeatures(versionB.featuresJson).map((f) => f.name));

    comparison = {
      screensCommon: [...screensA].filter((s) => screensB.has(s)),
      screensOnlyA: [...screensA].filter((s) => !screensB.has(s)),
      screensOnlyB: [...screensB].filter((s) => !screensA.has(s)),
      featuresCommon: [...featuresA].filter((f) => featuresB.has(f)),
      featuresOnlyA: [...featuresA].filter((f) => !featuresB.has(f)),
      featuresOnlyB: [...featuresB].filter((f) => !featuresA.has(f)),
    };
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">Repository Analyzer</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Versioned snapshots of a repo&apos;s analysis — screens, components,
          data sources, and extracted features. Re-analysis never overwrites
          history: each snapshot is a new version, and the latest opens by
          default.
        </p>

        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <form className="flex items-center gap-3 flex-wrap" action="/analyzer">
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
            {versions.length > 0 && (
              <>
                <label className="text-sm font-medium" htmlFor="version">
                  Version
                </label>
                <select
                  id="version"
                  name="version"
                  defaultValue={String(selectedVersion?.versionNumber ?? "")}
                  className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.versionNumber}>
                      v{v.versionNumber} — {v.createdAt.toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </>
            )}
            <button className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 text-sm">
              View
            </button>
          </form>
          <form action={requestReanalysis} className="ml-auto">
            <input type="hidden" name="repoId" value={selectedRepoId} />
            <button
              disabled={!!pendingScan}
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 text-sm disabled:opacity-40"
            >
              {pendingScan ? "Re-analysis pending" : "Request re-analysis"}
            </button>
          </form>
        </div>

        {selectedVersion ? (
          <div
            className="mb-8"
            data-ops-ref={`analysis-version:${selectedVersion.id}`}
            data-ops-label={`${selectedRepo.name} analysis v${selectedVersion.versionNumber}`}
          >
            <section className="mb-6 rounded-lg border border-black/10 dark:border-white/15 p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium">
                  {selectedRepo.name} — v{selectedVersion.versionNumber}
                </h2>
                <span className="text-xs text-black/40 dark:text-white/40">
                  recorded {selectedVersion.createdAt.toLocaleString()}
                </span>
              </div>
              {selectedVersion.summary && (
                <p className="text-sm text-black/70 dark:text-white/70 mb-2">{selectedVersion.summary}</p>
              )}
              <div className="flex gap-4 text-xs">
                <span className={selectedVersion.hasSsoAd ? "text-green-600 dark:text-green-400" : "text-black/40 dark:text-white/40"}>
                  {selectedVersion.hasSsoAd ? "✓" : "✗"} SSO / Active Directory
                </span>
                <span className={selectedVersion.isMicroservice ? "text-green-600 dark:text-green-400" : "text-black/40 dark:text-white/40"}>
                  {selectedVersion.isMicroservice ? "✓" : "✗"} Microservice split
                </span>
              </div>
              {selectedVersion.notes && (
                <p className="mt-2 text-xs text-black/50 dark:text-white/50">Notes: {selectedVersion.notes}</p>
              )}
            </section>

            <section className="mb-6">
              <h3 className="font-medium mb-2 text-sm">Screens ({parseScreens(selectedVersion.screensJson).length})</h3>
              <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
                <table className="w-full text-sm">
                  <thead className="bg-black/5 dark:bg-white/10 text-left">
                    <tr>
                      <th className="px-4 py-2 font-medium">Screen</th>
                      <th className="px-4 py-2 font-medium">Route</th>
                      <th className="px-4 py-2 font-medium">Front-end</th>
                      <th className="px-4 py-2 font-medium">Back-end</th>
                      <th className="px-4 py-2 font-medium">Data sources</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseScreens(selectedVersion.screensJson).map((s, i) => (
                      <tr key={i} className="border-t border-black/10 dark:border-white/10 align-top">
                        <td className="px-4 py-2 font-medium whitespace-nowrap">{s.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-black/60 dark:text-white/60">{s.route ?? "—"}</td>
                        <td className="px-4 py-2 max-w-[180px] whitespace-pre-wrap">{s.frontend ?? "—"}</td>
                        <td className="px-4 py-2 max-w-[180px] whitespace-pre-wrap">{s.backend ?? "—"}</td>
                        <td className="px-4 py-2">
                          {s.dataSources.map((d, j) => (
                            <div key={j}>
                              <span className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-xs mr-1">{d.kind}</span>
                              {d.label}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-6">
              <h3 className="font-medium mb-2 text-sm">Features ({parseFeatures(selectedVersion.featuresJson).length})</h3>
              <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
                <table className="w-full text-sm">
                  <thead className="bg-black/5 dark:bg-white/10 text-left">
                    <tr>
                      <th className="px-4 py-2 font-medium">Feature</th>
                      <th className="px-4 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseFeatures(selectedVersion.featuresJson).length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-4 text-center text-black/50 dark:text-white/50">
                          No features recorded in this version.
                        </td>
                      </tr>
                    )}
                    {parseFeatures(selectedVersion.featuresJson).map((f, i) => (
                      <tr key={i} className="border-t border-black/10 dark:border-white/10">
                        <td className="px-4 py-2 font-medium whitespace-nowrap">{f.name}</td>
                        <td className="px-4 py-2">{f.description ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <p className="mb-8 text-sm text-black/50 dark:text-white/50">
            No analysis versions recorded yet for {selectedRepo.name}.
          </p>
        )}

        <section className="mb-10 rounded-lg border border-black/10 dark:border-white/15 p-4">
          <h3 className="font-medium mb-2 text-sm">Record new version</h3>
          <p className="text-xs text-black/50 dark:text-white/50 mb-3">
            Pulls the current screens/data-sources from the Screen Documentation
            tab for {selectedRepo.name} and freezes them, plus whatever you type
            below, as the next version. List one feature per line, optionally
            &quot;Name: description&quot;.
          </p>
          <form action={recordAnalysisVersion} className="flex flex-col gap-2">
            <input type="hidden" name="repoId" value={selectedRepoId} />
            <textarea
              name="summary"
              defaultValue={selectedVersion?.summary ?? selectedRepo.summary ?? ""}
              placeholder="Summary: stack, overall data sources, deployment model..."
              rows={2}
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="hasSsoAd" defaultChecked={selectedVersion?.hasSsoAd ?? selectedRepo.hasSsoAd} />
                Has SSO / Active Directory integration
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isMicroservice" defaultChecked={selectedVersion?.isMicroservice ?? selectedRepo.isMicroservice} />
                Split into microservices
              </label>
            </div>
            <textarea
              name="features"
              placeholder={"One feature per line, e.g.\nSSO login: Okta SAML integration\nDashboard export"}
              rows={4}
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm font-mono"
            />
            <input
              name="notes"
              placeholder="What changed since the last version (optional)"
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
            <button className="self-end rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
              Record version {((versions[0]?.versionNumber ?? 0) + 1)}
            </button>
          </form>
        </section>

        {versions.length > 0 && (
          <section className="mb-12">
            <h3 className="font-medium mb-2 text-sm">Version history</h3>
            <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
              <table className="w-full text-sm">
                <thead className="bg-black/5 dark:bg-white/10 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Version</th>
                    <th className="px-4 py-2 font-medium">Recorded</th>
                    <th className="px-4 py-2 font-medium">Notes</th>
                    <th className="px-4 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((v) => (
                    <tr key={v.id} className="border-t border-black/10 dark:border-white/10">
                      <td className="px-4 py-2 font-medium">v{v.versionNumber}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{v.createdAt.toLocaleString()}</td>
                      <td className="px-4 py-2">{v.notes ?? "—"}</td>
                      <td className="px-4 py-2 whitespace-nowrap flex gap-2 justify-end">
                        <a
                          href={`/analyzer?repo=${selectedRepoId}&version=${v.versionNumber}`}
                          className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
                        >
                          View
                        </a>
                        <form action={deleteAnalysisVersion}>
                          <input type="hidden" name="id" value={v.id} />
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
          </section>
        )}

        <hr className="border-black/10 dark:border-white/10 mb-10" />

        <section>
          <h2 className="text-lg font-semibold mb-1">Repository Comparer</h2>
          <p className="text-sm text-black/60 dark:text-white/60 mb-4">
            Compare any two recorded versions — two different repos, or two
            versions of the same repo — by matching screen and feature names.
          </p>

          <form action="/analyzer" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <input type="hidden" name="repo" value={selectedRepoId} />
            {selectedVersion && <input type="hidden" name="version" value={selectedVersion.versionNumber} />}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium w-4">A</span>
              <select name="repoA" defaultValue={repoAId} className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm">
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select name="versionA" defaultValue={versionA?.versionNumber ?? ""} className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm">
                {versionsA.map((v) => (
                  <option key={v.id} value={v.versionNumber}>
                    v{v.versionNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium w-4">B</span>
              <select name="repoB" defaultValue={repoBId} className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm">
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select name="versionB" defaultValue={versionB?.versionNumber ?? ""} className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm">
                {versionsB.map((v) => (
                  <option key={v.id} value={v.versionNumber}>
                    v{v.versionNumber}
                  </option>
                ))}
              </select>
            </div>
            <button className="sm:col-span-2 justify-self-end rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
              Compare
            </button>
          </form>

          {!versionA || !versionB ? (
            <p className="text-sm text-black/50 dark:text-white/50">
              Pick two repos that each have at least one recorded version.
            </p>
          ) : (
            comparison && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DiffList title="Screens in both" items={comparison.screensCommon} />
                <DiffCols
                  aLabel={`Screens only in A (${repos.find((r) => r.id === repoAId)?.name})`}
                  aItems={comparison.screensOnlyA}
                  bLabel={`Screens only in B (${repos.find((r) => r.id === repoBId)?.name})`}
                  bItems={comparison.screensOnlyB}
                />
                <DiffList title="Features in both" items={comparison.featuresCommon} />
                <DiffCols
                  aLabel="Features only in A"
                  aItems={comparison.featuresOnlyA}
                  bLabel="Features only in B"
                  bItems={comparison.featuresOnlyB}
                />
              </div>
            )
          )}
        </section>
      </main>
    </>
  );
}

function DiffList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-black/40 dark:text-white/40">None</p>
      ) : (
        <ul className="text-sm space-y-1">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DiffCols({
  aLabel,
  aItems,
  bLabel,
  bItems,
}: {
  aLabel: string;
  aItems: string[];
  bLabel: string;
  bItems: string[];
}) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/15 p-4 grid grid-cols-2 gap-3">
      <div>
        <h4 className="text-xs font-medium mb-2 text-black/60 dark:text-white/60">{aLabel}</h4>
        {aItems.length === 0 ? (
          <p className="text-xs text-black/40 dark:text-white/40">None</p>
        ) : (
          <ul className="text-sm space-y-1">
            {aItems.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4 className="text-xs font-medium mb-2 text-black/60 dark:text-white/60">{bLabel}</h4>
        {bItems.length === 0 ? (
          <p className="text-xs text-black/40 dark:text-white/40">None</p>
        ) : (
          <ul className="text-sm space-y-1">
            {bItems.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
