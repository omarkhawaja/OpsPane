"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const DEFAULT_COMMANDS = [
  {
    label: "Process pending tasks",
    command: "Process pending OpsPane tasks.",
    description:
      "Drains the Task queue: scans repos, pulls Jira ticket status, and scrapes Confluence pages for every PENDING task, then marks each one DONE.",
  },
  {
    label: "Re-analyze a repo",
    command: 'Re-analyze the "<repo name>" repo in OpsPane and record a new analysis version.',
    description:
      "Runs a fresh repo scan and writes the results as a new, numbered RepoAnalysisVersion — never overwrites the previous one.",
  },
  {
    label: "Summarize recent communications",
    command: "Summarize the last 10 entries in OpsPane's Communications tab and flag anything that needs a reply.",
    description: "Has Claude read recent pasted emails/messages and surface what's actionable.",
  },
  {
    label: "Update OPSPANE.md",
    command: "Review recent changes to this app and update OPSPANE.md and the What's New tab to match.",
    description:
      "Keeps the self-describing architecture doc and the changelog in sync after a batch of edits.",
  },
  {
    label: "Compare two repos",
    command: 'Record a new analysis version for "<repo A>" and "<repo B>", then compare them in the Repository Comparer.',
    description: "Useful before deciding which of two similar apps to keep or merge.",
  },
] as const;

export async function seedDefaultCommands() {
  const count = await prisma.command.count();
  if (count > 0) return;
  await prisma.command.createMany({ data: DEFAULT_COMMANDS.map((c) => ({ ...c })) });
  revalidatePath("/commands");
}

export async function createCommand(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const command = String(formData.get("command") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!label || !command) return;

  await prisma.command.create({ data: { label, command, description } });
  revalidatePath("/commands");
}

export async function updateCommand(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const command = String(formData.get("command") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!id || !label || !command) return;

  await prisma.command.update({ where: { id }, data: { label, command, description } });
  revalidatePath("/commands");
}

export async function deleteCommand(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.command.delete({ where: { id } });
  revalidatePath("/commands");
}
