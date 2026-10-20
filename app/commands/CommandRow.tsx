"use client";

import { useState } from "react";
import { CopyButton } from "@/app/components/CopyButton";
import { deleteCommand, updateCommand } from "./actions";

type CommandData = {
  id: string;
  label: string;
  command: string;
  description: string | null;
};

export function CommandRow({ cmd }: { cmd: CommandData }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-black/10 dark:border-white/10">
        <td colSpan={4} className="px-4 py-2">
          <form
            action={async (formData) => {
              await updateCommand(formData);
              setEditing(false);
            }}
            className="flex flex-col gap-2"
          >
            <input type="hidden" name="id" value={cmd.id} />
            <div className="flex gap-2">
              <input
                name="label"
                defaultValue={cmd.label}
                required
                placeholder="Label"
                className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm"
              />
              <input
                name="description"
                defaultValue={cmd.description ?? ""}
                placeholder="Description"
                className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm"
              />
            </div>
            <textarea
              name="command"
              defaultValue={cmd.command}
              required
              rows={2}
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm font-mono"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium">
                Save
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className="border-t border-black/10 dark:border-white/10 align-top"
      data-ops-ref={`command:${cmd.id}`}
      data-ops-label={`Command "${cmd.label}"`}
    >
      <td className="px-4 py-2 font-medium whitespace-nowrap">{cmd.label}</td>
      <td className="px-4 py-2 font-mono text-xs max-w-[360px]">{cmd.command}</td>
      <td className="px-4 py-2 text-black/70 dark:text-white/70">{cmd.description ?? "—"}</td>
      <td className="px-4 py-2 whitespace-nowrap flex gap-2 justify-end">
        <CopyButton text={cmd.command} label="Copy command" />
        <button
          onClick={() => setEditing(true)}
          className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
        >
          Edit
        </button>
        <form action={deleteCommand}>
          <input type="hidden" name="id" value={cmd.id} />
          <button className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}
