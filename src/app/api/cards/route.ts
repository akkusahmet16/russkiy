import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/http";

export async function GET() {
  await connection();
  try {
    const cards = await prisma.card.findMany({ orderBy: { createdAt: "desc" } });
    return ok({ cards });
  } catch (e) {
    return fail(e);
  }
}

/** Yeni kart ekle (koç sohbetinden veya elle) */
export async function POST(req: Request) {
  try {
    const { ru, translit = "", tr, note } = (await req.json()) as { ru: string; translit?: string; tr: string; note?: string };
    if (!ru?.trim() || !tr?.trim()) return ok({ error: "Rusça ve Türkçe alanları gerekli" }, { status: 400 });
    const existing = await prisma.card.findUnique({ where: { ru: ru.trim() } });
    if (existing) return ok({ card: existing, existed: true });
    const card = await prisma.card.create({ data: { ru: ru.trim(), translit, tr: tr.trim(), note: note ?? null } });
    return ok({ card, existed: false });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = (await req.json()) as { id: number };
    await prisma.card.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    return fail(e);
  }
}
