"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TaskKind } from "@/app/generated/prisma/client";

type ScreenSnapshot = {
  name: string;
  route: string | null;
  frontend: string | null;
  backend: string | null;
  screenshotUrl: string | null;
  dataSources: { kind: string; label: string }[];
};

type FeatureSnapshot = {
  name: string;
  description: string | null;
};

function parseFeatureLines(raw: string): FeatureSnapshot[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split(":");
      return rest.length > 0
        ? { name: name.trim(), description: rest.join(":").trim() }
        : { name: line, description: null };
    });
}

export async function requestReanalysis(formData: FormData) {
  const repoId = String(formData.get("repoId") ?? "");
  if (!repoId) return;

  await prisma.task.create({
    data: { kind: TaskKind.REPO_SCAN, targetId: repoId },
  });
  revalidatePath("/analyzer");
}

// Snapshots the repo's CURRENT live Screen/ScreenDataSource rows (the ones
// edited on the Screen Documentation tab) plus a manually/Claude-entered
// feature list into a new, immutable RepoAnalysisVersion. Never overwrites a
// prior version — versionNumber always increments.
export async function recordAnalysisVersion(formData: FormData) {
  const repoId = String(formData.get("repoId") ?? "");
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const featuresRaw = String(formData.get("features") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!repoId) return;

  const screens = await prisma.screen.findMany({
    where: { repoId },
    include: { dataSources: true },
    orderBy: { sortOrder: "asc" },
  });

  const screensSnapshot: ScreenSnapshot[] = screens.map((s) => ({
    name: s.name,
    route: s.route,
    frontend: s.frontend,
    backend: s.backend,
    screenshotUrl: s.screenshotUrl,
    dataSources: s.dataSources.map((d) => ({ kind: d.kind, label: d.label })),
  }));

  const last = await prisma.repoAnalysisVersion.findFirst({
    where: { repoId },
    orderBy: { versionNumber: "desc" },
  });

  await prisma.repoAnalysisVersion.create({
    data: {
      repoId,
      versionNumber: (last?.versionNumber ?? 0) + 1,
      summary,
      screensJson: JSON.stringify(screensSnapshot),
      featuresJson: JSON.stringify(parseFeatureLines(featuresRaw)),
      notes,
    },
  });

  revalidatePath("/analyzer");
}

export async function deleteAnalysisVersion(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.repoAnalysisVersion.delete({ where: { id } });
  revalidatePath("/analyzer");
}
