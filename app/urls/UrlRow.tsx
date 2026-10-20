"use client";

import { useState } from "react";
import { deleteUrl, requestUrlRefresh, updateUrl } from "./actions";
import type { UrlType } from "@/app/generated/prisma/client";

const TYPE_LABEL: Record<UrlType, string> = {
  GITHUB_REPO: "GitHub repo",
  JIRA_BOARD: "Jira board",
  JIRA_TICKET: "Jira ticket",
  CONFLUENCE_PAGE: "Confluence page",
  FILE: "Uploaded file",
  OTHER: "Other",
};

type UrlRowData = {
  id: string;
  url: string;
  type: UrlType;
  description: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UrlRow({ u, isPending }: { u: UrlRowData; isPending: boolean }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-black/10 dark:border-white/10">
        <td colSpan={5} className="px-4 py-2">
          <form
            action={async (formData) => {
              await updateUrl(formData);
              setEditing(false);
            }}
            className="flex flex-wrap gap-2 items-center"
          >
            <input type="hidden" name="id" value={u.id} />
            <input
              name="url"
              defaultValue={u.url}
              required
              readOnly={u.type === "FILE"}
              className="flex-1 min-w-[220px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm disabled:opacity-60"
            />
            <select
              name="type"
              defaultValue={u.type}
              disabled={u.type === "FILE"}
              className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm disabled:opacity-60"
            >
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {u.type === "FILE" && <input type="hidden" name="type" value="FILE" />}
            <input
              name="description"
              defaultValue={u.description ?? ""}
              className="flex-1 min-w-[200px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm"
            />
            <button className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 text-xs"
            >
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
      data-ops-ref={`url:${u.id}`}
      data-ops-label={`${TYPE_LABEL[u.type]}: ${u.type === "FILE" ? (u.fileName ?? u.url) : u.url}`}
    >
      <td className="px-4 py-2 max-w-[280px] truncate">
        {u.type === "FILE" ? (
          <a href={u.url} target="_blank" className="underline" rel="noreferrer">
            {u.fileName ?? u.url}
          </a>
        ) : (
          <a href={u.url} target="_blank" className="underline" rel="noreferrer">
            {u.url}
          </a>
        )}
        {u.type === "FILE" && u.fileSizeBytes != null && (
          <span className="ml-2 text-xs text-black/40 dark:text-white/40">
            {formatBytes(u.fileSizeBytes)}
          </span>
        )}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">{TYPE_LABEL[u.type]}</td>
      <td className="px-4 py-2">{u.description ?? "—"}</td>
      <td className="px-4 py-2 whitespace-nowrap">
        {u.type === "FILE" ? (
          <span className="text-black/40 dark:text-white/40">Stored locally</span>
        ) : isPending ? (
          <span className="text-amber-600 dark:text-amber-400">Refresh pending</span>
        ) : (
          <span className="text-black/40 dark:text-white/40">Idle</span>
        )}
      </td>
      <td className="px-4 py-2 whitespace-nowrap flex gap-2 justify-end">
        {u.type !== "FILE" && (
          <form action={requestUrlRefresh}>
            <input type="hidden" name="id" value={u.id} />
            <input type="hidden" name="type" value={u.type} />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs disabled:opacity-40"
            >
              Refresh
            </button>
          </form>
        )}
        <button
          onClick={() => setEditing(true)}
          className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
        >
          Edit
        </button>
        <form action={deleteUrl}>
          <input type="hidden" name="id" value={u.id} />
          <button
            type="submit"
            className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
          >
            Delete
          </button>
        </form>
      </td>
    </tr>
  );
}
