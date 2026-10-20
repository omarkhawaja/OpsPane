import { prisma } from "@/lib/prisma";
import { CopyQueueButton } from "./CopyQueueButton";

// Server Component so it can query the queue directly — mounted once in the
// root layout, so the batch-copy button is reachable from every page, not
// just the Change Queue tab itself.
export async function QueueBar() {
  const pending = await prisma.changeRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: { ref: true, label: true, instruction: true },
  });

  return (
    <div className="fixed top-3 right-4 z-40">
      <CopyQueueButton items={pending} compact />
    </div>
  );
}
