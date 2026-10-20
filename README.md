# OpsPane

Single pane of glass for repo documentation, screen-level architecture, Jira
feature tracking, team ops, and project communications — see [OPSPANE.md](./OPSPANE.md)
for the full architecture description.

## Setting up a fresh clone

**What's in git vs. what isn't:** the database *schema* (`prisma/schema.prisma`
and every file under `prisma/migrations/`) is committed — that's how the
database structure travels with the code. The database *file itself*
(`prisma/dev.db`, and anything you upload on the Documentation tab under
`public/uploads/`) is **not** committed; it's your local data, and it stays on
your machine. A fresh clone gets the exact same empty tables everyone else
has — no rows, no uploaded files, no pre-filled anything.

```bash
git clone <this repo>
cd opspane
npm install

# create your local env file (DATABASE_URL isn't a secret — it's just a
# local file path — but it's still per-machine so it stays out of git)
cp .env.example .env

# creates prisma/dev.db and applies every migration in prisma/migrations/
# in order, building the full current schema — with zero rows
npx prisma migrate deploy
npx prisma generate

npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Every tab starts empty.
On the Commands tab, click "Load starter commands" to get the default set of
copy-pasteable Claude Code prompts.

## Updating an existing clone

Already set up, and `git pull`ed a change that touched `prisma/schema.prisma`?
Run:

```bash
npm install            # only if package.json changed
npx prisma generate
npx prisma migrate deploy   # additive only — never deletes your existing rows
```

Full explanation in [OPSPANE.md](./OPSPANE.md) under "Updating This App
Without Losing Your Data" — or just paste the "Sync after pulling new code"
prompt from the Commands tab into a Claude Code session.

## Development

```bash
npm run dev     # start the dev server (Turbopack)
npm run lint    # ESLint
npx tsc --noEmit   # type-check
```

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
and Prisma 7 against a local SQLite database.
