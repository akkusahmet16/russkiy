import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { findScenario, SCENARIOS } from "@/content/scenarios";
import { getAllCharacterMemories } from "@/lib/memory";
import { ok, fail } from "@/lib/http";

export async function GET() {
  await connection();
  try {
    const [sessions, affinities] = await Promise.all([
      prisma.chatSession.findMany({
        orderBy: { updatedAt: "desc" },
        take: 30,
        include: { _count: { select: { messages: true } } },
      }),
      getAllCharacterMemories(),
    ]);
    return ok({
      scenarios: SCENARIOS,
      affinities,
      sessions: sessions.map((s) => ({
        id: s.id,
        scenarioId: s.scenarioId,
        title: s.title,
        updatedAt: s.updatedAt,
        messageCount: s._count.messages,
      })),
    });
  } catch (e) {
    return fail(e);
  }
}

/** Yeni sohbet başlat — karakterin açılış repliğiyle */
export async function POST(req: Request) {
  try {
    const { scenarioId } = (await req.json()) as { scenarioId: string };
    const scenario = findScenario(scenarioId);
    if (!scenario) return ok({ error: "Senaryo bulunamadı" }, { status: 404 });

    const session = await prisma.chatSession.create({
      data: {
        scenarioId,
        title: `${scenario.emoji} ${scenario.title}`,
        messages: {
          create: {
            role: "coach",
            content: scenario.opener,
            meta: JSON.stringify({ translation: scenario.openerTr, goalsCompleted: [] }),
          },
        },
      },
    });
    return ok({ id: session.id });
  } catch (e) {
    return fail(e);
  }
}
