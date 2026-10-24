import "server-only";
import { prisma } from "./db";
import { today, addXp } from "./progress";
import { CURRICULUM } from "@/content/curriculum";
import type { LevelId } from "@/content/types";

let initialized = false;

export async function ensureProductTables() {
  if (initialized) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS MistakeLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original TEXT NOT NULL,
      corrected TEXT NOT NULL,
      explanation TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'coach',
      count INTEGER NOT NULL DEFAULT 1,
      mastered INTEGER NOT NULL DEFAULT 0,
      updatedAt TEXT NOT NULL
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS CharacterMemory (
      scenarioId TEXT PRIMARY KEY,
      affinity INTEGER NOT NULL DEFAULT 0,
      messageCount INTEGER NOT NULL DEFAULT 0,
      factsJson TEXT NOT NULL DEFAULT '[]',
      updatedAt TEXT NOT NULL
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS DailyStatsLog (
      date TEXT PRIMARY KEY,
      lessonsDone INTEGER NOT NULL DEFAULT 0,
      cardsReviewed INTEGER NOT NULL DEFAULT 0,
      coachMessages INTEGER NOT NULL DEFAULT 0
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS UserOnboarding (
      id INTEGER PRIMARY KEY,
      completed INTEGER NOT NULL DEFAULT 0,
      goalFocus TEXT NOT NULL DEFAULT 'social',
      placedLevel TEXT NOT NULL DEFAULT 'A1',
      dailyMinutes INTEGER NOT NULL DEFAULT 15
    )
  `);
  initialized = true;
}

// ─────────────────────── 1. HATA DEFTERİ & ZAYIF NOKTA HAFIZASI ───────────────────────

export interface MistakeItem {
  id: number;
  original: string;
  corrected: string;
  explanation: string;
  source: string;
  count: number;
  mastered: boolean;
  updatedAt: string;
}

export async function recordMistake(input: {
  original: string;
  corrected: string;
  explanation: string;
  source?: "coach" | "exercise";
}) {
  await ensureProductTables();
  const orig = input.original.trim();
  const corr = input.corrected.trim();
  if (!orig || !corr || orig.toLowerCase() === corr.toLowerCase()) return;

  const existing = await prisma.$queryRawUnsafe<{ id: number; count: number }[]>(
    `SELECT id, count FROM MistakeLog WHERE lower(original) = lower(?) AND lower(corrected) = lower(?) LIMIT 1`,
    orig,
    corr,
  );

  const now = new Date().toISOString();
  if (existing.length > 0) {
    await prisma.$executeRawUnsafe(
      `UPDATE MistakeLog SET count = count + 1, mastered = 0, explanation = ?, updatedAt = ? WHERE id = ?`,
      input.explanation.trim(),
      now,
      existing[0].id,
    );
  } else {
    await prisma.$executeRawUnsafe(
      `INSERT INTO MistakeLog (original, corrected, explanation, source, count, mastered, updatedAt) VALUES (?, ?, ?, ?, 1, 0, ?)`,
      orig,
      corr,
      input.explanation.trim(),
      input.source ?? "coach",
      now,
    );
  }
}

export async function listMistakes(includeMastered = true): Promise<MistakeItem[]> {
  await ensureProductTables();
  const rows = await prisma.$queryRawUnsafe<
    {
      id: number;
      original: string;
      corrected: string;
      explanation: string;
      source: string;
      count: number;
      mastered: number;
      updatedAt: string;
    }[]
  >(
    includeMastered
      ? `SELECT * FROM MistakeLog ORDER BY mastered ASC, count DESC, updatedAt DESC LIMIT 100`
      : `SELECT * FROM MistakeLog WHERE mastered = 0 ORDER BY count DESC, updatedAt DESC LIMIT 50`,
  );
  return rows.map((r) => ({ ...r, count: Number(r.count), mastered: Boolean(r.mastered) }));
}

export async function setMistakeMastered(id: number, mastered: boolean) {
  await ensureProductTables();
  await prisma.$executeRawUnsafe(`UPDATE MistakeLog SET mastered = ? WHERE id = ?`, mastered ? 1 : 0, id);
}

export async function removeMistake(id: number) {
  await ensureProductTables();
  await prisma.$executeRawUnsafe(`DELETE FROM MistakeLog WHERE id = ?`, id);
}

// ─────────────────────── 2. KALICI KARAKTER HAFIZASI & İLİŞKİ BARI ───────────────────────

export interface CharacterAffinityInfo {
  scenarioId: string;
  affinity: number; // 0..100
  messageCount: number;
  tierLabel: string;
  tierEmoji: string;
  facts: string[];
}

export function computeAffinityTier(affinity: number): { tierLabel: string; tierEmoji: string } {
  if (affinity >= 80) return { tierLabel: "Свой челове́к (Can Dostu)", tierEmoji: "💎" };
  if (affinity >= 50) return { tierLabel: "Бли́зкий друг (Yakın Dost)", tierEmoji: "❤️" };
  if (affinity >= 25) return { tierLabel: "Прия́тель (İyi Arkadaş)", tierEmoji: "🤝" };
  if (affinity >= 10) return { tierLabel: "Знако́мый (Tanıdık)", tierEmoji: "👋" };
  return { tierLabel: "Но́вый знако́мый (Yeni Tanışma)", tierEmoji: "🌱" };
}

export async function getCharacterMemory(scenarioId: string): Promise<CharacterAffinityInfo> {
  await ensureProductTables();
  const rows = await prisma.$queryRawUnsafe<
    { scenarioId: string; affinity: number; messageCount: number; factsJson: string }[]
  >(`SELECT * FROM CharacterMemory WHERE scenarioId = ? LIMIT 1`, scenarioId);

  if (rows.length === 0) {
    const tier = computeAffinityTier(0);
    return { scenarioId, affinity: 0, messageCount: 0, ...tier, facts: [] };
  }
  const r = rows[0];
  const aff = Math.min(100, Number(r.affinity));
  const tier = computeAffinityTier(aff);
  let facts: string[] = [];
  try {
    facts = JSON.parse(r.factsJson);
  } catch {
    facts = [];
  }
  return {
    scenarioId,
    affinity: aff,
    messageCount: Number(r.messageCount),
    ...tier,
    facts,
  };
}

export async function getAllCharacterMemories(): Promise<Record<string, CharacterAffinityInfo>> {
  await ensureProductTables();
  const rows = await prisma.$queryRawUnsafe<
    { scenarioId: string; affinity: number; messageCount: number; factsJson: string }[]
  >(`SELECT * FROM CharacterMemory`);

  const map: Record<string, CharacterAffinityInfo> = {};
  for (const r of rows) {
    const aff = Math.min(100, Number(r.affinity));
    const tier = computeAffinityTier(aff);
    let facts: string[] = [];
    try {
      facts = JSON.parse(r.factsJson);
    } catch {
      facts = [];
    }
    map[r.scenarioId] = {
      scenarioId: r.scenarioId,
      affinity: aff,
      messageCount: Number(r.messageCount),
      ...tier,
      facts,
    };
  }
  return map;
}

/** Öğrencinin mesajından kişisel ipuçlarını (isim, ilgi alanı, şehir vb.) otomatik yakalar */
function extractStudentFact(msg: string): string | null {
  const mName = msg.match(/(?:меня́?\s+зову́?т|я\s+—)\s+([А-ЯЁA-Z][а-яёa-z]+)/i);
  if (mName) return `Öğrencinin adı: ${mName[1]}`;
  const mLove = msg.match(/я\s+(?:о́чень\s+)?люблю́\s+([^.,!?]{3,35})/i);
  if (mLove) return `Sevdiği şey: «${mLove[1].trim()}»`;
  const mFrom = msg.match(/я\s+из\s+([^.,!?]{3,25})/i);
  if (mFrom) return `Memleketi/Şehri: «${mFrom[1].trim()}»`;
  const mWant = msg.match(/я\s+хочу́\s+([^.,!?]{4,35})/i);
  if (mWant) return `İsteği/Hedefi: «${mWant[1].trim()}»`;
  return null;
}

export async function recordCharacterInteraction(opts: {
  scenarioId: string;
  userMessage: string;
  memoryFactFromAi?: string;
  goalsCompletedCount?: number;
}) {
  await ensureProductTables();
  const current = await getCharacterMemory(opts.scenarioId);
  const autoFact = extractStudentFact(opts.userMessage);
  const nextFacts = [...current.facts];

  for (const candidate of [opts.memoryFactFromAi, autoFact]) {
    if (candidate && candidate.trim() && !nextFacts.includes(candidate.trim())) {
      nextFacts.unshift(candidate.trim());
    }
  }
  const trimmedFacts = nextFacts.slice(0, 8);
  const deltaAffinity = 6 + (opts.goalsCompletedCount ? opts.goalsCompletedCount * 4 : 0);
  const newAffinity = Math.min(100, current.affinity + deltaAffinity);
  const now = new Date().toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT INTO CharacterMemory (scenarioId, affinity, messageCount, factsJson, updatedAt)
     VALUES (?, ?, 1, ?, ?)
     ON CONFLICT(scenarioId) DO UPDATE SET
       affinity = ?,
       messageCount = messageCount + 1,
       factsJson = ?,
       updatedAt = ?`,
    opts.scenarioId,
    newAffinity,
    JSON.stringify(trimmedFacts),
    now,
    newAffinity,
    JSON.stringify(trimmedFacts),
    now,
  );

  return getCharacterMemory(opts.scenarioId);
}

/** Tüm karakterlerin öğrendiği ortak öğrenci gerçeklerini ve son hataları koç prompt'u için derler */
export async function buildPersonalMemoryContext(scenarioId: string): Promise<string> {
  await ensureProductTables();
  const charMem = await getCharacterMemory(scenarioId);
  const allMems = await getAllCharacterMemories();
  const allFacts = Array.from(
    new Set([
      ...charMem.facts,
      ...Object.values(allMems).flatMap((m) => m.facts),
    ]),
  ).slice(0, 8);

  const mistakes = await listMistakes(false);
  const topMistakes = mistakes.slice(0, 4);

  const sections: string[] = [];
  sections.push(
    `ÖĞRENCİ İLE İLİŞKİ SEVİYEN (AFFINITY): %${charMem.affinity} — ${charMem.tierEmoji} ${charMem.tierLabel} (Toplam ${charMem.messageCount} mesaj konuştunuz).`,
  );
  if (allFacts.length > 0) {
    sections.push(
      `ÖĞRENCİ HAKKINDA ÖNCEKİ SOHBETLERDEN HATIRLADIĞIN GERÇEKLER (Fırsat buldukça doğal şekilde atıfta bulun, onu tanıdığını hissettir):\n${allFacts
        .map((f) => `- ${f}`)
        .join("\n")}`,
    );
  }
  if (topMistakes.length > 0) {
    sections.push(
      `ÖĞRENCİNİN SON ZAMANLARDA SIK YAPTIĞI HATALAR (Sohbette bu yapıları doğru kullanması için doğal fırsat yarat):\n${topMistakes
        .map((m) => `- Yanlış: "${m.original}" → Doğru: "${m.corrected}" (${m.explanation})`)
        .join("\n")}`,
    );
  }
  return sections.join("\n\n");
}

// ─────────────────────── 3. GÜNLÜK GÖREVLER (DAILY QUESTS) ───────────────────────

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
  href: string;
}

export async function incrementDailyStat(
  field: "lessonsDone" | "cardsReviewed" | "coachMessages",
  delta = 1,
) {
  await ensureProductTables();
  const t = today();
  await prisma.$executeRawUnsafe(
    `INSERT INTO DailyStatsLog (date, lessonsDone, cardsReviewed, coachMessages)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET ${field} = ${field} + ?`,
    t,
    field === "lessonsDone" ? delta : 0,
    field === "cardsReviewed" ? delta : 0,
    field === "coachMessages" ? delta : 0,
    delta,
  );
}

export async function getDailyQuests(): Promise<DailyQuest[]> {
  await ensureProductTables();
  const t = today();
  const rows = await prisma.$queryRawUnsafe<
    { lessonsDone: number; cardsReviewed: number; coachMessages: number }[]
  >(`SELECT lessonsDone, cardsReviewed, coachMessages FROM DailyStatsLog WHERE date = ? LIMIT 1`, t);

  const st = rows[0] ?? { lessonsDone: 0, cardsReviewed: 0, coachMessages: 0 };
  const lessons = Number(st.lessonsDone);
  const cards = Number(st.cardsReviewed);
  const msgs = Number(st.coachMessages);

  return [
    {
      id: "daily-lesson",
      title: "1 Etkileşimli Ders Tamamla",
      description: "Yol haritasından sıradaki dersin 3 aşamasını bitir",
      icon: "📚",
      current: Math.min(1, lessons),
      target: 1,
      xpReward: 25,
      completed: lessons >= 1,
      href: "/roadmap",
    },
    {
      id: "daily-coach",
      title: "AI Koç ile 4 Mesaj Konuş",
      description: "Herhangi bir gerçek hayat senaryosunda Rusça pratik yap",
      icon: "🎙️",
      current: Math.min(4, msgs),
      target: 4,
      xpReward: 20,
      completed: msgs >= 4,
      href: "/coach",
    },
    {
      id: "daily-review",
      title: "5 Kelime/Kalıp Kartı Tekrar Et",
      description: "SM-2 hafıza destendeki kartları sesli tekrar et",
      icon: "🔁",
      current: Math.min(5, cards),
      target: 5,
      xpReward: 15,
      completed: cards >= 5,
      href: "/review",
    },
  ];
}

// ─────────────────────── 4. SEVİYE TESPİT & ONBOARDING ───────────────────────

export interface OnboardingState {
  completed: boolean;
  goalFocus: string;
  placedLevel: LevelId;
  dailyMinutes: number;
}

export async function getOnboardingState(): Promise<OnboardingState> {
  await ensureProductTables();
  const rows = await prisma.$queryRawUnsafe<
    { completed: number; goalFocus: string; placedLevel: string; dailyMinutes: number }[]
  >(`SELECT * FROM UserOnboarding WHERE id = 1 LIMIT 1`);
  if (rows.length === 0) {
    return { completed: false, goalFocus: "social", placedLevel: "A1", dailyMinutes: 15 };
  }
  const r = rows[0];
  return {
    completed: Boolean(r.completed),
    goalFocus: r.goalFocus,
    placedLevel: (r.placedLevel as LevelId) || "A1",
    dailyMinutes: Number(r.dailyMinutes) || 15,
  };
}

export async function applyPlacementResult(input: {
  placedLevel: LevelId;
  goalFocus: string;
  dailyMinutes: number;
}) {
  await ensureProductTables();
  const dailyGoalXp = input.dailyMinutes >= 30 ? 60 : input.dailyMinutes >= 15 ? 30 : 15;

  await prisma.$executeRawUnsafe(
    `INSERT INTO UserOnboarding (id, completed, goalFocus, placedLevel, dailyMinutes)
     VALUES (1, 1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET completed = 1, goalFocus = ?, placedLevel = ?, dailyMinutes = ?`,
    input.goalFocus,
    input.placedLevel,
    input.dailyMinutes,
    input.goalFocus,
    input.placedLevel,
    input.dailyMinutes,
  );

  await prisma.profile.upsert({
    where: { id: 1 },
    update: { level: input.placedLevel, dailyGoalXp },
    create: { id: 1, level: input.placedLevel, dailyGoalXp },
  });

  // Seçilen seviyenin altındaki seviyelerin derslerini "completed" işaretle ki öğrenci doğrudan kendi seviyesinden başlasın
  const levelOrder: LevelId[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const targetIdx = levelOrder.indexOf(input.placedLevel);
  if (targetIdx > 0) {
    for (let i = 0; i < targetIdx; i++) {
      const lvl = CURRICULUM.find((l) => l.id === levelOrder[i]);
      if (!lvl) continue;
      for (const u of lvl.units) {
        for (const les of u.lessons) {
          await prisma.lessonProgress.upsert({
            where: { lessonId: les.id },
            update: { status: "completed", bestScore: 100, completedAt: new Date() },
            create: { lessonId: les.id, status: "completed", bestScore: 100, attempts: 1, completedAt: new Date() },
          });
        }
      }
    }
  }

  await addXp(20);
  return getOnboardingState();
}
