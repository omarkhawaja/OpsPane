"use client";

import { useEffect, useState } from "react";

/**
 * Global "pointer" tool. Any element tagged with data-ops-ref/data-ops-label
 * becomes clickable while picking mode is on: a click copies a stable
 * reference string to the clipboard instead of its normal effect, so you can
 * paste it into chat and Claude knows exactly which element you mean. There
 * is no live connection to a Claude Code session — this only produces a
 * copyable pointer, nothing more.
 */
export function RefPicker() {
  const [active, setActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.opsPicking = active ? "true" : "false";
  }, [active]);

  useEffect(() => {
    if (!active) return;

    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-ops-ref]");
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();

      const ref = target.dataset.opsRef ?? "";
      const label = target.dataset.opsLabel ?? ref;
      const text = `opspane-ref: ${ref} (${label})`;

      navigator.clipboard
        .writeText(text)
        .then(() => setToast(`Copied: ${label}`))
        .catch(() => setToast("Clipboard unavailable"));

      window.setTimeout(() => setToast(null), 2000);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {toast && (
        <div className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs shadow-lg">
          {toast}
        </div>
      )}
      <button
        onClick={() => setActive((v) => !v)}
        className={`rounded-full px-4 py-2 text-xs font-medium shadow-lg border ${
          active
            ? "bg-foreground text-background border-foreground"
            : "bg-background border-black/15 dark:border-white/20"
        }`}
        title="Click, then click any highlighted element to copy a reference for Claude"
      >
        {active ? "Pointing: click an element (or click here to stop)" : "Point at element"}
      </button>
    </div>
  );
}
