"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TaskKind, UrlType } from "@/app/generated/prisma/client";

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
  await prisma.url.delete({ where: { id } });
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
