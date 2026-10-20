"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createChangeRequest } from "@/app/change-queue/actions";
import { useSpeechToText } from "./useSpeechToText";

/**
 * Global "pointer" tool. Any element tagged with data-ops-ref/data-ops-label
 * becomes clickable while picking mode is on. Clicking one opens a small
 * panel: type what should change and "Add to queue" writes a ChangeRequest
 * row (visible on the Change Queue tab, batchable into one prompt later), or
 * "Just copy reference" does the old one-shot clipboard copy for a quick,
 * one-off ask. There is no live connection to a Claude Code session either
 * way — this only produces something to paste, nothing more.
 */
export function RefPicker() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ ref: string; label: string } | null>(null);
  const [instruction, setInstruction] = useState("");
  const speech = useSpeechToText((text) =>
    setInstruction((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
  );

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

      setSelected({
        ref: target.dataset.opsRef ?? "",
        label: target.dataset.opsLabel ?? target.dataset.opsRef ?? "",
      });
      setInstruction("");
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }

  async function copyOnly() {
    if (!selected) return;
    const text = `opspane-ref: ${selected.ref} (${selected.label})`;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied: ${selected.label}`);
    } catch {
      showToast("Clipboard unavailable");
    }
    setSelected(null);
  }

  async function addToQueue() {
    if (!selected || !instruction.trim()) return;
    const formData = new FormData();
    formData.set("ref", selected.ref);
    formData.set("label", selected.label);
    formData.set("instruction", instruction.trim());
    await createChangeRequest(formData);
    showToast(`Added to queue: ${selected.label}`);
    setSelected(null);
    setInstruction("");
    router.refresh();
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {toast && (
        <div className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs shadow-lg">
          {toast}
        </div>
      )}

      {selected && (
        <div className="w-80 rounded-lg border border-black/15 dark:border-white/20 bg-background p-3 shadow-lg flex flex-col gap-2">
          <p className="text-xs text-black/60 dark:text-white/60">
            Selected: <span className="font-medium text-foreground">{selected.label}</span>
          </p>
          <div className="relative">
            <textarea
              autoFocus
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="What should change here?"
              rows={2}
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 pr-8 text-sm"
            />
            {speech.supported && (
              <button
                type="button"
                onClick={speech.toggle}
                title={speech.listening ? "Stop dictation" : "Dictate (speech to text)"}
                className={`absolute right-1.5 top-1.5 rounded p-1 text-xs ${
                  speech.listening
                    ? "bg-red-500 text-white"
                    : "text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {speech.listening ? "●" : "🎤"}
              </button>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setSelected(null)}
              className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={copyOnly}
              className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs"
            >
              Just copy reference
            </button>
            <button
              onClick={addToQueue}
              disabled={!instruction.trim()}
              className="rounded-md bg-foreground text-background px-2 py-1 text-xs font-medium disabled:opacity-40"
            >
              Add to queue
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setActive((v) => !v);
          setSelected(null);
        }}
        className={`rounded-full px-4 py-2 text-xs font-medium shadow-lg border ${
          active
            ? "bg-foreground text-background border-foreground"
            : "bg-background border-black/15 dark:border-white/20"
        }`}
        title="Click, then click any highlighted element to queue a change or copy a reference"
      >
        {active ? "Pointing: click an element (or click here to stop)" : "Point at element"}
      </button>
    </div>
  );
}
