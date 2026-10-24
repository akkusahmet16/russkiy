import { getProfile } from "@/lib/db";
import { generateText, COACH_PERSONA, TRANSLIT_RULES, STRESS_RULE, languagePolicy } from "@/lib/ai";
import { findLesson } from "@/content/curriculum";
import { ok, fail } from "@/lib/http";
import type { LevelId } from "@/content/types";

/** Ders içinde "Koça sor" — kısa markdown açıklama */
export async function POST(req: Request) {
  try {
    const { lessonId, question } = (await req.json()) as { lessonId?: string; question: string };
    if (!question?.trim()) return ok({ error: "Soru boş" }, { status: 400 });
    const profile = await getProfile();
    const found = lessonId ? findLesson(lessonId) : undefined;

    const answer = await generateText({
      system: `${COACH_PERSONA}
${languagePolicy(profile.level as LevelId)}
${TRANSLIT_RULES}
${STRESS_RULE}
Öğrencinin sorusuna kısa (en fazla ~150 kelime), net, örnekli bir markdown cevap ver. Rusça örneklerin yanına okunuş ve Türkçe anlam yaz.`,
      prompt: `${found ? `Öğrenci şu dersteyken soruyor: "${found.lesson.title}" (${found.lesson.goal})\n` : ""}Soru: ${question}`,
    });
    return ok({ answer });
  } catch (e) {
    return fail(e);
  }
}
