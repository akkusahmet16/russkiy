import { connection } from "next/server";
import { getOnboardingState, applyPlacementResult } from "@/lib/memory";
import { ok, fail } from "@/lib/http";
import type { LevelId } from "@/content/types";

export async function GET() {
  await connection();
  try {
    return ok(await getOnboardingState());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const { placedLevel, goalFocus, dailyMinutes } = (await req.json()) as {
      placedLevel: LevelId;
      goalFocus: string;
      dailyMinutes: number;
    };
    const state = await applyPlacementResult({
      placedLevel: placedLevel || "A1",
      goalFocus: goalFocus || "social",
      dailyMinutes: Number(dailyMinutes) || 15,
    });
    return ok(state);
  } catch (e) {
    return fail(e);
  }
}
