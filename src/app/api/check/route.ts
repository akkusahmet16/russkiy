import { getProfile } from "@/lib/db";
import { generateJson, COACH_PERSONA, TRANSLIT_RULES, languagePolicy } from "@/lib/ai";
import { addXp } from "@/lib/progress";
import { recordMistake } from "@/lib/memory";
import { ok, fail } from "@/lib/http";
import type { LevelId } from "@/content/types";

const SCHEMA = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: ["correct", "almost", "wrong"],
      description:
        "correct: anlam ve dilbilgisi doğru (küçük yazım/vurgu farkları önemsiz); almost: anlaşılır ama hata var; wrong: anlam yanlış veya anlaşılmaz",
    },
    score: { type: "integer", description: "0-100" },
    corrected: {
      type: "string",
      description: "Öğrencinin cevabının düzeltilmiş, vurgu işaretli Kiril hâli (doğruysa aynısı)",
    },
    translit: { type: "string", description: "Düzeltilmiş cevabın Türkçe okunuşu" },
    feedback: {
      type: "string",
      description: "Türkçe, kısa (1-2 cümle), samimi geri bildirim. Hata varsa NEDENİNİ basitçe açıkla.",
    },
    alternatives: {
      type: "array",
      items: { type: "string" },
      maxItems: 2,
      description: "Rusların söyleyeceği başka doğal varyantlar (vurgu işaretli)",
    },
  },
  required: ["verdict", "score", "corrected", "translit", "feedback"],
};

export interface CheckResult {
  verdict: "correct" | "almost" | "wrong";
  score: number;
  corrected: string;
  translit: string;
  feedback: string;
  alternatives?: string[];
}

function normalizeRu(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .normalize("NFC")
    .replace(/ё/g, "е")
    .replace(/[.,!?;:«»"'…—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { type, prompt, answer, userAnswer } = (await req.json()) as {
      type: "translate" | "respond";
      prompt: string;
      answer: string;
      userAnswer: string;
    };
    if (!userAnswer?.trim()) return ok({ error: "Cevap boş" }, { status: 400 });

    // ⚡ 0ms HIZLI YOL: Öğrencinin cevabı referans cevapla (vurgu/noktalama hariç) birebir örtüşüyorsa anında onayla!
    const normUser = normalizeRu(userAnswer);
    const normAns = normalizeRu(answer);
    if (normUser && normUser === normAns) {
      await addXp(5);
      return ok<CheckResult>({
        verdict: "correct",
        score: 100,
        corrected: answer,
        translit: "",
        feedback: "Отли́чно! (Mükemmel!) Cümleyi tam bir Rus gibi doğru kurdun.",
      });
    }

    const profile = await getProfile();
    const system = `${COACH_PERSONA}
Görevin: öğrencinin egzersiz cevabını değerlendirmek.
${languagePolicy(profile.level as LevelId)}
${TRANSLIT_RULES}
Değerlendirme ilkeleri:
- Referans cevap tek doğru değildir; anlamı karşılayan her doğal Rusça cevabı kabul et (verdict: "correct").
- Büyük/küçük harf, noktalama, vurgu işareti eksikliği ve ё/е farkı hata DEĞİLDİR.
- Latin harflerle yazılmış Rusçayı (ör. "ya hochu kofe") kabul et ama verdict "almost" olsun ve Kiril yazılışını göster.
- Benzer görünen harf karışıklıklarını (В/Б, С/Ц, ь/б, Ш/Щ) nazikçe belirt.
- Türkçe cevap verildiyse wrong say ve Rusçasını göster.`;

    const result = await generateJson<CheckResult>({
      system,
      schema: SCHEMA,
      temperature: 0.2,
      cacheKey: `check:${type}:${prompt}:${normUser}`,
      contents: `Egzersiz tipi: ${type === "translate" ? "Türkçeden Rusçaya çeviri" : "Duruma Rusça cevap verme"}
Görev: ${prompt}
Referans cevap: ${answer}
Öğrencinin cevabı: ${userAnswer}`,
    });

    if (result.verdict === "correct") {
      await addXp(5);
    } else {
      if (result.verdict === "almost") await addXp(2);
      if (result.corrected) {
        await recordMistake({
          original: userAnswer,
          corrected: result.corrected,
          explanation: result.feedback,
          source: "exercise",
        });
      }
    }

    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
