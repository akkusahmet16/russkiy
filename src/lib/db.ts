import "server-only";
import Database from "better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; dbInit?: boolean };

const CORE_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'Öğrenci',
    "level" TEXT NOT NULL DEFAULT 'A1',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT,
    "dailyGoalXp" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "DailyActivity" (
    "date" TEXT NOT NULL PRIMARY KEY,
    "xp" INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS "LessonProgress" (
    "lessonId" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'started',
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "GeneratedLesson" (
    "lessonId" TEXT NOT NULL PRIMARY KEY,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ru" TEXT NOT NULL UNIQUE,
    "translit" TEXT NOT NULL DEFAULT '',
    "tr" TEXT NOT NULL,
    "note" TEXT,
    "sourceLessonId" TEXT,
    "ease" REAL NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "due" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "ChatSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scenarioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
`;

function createClient() {
  const defaultUrl = process.env.VERCEL ? "file:/tmp/russkiy.db" : "file:./dev.db";
  const url = process.env.VERCEL ? "file:/tmp/russkiy.db" : (process.env.DATABASE_URL ?? defaultUrl);
  try {
    const filePath = url.replace(/^file:/, "");
    const rawDb = new Database(filePath);
    rawDb.exec(CORE_SCHEMA_SQL);
    rawDb.close();
    globalForPrisma.dbInit = true;
  } catch {
    // Fallback to async ensureCoreSchema if needed
  }
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function ensureCoreSchema() {
  if (globalForPrisma.dbInit) return;
  for (const stmt of CORE_SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
    await prisma.$executeRawUnsafe(stmt);
  }
  globalForPrisma.dbInit = true;
}

/** Tek kullanıcılı profil; yoksa oluşturur. */
export async function getProfile() {
  await ensureCoreSchema();
  return prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}
