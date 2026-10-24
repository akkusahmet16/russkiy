import { connection } from "next/server";
import { prisma, getProfile } from "@/lib/db";
import { findScenario } from "@/content/scenarios";
import { coachReply } from "@/lib/coach";
import { addXp } from "@/lib/progress";
import {
  getCharacterMemory,
  buildPersonalMemoryContext,
  recordCharacterInteraction,
  recordMistake,
  incrementDailyStat,
} from "@/lib/memory";
import { ok, fail } from "@/lib/http";
import type { LevelId } from "@/content/types";

function serialize(m: { id: number; role: string; content: string; meta: string | null; createdAt: Date }) {
  return { id: m.id, role: m.role, content: m.content, meta: m.meta ? JSON.parse(m.meta) : null, createdAt: m.createdAt };
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  try {
    const { id } = await ctx.params;
    const session = await prisma.chatSession.findUnique({
      where: { id: Number(id) },
      include: { messages: { orderBy: { id: "asc" } } },
    });
    if (!session) return ok({ error: "Sohbet bulunamadı" }, { status: 404 });
    const scenario = findScenario(session.scenarioId);
    const affinity = await getCharacterMemory(session.scenarioId);
    return ok({
      id: session.id,
      title: session.title,
      scenario,
      affinity,
      messages: session.messages.map(serialize),
    });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { message } = (await req.json()) as { message: string };
    if (!message?.trim()) return ok({ error: "Mesaj boş" }, { status: 400 });

    const session = await prisma.chatSession.findUnique({
      where: { id: Number(id) },
      include: { messages: { orderBy: { id: "asc" } } },
    });
    if (!session) return ok({ error: "Sohbet bulunamadı" }, { status: 404 });
    const scenario = findScenario(session.scenarioId);
    if (!scenario) return ok({ error: "Senaryo bulunamadı" }, { status: 404 });

    const profile = await getProfile();
    const personalContext = await buildPersonalMemoryContext(session.scenarioId);
    const history = [
      ...session.messages.map((m) => ({ role: m.role as "user" | "coach", content: m.content })),
      { role: "user" as const, content: message.trim() },
    ];
    // Son 30 mesaj yeterli bağlam
    const reply = await coachReply(scenario, profile.level as LevelId, history.slice(-30), personalContext);

    const userMsg = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message.trim(),
        meta: JSON.stringify({ corrections: reply.corrections ?? [] }),
      },
    });
    const { reply: text, ...meta } = reply;
    const coachMsg = await prisma.chatMessage.create({
      data: { sessionId: session.id, role: "coach", content: text, meta: JSON.stringify(meta) },
    });
    await prisma.chatSession.update({ where: { id: session.id }, data: { updatedAt: new Date() } });
    await addXp((reply.corrections?.length ?? 0) === 0 ? 4 : 2);

    // Hataları kişisel hata defterine kaydet
    for (const c of reply.corrections ?? []) {
      await recordMistake({
        original: c.original,
        corrected: c.corrected,
        explanation: c.explanation,
        source: "coach",
      });
    }

    // Karakter ilişki puanını (Affinity), öğrenilen gerçekleri ve günlük görevi güncelle
    const [affinity] = await Promise.all([
      recordCharacterInteraction({
        scenarioId: session.scenarioId,
        userMessage: message.trim(),
        memoryFactFromAi: reply.memoryFact,
        goalsCompletedCount: reply.goalsCompleted?.length ?? 0,
      }),
      incrementDailyStat("coachMessages", 1),
    ]);

    return ok({ user: serialize(userMsg), coach: serialize(coachMsg), affinity });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await prisma.chatSession.delete({ where: { id: Number(id) } });
    return ok({ deleted: true });
  } catch (e) {
    return fail(e);
  }
}
