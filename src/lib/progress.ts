import "server-only";
import { prisma, getProfile, syncUserProgressBackup } from "./db";
import { allLessons } from "@/content/curriculum";
import type { LevelId } from "@/content/types";
import { getDailyQuests, listMistakes, getOnboardingState } from "./memory";

export function today(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return today(d);
}

/** XP ekler, günlük aktiviteyi ve seriyi (streak) günceller. */
export async function addXp(amount: number) {
  const t = today();
  const profile = await getProfile();

  let streak = profile.streak;
  if (profile.lastActiveDate !== t) {
    streak = profile.lastActiveDate === yesterday() ? streak + 1 : 1;
  }

  await prisma.dailyActivity.upsert({
    where: { date: t },
    update: { xp: { increment: amount } },
    create: { date: t, xp: amount },
  });

  const updated = await prisma.profile.update({
    where: { id: 1 },
    data: { xp: { increment: amount }, streak, lastActiveDate: t },
  });

  await syncUserProgressBackup();
  return updated;
}

/** Şu anki seviye = tamamlanmamış ilk dersin seviyesi */
export async function computeCurrentPosition() {
  const done = new Set(
    (await prisma.lessonProgress.findMany({ where: { status: "completed" } })).map((p) => p.lessonId),
  );
  const list = allLessons();
  const next = list.find((x) => !done.has(x.lesson.id)) ?? list[list.length - 1];
  return {
    completed: done,
    nextLessonId: next.lesson.id,
    level: next.level.id as LevelId,
    total: list.length,
  };
}

export async function getStats() {
  const profile = await getProfile();
  const t = today();
  const todayAct = await prisma.dailyActivity.findUnique({ where: { date: t } });
  const dueCount = await prisma.card.count({ where: { due: { lte: new Date() } } });
  const cardCount = await prisma.card.count();
  const pos = await computeCurrentPosition();

  // Seri bugün veya dün aktif değilse sıfır göster
  const streakAlive = profile.lastActiveDate === t || profile.lastActiveDate === yesterday();

  // Son 7 gün
  const days: { date: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ date: today(d), xp: 0 });
  }
  const acts = await prisma.dailyActivity.findMany({ where: { date: { in: days.map((d) => d.date) } } });
  for (const a of acts) {
    const day = days.find((d) => d.date === a.date);
    if (day) day.xp = a.xp;
  }

  if (profile.level !== pos.level) {
    await prisma.profile.update({ where: { id: 1 }, data: { level: pos.level } });
  }

  const [dailyQuests, unmasteredMistakes, onboarding] = await Promise.all([
    getDailyQuests(),
    listMistakes(false),
    getOnboardingState(),
  ]);

  return {
    name: profile.name,
    level: pos.level,
    xp: profile.xp,
    streak: streakAlive ? profile.streak : 0,
    dailyGoalXp: profile.dailyGoalXp,
    todayXp: todayAct?.xp ?? 0,
    dueCount,
    cardCount,
    completedCount: pos.completed.size,
    totalLessons: pos.total,
    nextLessonId: pos.nextLessonId,
    week: days,
    dailyQuests,
    mistakeCount: unmasteredMistakes.length,
    onboarding,
  };
}

export type Stats = Awaited<ReturnType<typeof getStats>>;
