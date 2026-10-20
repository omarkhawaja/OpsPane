import { CopyButton } from "@/app/components/CopyButton";
import { prisma } from "@/lib/prisma";
import {
  clearDoneChangeRequests,
  deleteChangeRequest,
  markChangeRequestDone,
  reopenChangeRequest,
} from "./actions";
import { CopyQueueButton } from "@/app/components/CopyQueueButton";

export default async function ChangeQueuePage() {
  const requests = await prisma.changeRequest.findMany({
    orderBy: { createdAt: "asc" },
  });
  const pending = requests.filter((r) => r.status === "PENDING");
  const done = requests.filter((r) => r.status === "DONE");

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">Change Queue</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Point at an element (bottom-right &quot;Point at element&quot;
          button), describe what should change, and it lands here instead of
          just your clipboard. Queue up several changes across different
          parts of the app, then copy them all as one batched prompt instead
          of a point-copy-paste-describe round trip per element.
        </p>

        <div className="flex items-center gap-2 mb-8">
          <CopyQueueButton items={pending} />
          {done.length > 0 && (
            <form action={clearDoneChangeRequests}>
              <button className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 text-sm">
                Clear {done.length} done
              </button>
            </form>
          )}
        </div>

        <section className="mb-10">
          <h2 className="font-medium mb-3 text-sm">
            Pending ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-black/50 dark:text-white/50">
              Nothing queued. Use the pointer tool to add a change request.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {pending.map((r, i) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-black/10 dark:border-white/15 p-4"
                  data-ops-ref={`change-request:${r.id}`}
                  data-ops-label={`Change request #${i + 1}: ${r.label}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs font-mono">
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm">{r.label}</span>
                      <span className="text-xs text-black/40 dark:text-white/40 font-mono">
                        {r.ref}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CopyButton
                        text={`[${r.label}] (ref: ${r.ref}) — ${r.instruction}`}
                      />
                      <form action={markChangeRequestDone}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
                          Mark done
                        </button>
                      </form>
                      <form action={deleteChangeRequest}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="text-sm text-black/80 dark:text-white/80">
                    {r.instruction}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {done.length > 0 && (
          <section>
            <h2 className="font-medium mb-3 text-sm">Done ({done.length})</h2>
            <div className="flex flex-col gap-2">
              {done.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-black/10 dark:border-white/15 p-4 opacity-60"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm line-through">{r.label}</span>
                      <span className="text-xs text-black/40 dark:text-white/40 font-mono">
                        {r.ref}
                      </span>
                    </div>
                    <form action={reopenChangeRequest}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
                        Reopen
                      </button>
                    </form>
                  </div>
                  <p className="text-sm text-black/60 dark:text-white/60">{r.instruction}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
