import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { CURRICULUM } from "@/content/curriculum";
import { computeCurrentPosition } from "@/lib/progress";
import { ok, fail } from "@/lib/http";

export async function GET() {
  await connection();
  try {
    const progress = await prisma.lessonProgress.findMany();
    const generated = new Set(
      (await prisma.generatedLesson.findMany({ select: { lessonId: true } })).map((g) => g.lessonId),
    );
    const pos = await computeCurrentPosition();
    const map = Object.fromEntries(progress.map((p) => [p.lessonId, { status: p.status, bestScore: p.bestScore }]));

    const levels = CURRICULUM.map((lvl) => ({
      id: lvl.id,
      trki: lvl.trki ?? lvl.id,
      title: lvl.title,
      description: lvl.description,
      canDo: lvl.canDo,
      units: lvl.units.map((u) => ({
        id: u.id,
        title: u.title,
        description: u.description,
        lessons: u.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          goal: l.goal,
          ready: Boolean(l.content) || generated.has(l.id),
          progress: map[l.id] ?? null,
        })),
      })),
    }));

    return ok({ levels, nextLessonId: pos.nextLessonId, currentLevel: pos.level });
  } catch (e) {
    return fail(e);
  }
}
