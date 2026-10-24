import { connection } from "next/server";
import { getStats } from "@/lib/progress";
import { hasAiKey } from "@/lib/ai";
import { getCurrentUser, maskApiKey } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export async function GET() {
  await connection();
  try {
    const [stats, aiReady, user] = await Promise.all([getStats(), hasAiKey(), getCurrentUser()]);
    return ok({
      ...stats,
      aiReady,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
            hasApiKey: Boolean(user.geminiApiKey),
            maskedKey: maskApiKey(user.geminiApiKey),
          }
        : null,
    });
  } catch (e) {
    return fail(e);
  }
}
