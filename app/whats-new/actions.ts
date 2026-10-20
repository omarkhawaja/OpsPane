"use server";

import { revalidatePath } from "next/cache";
import { execSync } from "node:child_process";
import { prisma } from "@/lib/prisma";
import { TaskKind } from "@/app/generated/prisma/client";

function currentCommitSha(): string | null {
  try {
    return execSync("git rev-parse HEAD", { cwd: process.cwd() }).toString().trim();
  } catch {
    return null;
  }
}

// One-click alternative to filling out version/title/notes by hand: queues a
// task for a Claude Code session to draft the release entry itself by
// reading `git log` since the last recorded Release's commitSha (or the
// full history if there isn't one yet) and calling prisma.release.create.
export async function requestReleaseNotes() {
  const lastRelease = await prisma.release.findFirst({ orderBy: { id: "desc" } });

  await prisma.task.create({
    data: {
      kind: TaskKind.GENERATE_RELEASE_NOTES,
      targetId: lastRelease?.commitSha ?? "HEAD",
      notes: lastRelease
        ? `Draft a release covering changes since commit ${lastRelease.commitSha} (last recorded: v${lastRelease.version}).`
        : "No prior release recorded — draft one covering the full project history.",
    },
  });

  revalidatePath("/whats-new");
}

export async function createRelease(formData: FormData) {
  const version = String(formData.get("version") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!version || !title) return;

  await prisma.release.create({
    data: { version, title, notes, commitSha: currentCommitSha() },
  });
  revalidatePath("/whats-new");
}

export async function deleteRelease(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.release.delete({ where: { id } });
  revalidatePath("/whats-new");
}
