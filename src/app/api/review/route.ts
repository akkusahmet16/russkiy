import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { schedule, previewInterval } from "@/lib/srs";
import { addXp } from "@/lib/progress";
import { incrementDailyStat } from "@/lib/memory";
import { ok, fail } from "@/lib/http";

export async function GET() {
  await connection();
  try {
    const cards = await prisma.card.findMany({
      where: { due: { lte: new Date() } },
      orderBy: [{ reps: "desc" }, { due: "asc" }],
      take: 60,
    });
    const total = await prisma.card.count();
    return ok({
      total,
      cards: cards.map((c) => ({
        ...c,
        previews: ([0, 1, 2, 3] as const).map((g) => previewInterval(c, g)),
      })),
    });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const { id, grade } = (await req.json()) as { id: number; grade: 0 | 1 | 2 | 3 };
    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) return ok({ error: "Kart yok" }, { status: 404 });
    const next = schedule(card, grade);
    await prisma.card.update({ where: { id }, data: next });
    await Promise.all([addXp(grade === 0 ? 1 : 2), incrementDailyStat("cardsReviewed", 1)]);
    return ok({ due: next.due, interval: next.interval });
  } catch (e) {
    return fail(e);
  }
}
