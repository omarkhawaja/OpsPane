import { Nav } from "@/app/components/Nav";
import { prisma } from "@/lib/prisma";
import { createCommunication } from "./actions";
import { CommunicationCard } from "./CommunicationCard";

const CATEGORY_OPTIONS = [
  ["EMAIL", "Email"],
  ["MESSAGE", "Message"],
  ["MEETING_TRANSCRIPT", "Meeting transcript"],
  ["DOCUMENTATION", "Documentation"],
  ["OTHER", "Other"],
] as const;

export default async function CommunicationsPage() {
  const [comms, repos] = await Promise.all([
    prisma.communication.findMany({ orderBy: { id: "desc" } }),
    prisma.repo.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <Nav active="/communications" />
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">Team Communication Tracker</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Paste in emails, chat messages, meeting transcripts, or any other
          documentation. Each one gets a permanent, unique reference
          (&quot;C-&lt;number&gt;&quot;) so you — or Claude — can point at a
          specific piece of communication later. Nothing here is summarized or
          altered; it&apos;s stored verbatim, in sequence.
        </p>

        <form
          action={createCommunication}
          className="flex flex-col gap-2 mb-8 rounded-lg border border-black/10 dark:border-white/15 p-4"
        >
          <div className="flex flex-wrap gap-2">
            <select
              name="category"
              defaultValue="EMAIL"
              className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            >
              {CATEGORY_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <input
              name="title"
              placeholder="Title (optional)"
              className="flex-1 min-w-[180px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
            <input
              name="source"
              placeholder="Source (optional) — e.g. sender, meeting name"
              className="flex-1 min-w-[220px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
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
          </div>
          <textarea
            name="content"
            required
            rows={5}
            placeholder="Paste the email, message, or transcript here..."
            className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm font-mono"
          />
          <button className="self-end rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
            Add to tracker
          </button>
        </form>

        <div className="flex flex-col gap-3">
          {comms.length === 0 && (
            <p className="text-sm text-center text-black/50 dark:text-white/50 py-8">
              Nothing tracked yet. Paste your first email or transcript above.
            </p>
          )}
          {comms.map((c) => (
            <CommunicationCard key={c.id} comm={c} repos={repos} />
          ))}
        </div>
      </main>
    </>
  );
}
