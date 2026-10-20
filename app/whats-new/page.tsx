import { CopyButton } from "@/app/components/CopyButton";
import { prisma } from "@/lib/prisma";
import { createRelease, deleteRelease } from "./actions";

export default async function WhatsNewPage() {
  const releases = await prisma.release.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">What&apos;s New</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Every shipped change, in order, each tied to the git commit it
          shipped in. To roll back to a version, check out its commit SHA —
          this table is an index into git history, not a copy of app state.
        </p>

        <form
          action={createRelease}
          className="flex flex-col gap-2 mb-8 rounded-lg border border-black/10 dark:border-white/15 p-4"
        >
          <div className="flex gap-2">
            <input name="version" required placeholder="Version (e.g. 0.3.0)" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
            <input name="title" required placeholder="Title" className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
          </div>
          <textarea
            name="notes"
            required
            rows={3}
            placeholder={"What shipped, one bullet per line:\n- Added X\n- Fixed Y"}
            className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm font-mono"
          />
          <button className="self-end rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
            Record release
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {releases.length === 0 && (
            <p className="text-sm text-center text-black/50 dark:text-white/50 py-8">
              Nothing recorded yet.
            </p>
          )}
          {releases.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-black/10 dark:border-white/15 p-4"
              data-ops-ref={`release:${r.id}`}
              data-ops-label={`v${r.version} — ${r.title}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="font-mono text-xs rounded bg-black/5 dark:bg-white/10 px-2 py-0.5 mr-2">
                    v{r.version}
                  </span>
                  <span className="font-medium text-sm">{r.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.commitSha && <CopyButton text={r.commitSha} label="Copy SHA" />}
                  <form action={deleteRelease}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm font-sans text-black/80 dark:text-white/80">
                {r.notes}
              </pre>
              <p className="mt-2 text-xs text-black/40 dark:text-white/40">
                {r.createdAt.toLocaleString()}
                {r.commitSha && (
                  <>
                    {" · "}
                    <span className="font-mono">{r.commitSha.slice(0, 10)}</span>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
