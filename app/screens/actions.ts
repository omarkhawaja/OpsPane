"use server";

import { revalidatePath } from "next/cache";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DataSourceKind, TaskKind } from "@/app/generated/prisma/client";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function createScreen(formData: FormData) {
  const repoId = String(formData.get("repoId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const route = String(formData.get("route") ?? "").trim() || null;
  const frontend = String(formData.get("frontend") ?? "").trim() || null;
  const backend = String(formData.get("backend") ?? "").trim() || null;
  if (!repoId || !name) return;

  await prisma.screen.create({
    data: { repoId, name, route, frontend, backend },
  });

  revalidatePath("/screens");
}

export async function deleteScreen(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.screen.delete({ where: { id } });

  if (existing.screenshotUrl?.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", existing.screenshotUrl)).catch(() => {});
  }

  revalidatePath("/screens");
}

export async function uploadScreenshot(formData: FormData) {
  const screenId = String(formData.get("screenId") ?? "");
  const file = formData.get("file");
  if (!screenId || !(file instanceof File) || file.size === 0) return;

  const existing = await prisma.screen.findUnique({ where: { id: screenId } });
  if (!existing) return;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const storedName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  if (existing.screenshotUrl?.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", existing.screenshotUrl)).catch(() => {});
  }

  await prisma.screen.update({
    where: { id: screenId },
    data: { screenshotUrl: `/uploads/${storedName}` },
  });
  revalidatePath("/screens");
}

export async function removeScreenshot(formData: FormData) {
  const screenId = String(formData.get("screenId") ?? "");
  if (!screenId) return;

  const existing = await prisma.screen.findUnique({ where: { id: screenId } });
  if (!existing?.screenshotUrl) return;

  if (existing.screenshotUrl.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", existing.screenshotUrl)).catch(() => {});
  }
  await prisma.screen.update({ where: { id: screenId }, data: { screenshotUrl: null } });
  revalidatePath("/screens");
}

export async function addDataSource(formData: FormData) {
  const screenId = String(formData.get("screenId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const kind = String(formData.get("kind") ?? "UNKNOWN") as DataSourceKind;
  if (!screenId || !label) return;

  await prisma.screenDataSource.create({
    data: { screenId, label, kind },
  });
  revalidatePath("/screens");
}

export async function deleteDataSource(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.screenDataSource.delete({ where: { id } });
  revalidatePath("/screens");
}

export async function createTransition(formData: FormData) {
  const repoId = String(formData.get("repoId") ?? "");
  const fromScreenId = String(formData.get("fromScreenId") ?? "");
  const toScreenId = String(formData.get("toScreenId") ?? "");
  const trigger = String(formData.get("trigger") ?? "").trim() || null;
  if (!repoId || !fromScreenId || !toScreenId) return;

  await prisma.screenTransition.create({
    data: { repoId, fromScreenId, toScreenId, trigger },
  });
  revalidatePath("/screens");
}

export async function deleteTransition(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.screenTransition.delete({ where: { id } });
  revalidatePath("/screens");
}

export async function requestRepoScan(formData: FormData) {
  const repoId = String(formData.get("repoId") ?? "");
  if (!repoId) return;

  await prisma.task.create({
    data: { kind: TaskKind.REPO_SCAN, targetId: repoId },
  });
  revalidatePath("/screens");
}

export async function updateRepoSummary(formData: FormData) {
  const repoId = String(formData.get("repoId") ?? "");
  const summary = String(formData.get("summary") ?? "").trim() || null;
  if (!repoId) return;

  await prisma.repo.update({
    where: { id: repoId },
    data: { summary },
  });
  revalidatePath("/screens");
}
