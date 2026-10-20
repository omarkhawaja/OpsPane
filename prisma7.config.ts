import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

// Only used by the Prisma CLI (migrate/generate). The runtime client in
// lib/prisma.ts builds its own @prisma/adapter-better-sqlite3 instance.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
