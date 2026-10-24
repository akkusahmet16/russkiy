import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { findLesson, nextLessonId } from "@/content/curriculum";
import { findScenario } from "@/content/scenarios";
import { getLessonContent } from "@/lib/lessons";
import { ok, fail } from "@/lib/http";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  try {
    const { id } = await ctx.params;
    const found = findLesson(id);
    if (!found) return ok({ error: "Ders bulunamadı" }, { status: 404 });

    const content = await getLessonContent(id);
    const progress = await prisma.lessonProgress.findUnique({ where: { lessonId: id } });
    if (!progress) {
      await prisma.lessonProgress.create({ data: { lessonId: id, status: "started" } });
    }
    const { lesson, unit, level } = found;
    const scenario = lesson.scenarioId ? findScenario(lesson.scenarioId) : undefined;

    return ok({
      id: lesson.id,
      title: lesson.title,
      goal: lesson.goal,
      level: level.id,
      unitTitle: unit.title,
      content,
      progress,
      nextLessonId: nextLessonId(id),
      scenario: scenario ? { id: scenario.id, title: scenario.title, emoji: scenario.emoji } : null,
    });
  } catch (e) {
    return fail(e);
  }
}
