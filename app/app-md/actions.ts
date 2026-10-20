"use server";

import { revalidatePath } from "next/cache";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const MD_PATH = path.join(process.cwd(), "OPSPANE.md");

export async function saveAppMd(formData: FormData) {
  const content = String(formData.get("content") ?? "");
  await writeFile(MD_PATH, content, "utf-8");
  revalidatePath("/app-md");
}
