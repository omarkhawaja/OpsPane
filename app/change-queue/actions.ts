"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createChangeRequest(formData: FormData) {
  const ref = String(formData.get("ref") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const instruction = String(formData.get("instruction") ?? "").trim();
  if (!ref || !instruction) return;

  await prisma.changeRequest.create({
    data: { ref, label: label || ref, instruction },
  });
  revalidatePath("/change-queue");
}

export async function markChangeRequestDone(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.changeRequest.update({
    where: { id },
    data: { status: "DONE", completedAt: new Date() },
  });
  revalidatePath("/change-queue");
}

export async function reopenChangeRequest(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.changeRequest.update({
    where: { id },
    data: { status: "PENDING", completedAt: null },
  });
  revalidatePath("/change-queue");
}

export async function deleteChangeRequest(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.changeRequest.delete({ where: { id } });
  revalidatePath("/change-queue");
}

export async function clearDoneChangeRequests() {
  await prisma.changeRequest.deleteMany({ where: { status: "DONE" } });
  revalidatePath("/change-queue");
}
