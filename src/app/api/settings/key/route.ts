import { updateCurrentUserSettings, maskApiKey } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const { apiKey, name } = (await req.json()) as { apiKey?: string; name?: string };
    const cleanKey = apiKey?.trim();
    if (!cleanKey) {
      return ok({ error: "API anahtarı boş olamaz" }, { status: 400 });
    }

    const updated = await updateCurrentUserSettings({
      geminiApiKey: cleanKey,
      name: name?.trim() || undefined,
    });

    if (!updated) {
      return ok({ error: "Oturum bulunamadı. Lütfen önce giriş yapın." }, { status: 401 });
    }

    return ok({
      saved: true,
      maskedKey: maskApiKey(updated.geminiApiKey),
      name: updated.name,
    });
  } catch (e) {
    return fail(e);
  }
}
