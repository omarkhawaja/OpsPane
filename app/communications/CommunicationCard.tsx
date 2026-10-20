"use client";

import { useState } from "react";
import { CopyButton } from "@/app/components/CopyButton";
import { updateCommunication, deleteCommunication } from "./actions";
import type { CommCategory } from "@/app/generated/prisma/client";

const CATEGORY_LABEL: Record<CommCategory, string> = {
  EMAIL: "Email",
  MESSAGE: "Message",
  MEETING_TRANSCRIPT: "Meeting transcript",
  DOCUMENTATION: "Documentation",
  OTHER: "Other",
};

type Communication = {
  id: number;
  category: CommCategory;
  title: string | null;
  source: string | null;
  content: string;
  repoId: string | null;
  createdAt: Date;
};

export function CommunicationCard({
  comm,
  repos,
}: {
  comm: Communication;
  repos: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const refCode = `C-${comm.id}`;

  if (!editing) {
    return (
      <div
        className="rounded-lg border border-black/10 dark:border-white/15 p-4"
        data-ops-ref={`comm:${comm.id}`}
        data-ops-label={`${refCode}${comm.title ? ` — ${comm.title}` : ""}`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs font-mono">
              {refCode}
            </span>
            <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs">
              {CATEGORY_LABEL[comm.category]}
            </span>
            {comm.title && <span className="font-medium text-sm">{comm.title}</span>}
            {comm.source && (
              <span className="text-xs text-black/50 dark:text-white/50">from {comm.source}</span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <CopyButton text={comm.content} />
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
            >
              Edit
            </button>
            <form action={deleteCommunication}>
              <input type="hidden" name="id" value={comm.id} />
              <button className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs">
                Delete
              </button>
            </form>
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-sm font-sans text-black/80 dark:text-white/80 max-h-64 overflow-y-auto">
          {comm.content}
        </pre>
        <p className="mt-2 text-xs text-black/40 dark:text-white/40">
          {comm.createdAt.toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateCommunication(formData);
        setEditing(false);
      }}
      className="rounded-lg border border-black/30 dark:border-white/30 p-4 flex flex-col gap-2"
    >
      <input type="hidden" name="id" value={comm.id} />
      <div className="flex items-center gap-2">
        <span className="rounded bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs font-mono">
          {refCode}
        </span>
        <select
          name="category"
          defaultValue={comm.category}
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-xs"
        >
          {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <input
          name="title"
          defaultValue={comm.title ?? ""}
          placeholder="Title (optional)"
          className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-xs"
        />
        <input
          name="source"
          defaultValue={comm.source ?? ""}
          placeholder="Source (optional)"
          className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-xs"
        />
        <select
          name="repoId"
          defaultValue={comm.repoId ?? ""}
          className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-xs"
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
        defaultValue={comm.content}
        rows={8}
        className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm font-mono"
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
  );
}
