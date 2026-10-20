"use server";

import { revalidatePath } from "next/cache";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { TaskKind, UrlType } from "@/app/generated/prisma/client";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function repoNameFromUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/i);
  return match ? match[1].replace(/\.git$/, "") : url;
}

export async function createUrl(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  const type = String(formData.get("type") ?? "OTHER") as UrlType;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!url) return;

  const created = await prisma.url.create({
    data: { url, type, description },
  });

  if (type === UrlType.GITHUB_REPO) {
    await prisma.repo.create({
      data: { urlId: created.id, name: repoNameFromUrl(url) },
    });
  }

  revalidatePath("/urls");
  revalidatePath("/screens");
  revalidatePath("/features");
}

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file");
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!(file instanceof File) || file.size === 0) return;

  await mkdir(UPLOAD_DIR, { recursive: true });

  const storedName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  await prisma.url.create({
    data: {
      url: `/uploads/${storedName}`,
      type: UrlType.FILE,
      description,
      fileName: file.name,
      fileSizeBytes: file.size,
    },
  });

  revalidatePath("/urls");
}

export async function updateUrl(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const type = String(formData.get("type") ?? "OTHER") as UrlType;
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!id || !url) return;

  await prisma.url.update({
    where: { id },
    data: { url, type, description },
  });
  revalidatePath("/urls");
}

export async function deleteUrl(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.url.delete({ where: { id } });

  if (existing.type === UrlType.FILE && existing.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", existing.url)).catch(() => {});
  }

  revalidatePath("/urls");
  revalidatePath("/screens");
  revalidatePath("/features");
}

export async function requestUrlRefresh(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "") as UrlType;
  if (!id) return;

  const kind =
    type === UrlType.GITHUB_REPO
      ? TaskKind.REPO_SCAN
      : type === UrlType.CONFLUENCE_PAGE
        ? TaskKind.CONFLUENCE_SCRAPE
        : TaskKind.JIRA_STATUS;

  await prisma.task.create({
    data: { kind, targetId: id },
  });

  revalidatePath("/urls");
}
