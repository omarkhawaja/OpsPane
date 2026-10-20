"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createMember(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() || null;
  const repoId = String(formData.get("repoId") ?? "") || null;
  if (!firstName || !lastName || !email) return;

  await prisma.member.create({
    data: { firstName, lastName, email, role, repoId },
  });
  revalidatePath("/team");
}

export async function deleteMember(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.member.delete({ where: { id } });
  revalidatePath("/team");
}
