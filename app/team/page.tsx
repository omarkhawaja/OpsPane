import { Nav } from "@/app/components/Nav";
import { prisma } from "@/lib/prisma";
import { createMember } from "./actions";
import { MemberRow } from "./MemberRow";

export default async function TeamPage() {
  const [members, repos] = await Promise.all([
    prisma.member.findMany({
      include: { repo: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.repo.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <Nav active="/team" />
      <main className="mx-auto max-w-6xl px-6 py-10 flex-1 w-full">
        <h1 className="text-xl font-semibold mb-1">Team</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mb-6">
          Who&apos;s on each project, their role, and their email — copy it
          straight into a message instead of hunting it down.
        </p>

        <form
          action={createMember}
          className="flex flex-wrap gap-2 mb-8 rounded-lg border border-black/10 dark:border-white/15 p-4"
        >
          <input name="firstName" required placeholder="First name" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
          <input name="lastName" required placeholder="Last name" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
          <input name="email" required type="email" placeholder="email@company.com" className="flex-1 min-w-[200px] rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
          <input name="role" placeholder="Role (optional)" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
          <select name="repoId" className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm">
            <option value="">No project</option>
            {repos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium">
            Add member
          </button>
        </form>

        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/10 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Project</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-black/50 dark:text-white/50">
                    No team members yet.
                  </td>
                </tr>
              )}
              {members.map((m) => (
                <MemberRow key={m.id} m={m} repos={repos} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
