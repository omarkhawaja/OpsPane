"use client";

import { useState } from "react";

type Item = { ref: string; label: string; instruction: string };

export function buildQueuePrompt(items: Item[]) {
  return [
    "Make the following changes to OpsPane:",
    ...items.map(
      (item, i) => `${i + 1}. [${item.label}] (ref: ${item.ref}) — ${item.instruction}`
    ),
  ].join("\n");
}

export function CopyQueueButton({
  items,
  compact = false,
}: {
  items: Item[];
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const text = buildQueuePrompt(items);

  return (
    <button
      type="button"
      disabled={items.length === 0}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard unavailable — ignore
        }
      }}
      className={
        compact
          ? "rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          : "rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-40"
      }
    >
      {copied
        ? "Copied"
        : compact
          ? `Copy ${items.length} pending change${items.length === 1 ? "" : "s"}`
          : `Copy all ${items.length} pending as one prompt`}
    </button>
  );
}
