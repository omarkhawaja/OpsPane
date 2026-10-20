import { prisma } from "@/lib/prisma";
import { createCommand, seedDefaultCommands } from "./actions";
import { CommandRow } from "./CommandRow";

export default async function CommandsPage() {
  const commands = await prisma.command.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">Commands</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Copy-pasteable prompts for a Claude Code session. Click &quot;Copy
          command&quot;, paste it into chat, and Claude performs that action —
          nothing here runs automatically.
        </p>

        {commands.length === 0 ? (
          <form action={seedDefaultCommands}>
            <button className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
              Load starter commands
            </button>
          </form>
        ) : (
          <>
            <form
              action={createCommand}
              className="flex flex-col gap-2 mb-6 rounded-lg border border-black/10 dark:border-white/15 p-4"
            >
              <div className="flex gap-2">
                <input name="label" required placeholder="Label" className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
                <input name="description" placeholder="Description (optional)" className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
              </div>
              <textarea
                name="command"
                required
                rows={2}
                placeholder="The exact text to paste into Claude Code..."
                className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm font-mono"
              />
              <button className="self-end rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
                Add command
              </button>
            </form>

            <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
              <table className="w-full text-sm">
                <thead className="bg-black/5 dark:bg-white/10 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Label</th>
                    <th className="px-4 py-2 font-medium">Command</th>
                    <th className="px-4 py-2 font-medium">What it does</th>
                    <th className="px-4 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {commands.map((c) => (
                    <CommandRow key={c.id} cmd={c} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
}
