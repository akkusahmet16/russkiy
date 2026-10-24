import { connection } from "next/server";
import { listMistakes, setMistakeMastered, removeMistake } from "@/lib/memory";
import { addXp } from "@/lib/progress";
import { ok, fail } from "@/lib/http";

export async function GET() {
  await connection();
  try {
    const mistakes = await listMistakes(true);
    return ok({ mistakes });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const { id, mastered } = (await req.json()) as { id: number; mastered: boolean };
    await setMistakeMastered(Number(id), Boolean(mastered));
    if (mastered) await addXp(5);
    return ok({ updated: true });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = (await req.json()) as { id: number };
    await removeMistake(Number(id));
    return ok({ deleted: true });
  } catch (e) {
    return fail(e);
  }
}
