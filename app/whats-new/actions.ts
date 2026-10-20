"use server";

import { revalidatePath } from "next/cache";
import { execSync } from "node:child_process";
import { prisma } from "@/lib/prisma";

function currentCommitSha(): string | null {
  try {
    return execSync("git rev-parse HEAD", { cwd: process.cwd() }).toString().trim();
  } catch {
    return null;
  }
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
