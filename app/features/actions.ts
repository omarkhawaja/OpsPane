"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TaskKind } from "@/app/generated/prisma/client";

export async function createFeature(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const repoId = String(formData.get("repoId") ?? "") || null;
  const jiraUrlId = String(formData.get("jiraUrlId") ?? "") || null;
  if (!name) return;

  await prisma.feature.create({
    data: { name, repoId, jiraUrlId },
  });
  revalidatePath("/features");
}

export async function deleteFeature(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.feature.delete({ where: { id } });
  revalidatePath("/features");
}

export async function requestFeatureRefresh(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.task.create({
    data: { kind: TaskKind.JIRA_STATUS, targetId: id },
  });
  revalidatePath("/features");
}

export async function updateFeatureStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "").trim() || null;
  const completionPct = formData.get("completionPct")
    ? Number(formData.get("completionPct"))
    : null;
  if (!id) return;

  await prisma.feature.update({
    where: { id },
    data: { status, completionPct, lastCheckedAt: new Date() },
  });
  revalidatePath("/features");
}
