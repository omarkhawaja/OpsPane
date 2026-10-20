# OpsPane - Single Pane of Glass for Repo Docs, Team Ops, and Feature Tracking

## Overview
OpsPane is a local-first dashboard built for a technical lead managing multiple teams and repos through a POC-to-production migration. It solves one problem: too many places to look (GitHub repos, Jira boards, Confluence pages, team rosters, scattered notes) to answer "what does this app actually do, how far along is it, and who owns it." OpsPane centralizes that into one app, backed by a local SQLite database, and treats external systems (GitHub, Jira, Confluence) as sources you refresh on demand rather than live dependencies. The business vision is to cut the time spent context-switching across tools down to near zero for recurring status/documentation questions.

## User Preferences
Preferred communication style: direct, concrete, no filler. Push back on scope creep; sequence big asks into phases rather than building everything at once.

## Maintenance Protocol (read this every session)
This file is how a fresh Claude Code session — one with no memory of prior
conversations — picks up exactly where the last one left off. That only works
if it stays current. **Every time a feature, model, route, or architectural
decision changes in this app, update this file in the same unit of work as
the code change**, not as a follow-up:
1. Update the relevant bullet(s) under **Key Features and Design Decisions**
   (add one for a new tab/capability, edit in place for a changed one).
2. Update the model list under **Data Storage → Schema** if `prisma/schema.prisma` changed.
3. Update **Open / Deferred Scope** — remove items that got built, add new ones that got deferred.
4. After committing the change (`git commit`, not before — the commit SHA
   recorded in step 5 must point at the commit that actually contains the
   change), record a `What's New` entry (`/whats-new` tab, or directly via
   `prisma.release.create`) summarizing what shipped.
5. Keep every tab's one-line description (the `<p>` under its `<h1>`) and its
   row in the Help tab's table (`app/help/page.tsx`) accurate — both are read
   by the human, not just by Claude.
This is not optional cleanup — a stale OPSPANE.md is actively worse than no
OPSPANE.md, because a future session will trust it and build on wrong
assumptions.

## System Architecture

### Frontend
- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript
- **Styling**: Tailwind CSS v4, no component library — plain utility classes
- **Data fetching**: Server Components read directly from Prisma; no client-side data-fetching library
- **Mutations**: Next.js Server Actions (`"use server"` functions colocated per route in `actions.ts`), using `revalidatePath` to refresh server-rendered data after writes
- **Interactivity**: Small client components for clipboard (`CopyButton`), inline edit toggles (`UrlRow`, `MemberRow`, `CommunicationCard`, `CommandRow` each hold local `editing` state and submit to a server action on save), the global `RefPicker` pointer tool, and `Nav` (a client component using `usePathname()` to highlight the active tab) — everything else is server-rendered HTML forms
- **Navigation**: `Nav` renders once, in `app/layout.tsx`, as a fixed-width left sidebar (`<aside>`) — not per-page. Individual pages no longer import or render `Nav`; the root layout wraps it and `{children}` in a flex row. This replaced an earlier top horizontal tab bar once the tab count (10) made that unworkable.

### Backend
- **Runtime**: Node.js (no separate server process — Next.js route/server-action runtime only)
- **Data layer**: Prisma ORM 7 against SQLite via the `@prisma/adapter-better-sqlite3` driver adapter (Prisma 7 removed inline `datasource.url` in `schema.prisma`; the connection now lives in `prisma7.config.ts` and in `lib/prisma.ts` for the runtime client)
- **Database file**: `prisma/dev.db`, a single SQLite file — no server to run, no network calls for normal use

### Data Storage
- **Database**: SQLite (file-based, local only)
- **ORM**: Prisma 7, client generated to `app/generated/prisma` (custom output path, not `node_modules`)
- **Schema**: `prisma/schema.prisma` — models are `Url`, `Repo`, `Screen`, `ScreenDataSource`, `ScreenTransition`, `Feature`, `Member`, `Communication`, `RepoAnalysisVersion`, `Command`, `Release`, `Task`

### Key Features and Design Decisions
- **URL Index** (`/urls`): every GitHub repo, Jira board/ticket, and Confluence page you track lives here first, each with a one-line description. Adding a `GITHUB_REPO` URL auto-creates a linked `Repo` row so it immediately shows up in Screen Documentation.
- **Screen Documentation** (`/screens`): pick a repo, see a high-level app summary (free-text + two checkboxes flagging whether the analyzed app has SSO/Active Directory integration and whether it's split into microservices — these describe the *target* repo being analyzed, not OpsPane itself), then a per-screen table of front-end components, back-end components, and tagged data sources (`REAL_DB` / `DUMMY` / `API` / `UNKNOWN`). Screen-to-screen navigation is recorded as `ScreenTransition` rows and rendered as a simple linked-box flow list.
- **Feature Completion** (`/features`): features optionally linked to a repo and to a Jira-ticket URL from the URL Index. `status` and `completionPct` are cached columns on `Feature`, shown as a progress bar — they do not update themselves.
- **Team** (`/team`): first name, last name, email, role, and an optional project (repo) link per person. Every email has a copy-to-clipboard button (`CopyButton`) so you never have to hunt for an address to paste into an email client. Full CRUD, including inline edit (`MemberRow`).
- **Communications** (`/communications`): paste in an email, chat message, meeting transcript, or generic doc. Each one is stored verbatim (never summarized by the app) with a `category` (`EMAIL` / `MESSAGE` / `MEETING_TRANSCRIPT` / `DOCUMENTATION` / `OTHER`), an optional `title`, an optional `source` (sender or meeting name), and an optional repo link. `Communication.id` is a sequential autoincrement integer — deliberately not a cuid like every other model — because it doubles as the human-facing reference shown in the UI as `C-<id>` (e.g. "see C-14"), so you or Claude can point at one unambiguously. Full CRUD (create, inline edit via `CommunicationCard`, delete) plus copy-to-clipboard on every entry's content.
- **App MD File** (`/app-md`): this tab reads and writes `OPSPANE.md` (this file) directly via `node:fs`. It exists so a new Claude Code session can `cat` or open this file and immediately understand the app's current shape instead of re-deriving it from the codebase. **This file should be updated whenever a feature, model, or architectural decision changes** — that update can happen by editing this file directly or by saving through the `/app-md` tab; both write the same file.
- **Repository Analyzer** (`/analyzer`): the versioned counterpart to Screen Documentation. "Record new version" snapshots the repo's *current* live `Screen`/`ScreenDataSource` rows plus a manually/Claude-entered feature list (parsed from one-per-line text, `Name: description` or just `Name`) into an immutable `RepoAnalysisVersion` row. `versionNumber` always increments (previous max + 1) — re-analysis never overwrites or deletes a prior version, and the highest `versionNumber` is what opens by default. "Request re-analysis" just queues a `REPO_SCAN` `Task`, same as everywhere else. The same page's lower half is the **Repository Comparer**: pick any two (repo, version) pairs — two different repos, or two versions of the same repo — and it diffs their snapshots by matching screen/feature *names as strings* (no AST diffing, no semantic matching) into common/only-in-A/only-in-B lists.
- **RefPicker pointer tool** (global, bottom-right on every page): toggled on, it highlights every element carrying `data-ops-ref`/`data-ops-label` attributes; clicking one copies `opspane-ref: <ref> (<label>)` to the clipboard instead of the element's normal action. This is the realistic version of "point at a UI element for Claude" — there is no live socket between the browser and a Claude Code session, so the tool produces a copyable reference you paste into chat, not a live pointer Claude can see. Convention for any new UI: tag the outermost row/card of anything worth referencing with `data-ops-ref="<type>:<id>"` (e.g. `screen:<id>`, `feature:<id>`, `comm:<id>`, `member:<id>`, `url:<id>`, `repo:<id>`, `analysis-version:<id>`) and a human-readable `data-ops-label`.
- **Refresh model — "Claude-Code-driven," decided explicitly over a standalone-API-key app**: nothing in OpsPane calls GitHub, Jira, or Confluence automatically. Every "Refresh" button (on a URL, a repo, or a feature) just inserts a `PENDING` row into the `Task` table (`kind`: `REPO_SCAN` | `JIRA_STATUS` | `CONFLUENCE_SCRAPE`, `targetId`: the id of the thing to refresh). A Claude Code session is expected to periodically query `prisma.task.findMany({ where: { status: "PENDING" } })`, do the real work using its own GitHub/Jira/Confluence MCP tools, write the results into the relevant tables (`Repo.summary`/`hasSsoAd`/`isMicroservice`, `Screen`/`ScreenDataSource`, `Feature.status`/`completionPct`, etc.), and mark the task `DONE`. This keeps OpsPane's own token/API usage at zero and avoids needing any API keys or OAuth wired into the app itself.
- **No auth, no multi-user**: this is a single-operator local tool. No login, no SSO — intentionally, since adding identity management here would contradict the "ship something usable fast" goal. If multi-user access becomes a real need later, that's a distinct phase, not a default.
- **Help** (`/help`): a short "what OpsPane is / how to use it" walkthrough, followed by a static table (no DB — just a hardcoded array in `app/help/page.tsx`) of every tab's purpose and when to use it. Update the array (and the walkthrough prose, if the overall workflow changes) whenever a tab is added, renamed, or its purpose changes.
- **Commands** (`/commands`): a `Command` table of copy-pasteable Claude Code prompts (label, exact command text, one-line description). Seeded with 5 defaults (process pending tasks, re-analyze a repo, summarize communications, update this file, compare two repos) via a "Load starter commands" button shown only when the table is empty (`seedDefaultCommands` in `app/commands/actions.ts`) — avoids the double-insert risk of seeding as a render-time side effect. Full CRUD after that.
- **What's New** (`/whats-new`, last tab in the sidebar): a `Release` table — version, title, free-text notes, and a `commitSha` auto-captured via `execSync("git rev-parse HEAD")` at the moment the entry is created. **This is the actual rollback mechanism**: the table itself holds no app-state snapshot, just a human-readable index into git history, so "roll back to v0.3.0" means `git checkout <that entry's commitSha>`, not restoring a database row.
  - **Primary flow — one click, no typing**: "Generate release notes" queues a `GENERATE_RELEASE_NOTES` `Task` (`targetId` = the last recorded release's `commitSha`, or `"HEAD"` if there isn't one yet). **Fulfilling this task means**: run `git log <targetId>..HEAD --oneline` (or `git log --oneline` if `targetId` is `"HEAD"`) to see what shipped, pick a semver bump (patch for fixes, minor for new tabs/features, major only if something broke compatibility), write a short title and a one-bullet-per-change `notes` string, then call `prisma.release.create({ data: { version, title, notes, commitSha: <current `git rev-parse HEAD`> } })` and mark the task `DONE`. This is a judgment task like `REPO_SCAN`, not something the app's own code can do — only a Claude Code session fulfilling the queue can read and summarize the diff.
  - **Manual fallback**: the "Or fill it in manually" `<details>` on the same page still exists for typing version/title/notes directly, for whenever generation isn't wanted or available.
  - **Workflow going forward: after a batch of changes lands (and is committed), queue/fulfill a release-notes task** — do this after `git commit`, not before, or the captured SHA will point at the previous commit instead of the one that actually contains the change.

## Updating This App Without Losing Your Data
`prisma/dev.db` — the SQLite file holding everything typed into every tab — is
git-ignored. It was never committed, so `git pull` never touches it and never
has. Each developer has their own local `dev.db` on their own machine; pulling
someone else's code change can never see, overwrite, or reset another
person's data, because that data was never in the repo.

The one thing that *does* need a manual step after pulling code that changed
`prisma/schema.prisma`: apply the new migration to your existing database.
Prisma migrations are additive (`CREATE TABLE`, `ALTER TABLE ... ADD COLUMN`)
— they add structure, they don't delete your existing rows, unless a specific
migration explicitly drops a column/table (which `prisma migrate deploy`
would refuse to run unguarded and flag loudly; that hasn't happened in this
project's history so far). After `git pull`:
```
npm install          # only if package.json changed
npx prisma generate   # regenerate the client for the current schema
npx prisma migrate deploy   # apply any new migrations to your local dev.db
```
Then restart `npm run dev`. Your existing URLs, screens, features, communications, team members, commands, and release history are all still there.

## External Dependencies
- **ORM / DB driver**: `prisma`, `@prisma/client`, `@prisma/adapter-better-sqlite3`, `better-sqlite3`
- **Framework**: `next`, `react`, `react-dom`
- **Styling**: `tailwindcss`, `@tailwindcss/turbopack`
- **Env loading**: `dotenv` (required by `prisma7.config.ts`)
- **Planned, not yet integrated**: GitHub MCP, Atlassian/Jira MCP, Confluence MCP — these are used *by the Claude Code session* to fulfill pending `Task` rows, not called by the app's own code.

## Open / Deferred Scope
- **Confluence Scanner tab**: deferred from v1. Will scrape Confluence pages linked from URL Index, store full content locally, tie it to a feature or repo, with copy-clip on every stored block.
- **Screenshot-driven UI walkthrough tooling**: not yet built. Intended as an extension of Screen Documentation — paste a screenshot, Claude links it to the relevant repo code.
- **Multi-repo merge/migration support**: not yet built. Repository Comparer diffs two repos' *analysis snapshots* (screen/feature name sets), but there's no feature yet for actually reconciling or merging documentation/code across repos being consolidated.
- **Full CRUD coverage**: `Url`, `Member`, and `Communication` have inline edit; `Screen`, `Feature`, `Repo`, and `RepoAnalysisVersion` have create/update (via dedicated forms) but not a generic inline edit; `ScreenDataSource` and `ScreenTransition` are delete+recreate only (acceptable for small join-style rows, but worth revisiting if that gets tedious).
- **`data-ops-ref` coverage is partial**: currently tagged on `Screen` rows and the repo summary card (Screens tab), `Feature` rows, `Communication` cards, `Member` rows, `Url` rows, and the Analyzer's version snapshot block. Not yet on every individual data source/transition/version-history row — extend using the convention documented above as those become worth pointing at directly.
