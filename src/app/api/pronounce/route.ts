import { getProfile } from "@/lib/db";
import { generateJson, COACH_PERSONA, TRANSLIT_RULES, languagePolicy } from "@/lib/ai";
import { addXp } from "@/lib/progress";
import { ok, fail } from "@/lib/http";
import type { LevelId } from "@/content/types";

const SCHEMA = {
  type: "object",
  properties: {
    transcript: { type: "string", description: "Öğrencinin gerçekte söylediği (Kiril). Anlaşılmıyorsa boş bırak." },
    score: { type: "integer", description: "0-100 telaffuz + doğruluk puanı. Anlaşılır ve doğru ≥80." },
    feedback: { type: "string", description: "Türkçe, 1-3 cümle samimi geri bildirim" },
    issues: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          word: { type: "string", description: "Sorunlu kelime (Kiril, vurgu işaretli)" },
          problem: { type: "string", description: "Türkçe: ne yanlış söylendi" },
          tip: { type: "string", description: "Türkçe: nasıl düzeltilir, okunuşla (ör. 'haraşó: o'lar a gibi')" },
        },
        required: ["word", "problem", "tip"],
      },
    },
  },
  required: ["transcript", "score", "feedback", "issues"],
};

export interface PronounceResult {
  transcript: string;
  score: number;
  feedback: string;
  issues: { word: string; problem: string; tip: string }[];
}

export async function POST(req: Request) {
  try {
    const { target, audio, mimeType = "audio/wav" } = (await req.json()) as { target: string; audio: string; mimeType?: string };
    if (!audio) return ok({ error: "Ses kaydı yok" }, { status: 400 });

    const profile = await getProfile();
    const system = `${COACH_PERSONA}
Görevin: Türk bir öğrencinin Rusça telaffuzunu ses kaydından değerlendirmek.
${languagePolicy(profile.level as LevelId)}
${TRANSLIT_RULES}
Dikkat et: vurgu yeri, vurgusuz o'nun "a" okunması (аканье), ы sesi, yumuşak ünsüzler (ь), р sesi, ж/ш/щ ayrımı, sonda ötümsüzleşme (хлеб → hlyep).
Türk aksanı doğaldır; anlaşılırlığı engelleyen hatalara odaklan. Gürültülü veya boş kayıtta score 0 ver ve tekrar denemesini söyle.`;

    const result = await generateJson<PronounceResult>({
      system,
      schema: SCHEMA,
      temperature: 0.2,
      contents: [
        {
          role: "user",
          parts: [
            { text: `Öğrencinin söylemesi gereken cümle: «${target}»\nKaydı dinle ve değerlendir.` },
            { inlineData: { mimeType, data: audio } },
          ],
        },
      ],
    });

    if (result.score >= 80) await addXp(5);
    else if (result.score >= 50) await addXp(2);

    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
