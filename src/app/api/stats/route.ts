import { connection } from "next/server";
import { getStats } from "@/lib/progress";
import { hasAiKey } from "@/lib/ai";
import { ok, fail } from "@/lib/http";

export async function GET() {
  await connection();
  try {
    return ok({ ...(await getStats()), aiReady: hasAiKey() });
  } catch (e) {
    return fail(e);
  }
}
