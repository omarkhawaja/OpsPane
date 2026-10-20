import { Nav } from "@/app/components/Nav";
import { CopyButton } from "@/app/components/CopyButton";
import { saveAppMd } from "./actions";
import { readFile } from "node:fs/promises";
import path from "node:path";

const MD_PATH = path.join(process.cwd(), "OPSPANE.md");

export default async function AppMdPage() {
  let content = "";
  try {
    content = await readFile(MD_PATH, "utf-8");
  } catch {
    content = "# OpsPane\n\n(No OPSPANE.md found yet — save this tab to create it.)\n";
  }

  return (
    <>
      <Nav active="/app-md" />
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="text-xl font-semibold">App MD File</h1>
          <CopyButton text={content} label="Copy full file" />
        </div>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          OPSPANE.md lives at the repo root. It&apos;s the self-describing
          architecture doc for this app — what it is, how it&apos;s built,
          what exists. Claude Code reads it at the start of a new session to
          pick up where things left off, and should update it whenever a
          feature or architectural decision changes. Edit it here or in your
          editor — both point at the same file.
        </p>

        <form action={saveAppMd} className="flex flex-col gap-3">
          <textarea
            name="content"
            defaultValue={content}
            rows={32}
            spellCheck={false}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 font-mono text-xs leading-relaxed"
          />
          <button
            type="submit"
            className="self-end rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium"
          >
            Save OPSPANE.md
          </button>
        </form>
      </main>
    </>
  );
}
