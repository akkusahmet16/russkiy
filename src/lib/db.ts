import "server-only";
import Database from "better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { getCurrentUser, getProgressBackupCookie, saveProgressBackupCookie } from "./auth";

const globalForPrisma = globalThis as unknown as {
  userClients?: Map<string, PrismaClient>;
  userDbHydrated?: Set<string>;
};

const userClients = globalForPrisma.userClients ?? new Map<string, PrismaClient>();
const userDbHydrated = globalForPrisma.userDbHydrated ?? new Set<string>();
globalForPrisma.userClients = userClients;
globalForPrisma.userDbHydrated = userDbHydrated;

const FULL_SCHEMA_SQL = `
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
  CREATE TABLE IF NOT EXISTS MistakeLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original TEXT NOT NULL,
    corrected TEXT NOT NULL,
    explanation TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'coach',
    count INTEGER NOT NULL DEFAULT 1,
    mastered INTEGER NOT NULL DEFAULT 0,
    updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS CharacterMemory (
    scenarioId TEXT PRIMARY KEY,
    affinity INTEGER NOT NULL DEFAULT 0,
    messageCount INTEGER NOT NULL DEFAULT 0,
    factsJson TEXT NOT NULL DEFAULT '[]',
    updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS DailyStatsLog (
    date TEXT PRIMARY KEY,
    lessonsDone INTEGER NOT NULL DEFAULT 0,
    cardsReviewed INTEGER NOT NULL DEFAULT 0,
    coachMessages INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS UserOnboarding (
    id INTEGER PRIMARY KEY,
    completed INTEGER NOT NULL DEFAULT 0,
    goalFocus TEXT NOT NULL DEFAULT 'social',
    placedLevel TEXT NOT NULL DEFAULT 'A1',
    dailyMinutes INTEGER NOT NULL DEFAULT 15
  );
`;

function getDbFileForUser(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "") || "guest";
  return process.env.VERCEL ? `/tmp/russkiy-user-${safeId}.db` : `./dev-user-${safeId}.db`;
}

async function getScopedPrismaClient(): Promise<PrismaClient> {
  const user = await getCurrentUser();
  const userId = user?.id ?? "guest";
  const userName = user?.name ?? "Öğrenci";
  const filePath = getDbFileForUser(userId);

  let client = userClients.get(userId);
  if (!client) {
    try {
      const rawDb = new Database(filePath);
      rawDb.exec(FULL_SCHEMA_SQL);
      rawDb.close();
    } catch {
      // ignore
    }
    const adapter = new PrismaBetterSqlite3({ url: `file:${filePath}` });
    client = new PrismaClient({ adapter });
    userClients.set(userId, client);
  }

  if (!userDbHydrated.has(userId) && user) {
    userDbHydrated.add(userId);
    try {
      const existingProfile = await client.profile.findUnique({ where: { id: 1 } });
      if (!existingProfile) {
        const backup = await getProgressBackupCookie(userId);
        if (backup) {
          await client.profile.create({
            data: {
              id: 1,
              name: userName,
              level: backup.level || "A1",
              xp: backup.xp || 0,
              streak: backup.streak || 0,
              lastActiveDate: backup.lastActiveDate,
              dailyGoalXp: backup.dailyGoalXp || 50,
            },
          });
          for (const lessonId of backup.completedLessons || []) {
            await client.lessonProgress.upsert({
              where: { lessonId },
              update: { status: "completed", bestScore: 100 },
              create: { lessonId, status: "completed", bestScore: 100, attempts: 1, completedAt: new Date() },
            });
          }
          if (backup.onboardingCompleted) {
            await client.$executeRawUnsafe(
              `INSERT OR IGNORE INTO UserOnboarding (id, completed, goalFocus, placedLevel, dailyMinutes) VALUES (1, 1, ?, ?, 15)`,
              backup.goalFocus || "social",
              backup.level || "A1",
            );
          }
        } else {
          await client.profile.create({
            data: { id: 1, name: userName },
          });
        }
      } else if (existingProfile.name !== userName && userName) {
        await client.profile.update({
          where: { id: 1 },
          data: { name: userName },
        });
      }
    } catch {
      // ignore hydration errors
    }
  }

  return client;
}

/**
 * Her kullanıcının kendi izole veritabanına otomatik yönlenen Prisma istemcisi.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (typeof prop === "symbol" || prop === "then") return undefined;

    if (prop.startsWith("$")) {
      return async (...args: unknown[]) => {
        const client = await getScopedPrismaClient();
        const fn = (client as unknown as Record<string, (...a: unknown[]) => unknown>)[prop];
        return fn.apply(client, args);
      };
    }

    return new Proxy(
      {},
      {
        get(_modelTarget, methodProp: string | symbol) {
          if (typeof methodProp === "symbol") return undefined;
          return async (...args: unknown[]) => {
            const client = await getScopedPrismaClient();
            const modelDelegate = (client as unknown as Record<string, Record<string, (...a: unknown[]) => unknown>>)[
              prop
            ];
            return modelDelegate[methodProp].apply(modelDelegate, args);
          };
        },
      },
    );
  },
});

export async function ensureCoreSchema() {
  await getScopedPrismaClient();
}

/** Aktif kullanıcının profilini döndürür; yoksa kendi adıyla oluşturur. */
export async function getProfile() {
  const user = await getCurrentUser();
  const userName = user?.name ?? "Öğrenci";
  const client = await getScopedPrismaClient();
  return client.profile.upsert({
    where: { id: 1 },
    update: user ? { name: userName } : {},
    create: { id: 1, name: userName },
  });
}

/** Kullanıcının güncel ilerlemesini imzalı çerezde yedekler. */
export async function syncUserProgressBackup() {
  try {
    const user = await getCurrentUser();
    if (!user) return;
    const client = await getScopedPrismaClient();
    const profile = await client.profile.findUnique({ where: { id: 1 } });
    if (!profile) return;
    const completed = await client.lessonProgress.findMany({
      where: { status: "completed" },
      select: { lessonId: true },
    });
    const onbRows = await client.$queryRawUnsafe<{ completed: number; goalFocus: string }[]>(
      `SELECT completed, goalFocus FROM UserOnboarding WHERE id = 1 LIMIT 1`,
    );
    await saveProgressBackupCookie(user.id, {
      level: profile.level,
      xp: profile.xp,
      streak: profile.streak,
      lastActiveDate: profile.lastActiveDate,
      dailyGoalXp: profile.dailyGoalXp,
      completedLessons: completed.map((c) => c.lessonId),
      onboardingCompleted: Boolean(onbRows[0]?.completed),
      goalFocus: onbRows[0]?.goalFocus || "social",
    });
  } catch {
    // ignore
  }
}
