import { prisma } from "@/lib/db";
import { findLesson } from "@/content/curriculum";
import { getLessonContent } from "@/lib/lessons";
import { addXp } from "@/lib/progress";
import { incrementDailyStat } from "@/lib/memory";
import { ok, fail } from "@/lib/http";

/** Dersi tamamlar: XP verir, ifadeleri tekrar destesine ekler. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!findLesson(id)) return ok({ error: "Ders bulunamadı" }, { status: 404 });
    const { score = 0 } = (await req.json().catch(() => ({}))) as { score?: number };
    const safeScore = Math.max(0, Math.min(100, Math.round(score)));

    const prev = await prisma.lessonProgress.findUnique({ where: { lessonId: id } });
    const firstCompletion = prev?.status !== "completed";

    await prisma.lessonProgress.upsert({
      where: { lessonId: id },
      update: {
        status: "completed",
        bestScore: Math.max(prev?.bestScore ?? 0, safeScore),
        attempts: { increment: 1 },
        completedAt: prev?.completedAt ?? new Date(),
      },
      create: { lessonId: id, status: "completed", bestScore: safeScore, attempts: 1, completedAt: new Date() },
    });

    // İlk tamamlama: 30 + skora göre bonus; tekrar: 10
    const xp = firstCompletion ? 30 + Math.round(safeScore / 5) : 10;
    await Promise.all([addXp(xp), incrementDailyStat("lessonsDone", 1)]);

    let cardsAdded = 0;
    const content = await getLessonContent(id);
    for (const p of content?.phrases ?? []) {
      const exists = await prisma.card.findUnique({ where: { ru: p.ru } });
      if (!exists) {
        await prisma.card.create({
          data: { ru: p.ru, translit: p.translit, tr: p.tr, note: p.note ?? null, sourceLessonId: id },
        });
        cardsAdded++;
      }
    }

    return ok({ xp, cardsAdded, firstCompletion });
  } catch (e) {
    return fail(e);
  }
}
