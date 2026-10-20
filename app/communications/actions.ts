"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CommCategory } from "@/app/generated/prisma/client";

export async function createCommunication(formData: FormData) {
  const category = String(formData.get("category") ?? "OTHER") as CommCategory;
  const title = String(formData.get("title") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const repoId = String(formData.get("repoId") ?? "") || null;
  if (!content) return;

  await prisma.communication.create({
    data: { category, title, source, content, repoId },
  });
  revalidatePath("/communications");
}

export async function updateCommunication(formData: FormData) {
  const id = Number(formData.get("id"));
  const category = String(formData.get("category") ?? "OTHER") as CommCategory;
  const title = String(formData.get("title") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const repoId = String(formData.get("repoId") ?? "") || null;
  if (!id || !content) return;

  await prisma.communication.update({
    where: { id },
    data: { category, title, source, content, repoId },
  });
  revalidatePath("/communications");
}

export async function deleteCommunication(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.communication.delete({ where: { id } });
  revalidatePath("/communications");
}
