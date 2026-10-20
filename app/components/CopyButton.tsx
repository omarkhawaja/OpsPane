"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          // clipboard unavailable — ignore
        }
      }}
      className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10"
      title={text}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
