"use client";

import { useState } from "react";
import { CopyButton } from "@/app/components/CopyButton";
import { deleteMember, updateMember } from "./actions";

type MemberRowData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | null;
  repoId: string | null;
  repo: { name: string } | null;
};

export function MemberRow({
  m,
  repos,
}: {
  m: MemberRowData;
  repos: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-black/10 dark:border-white/10">
        <td colSpan={5} className="px-4 py-2">
          <form
            action={async (formData) => {
              await updateMember(formData);
              setEditing(false);
            }}
            className="flex flex-wrap gap-2 items-center"
          >
            <input type="hidden" name="id" value={m.id} />
            <input name="firstName" defaultValue={m.firstName} required className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm" />
            <input name="lastName" defaultValue={m.lastName} required className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm" />
            <input name="email" type="email" defaultValue={m.email} required className="flex-1 min-w-[180px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm" />
            <input name="role" defaultValue={m.role ?? ""} placeholder="Role" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm" />
            <select name="repoId" defaultValue={m.repoId ?? ""} className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm">
              <option value="">No project</option>
              {repos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs">
              Cancel
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className="border-t border-black/10 dark:border-white/10"
      data-ops-ref={`member:${m.id}`}
      data-ops-label={`${m.firstName} ${m.lastName} (team member)`}
    >
      <td className="px-4 py-2 whitespace-nowrap font-medium">
        {m.firstName} {m.lastName}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">{m.role ?? "—"}</td>
      <td className="px-4 py-2 whitespace-nowrap">{m.repo?.name ?? "—"}</td>
      <td className="px-4 py-2 whitespace-nowrap flex items-center gap-2">
        {m.email}
        <CopyButton text={m.email} />
      </td>
      <td className="px-4 py-2 whitespace-nowrap flex gap-2 justify-end">
        <button onClick={() => setEditing(true)} className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
          Edit
        </button>
        <form action={deleteMember}>
          <input type="hidden" name="id" value={m.id} />
          <button className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}
