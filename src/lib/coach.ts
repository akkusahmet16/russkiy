import "server-only";
import { generateJson, COACH_PERSONA, TRANSLIT_RULES, STRESS_RULE, languagePolicy } from "./ai";
import type { LevelId, Scenario } from "@/content/types";

export interface CoachMeta {
  translit?: string;
  translation?: string;
  corrections?: { original: string; corrected: string; explanation: string }[];
  coachNote?: string;
  newWords?: { ru: string; translit: string; tr: string }[];
  suggestions?: { ru: string; tr: string }[];
  goalsCompleted?: number[];
  memoryFact?: string;
}

export interface CoachReply extends CoachMeta {
  reply: string;
}

const SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "Karakterin Rusça cevabı (vurgu işaretli). Kısa: 1-3 cümle. Sohbeti devam ettirmek için genelde bir soru ile bitir." },
    translit: { type: "string", description: "reply'nin Türkçe okunuşu" },
    translation: { type: "string", description: "reply'nin Türkçe çevirisi" },
    corrections: {
      type: "array",
      description: "Öğrencinin SON mesajındaki hatalar. Hata yoksa boş dizi. Sadece önemli olanlar (en fazla 3).",
      items: {
        type: "object",
        properties: {
          original: { type: "string" },
          corrected: { type: "string", description: "Doğru, doğal hâli (vurgu işaretli)" },
          explanation: { type: "string", description: "Türkçe, tek cümle neden" },
        },
        required: ["original", "corrected", "explanation"],
      },
    },
    coachNote: { type: "string", description: "Koçtan (karakter dışı) Türkçe kısa not: övgü, ipucu veya doğal ifade önerisi. Gerekmiyorsa boş string." },
    newWords: {
      type: "array",
      maxItems: 3,
      description: "reply içindeki, öğrenci için muhtemelen yeni olan önemli kelime/kalıplar",
      items: {
        type: "object",
        properties: { ru: { type: "string" }, translit: { type: "string" }, tr: { type: "string" } },
        required: ["ru", "translit", "tr"],
      },
    },
    suggestions: {
      type: "array",
      maxItems: 3,
      description: "Öğrencinin verebileceği 2-3 olası cevap (seviyesine uygun, vurgu işaretli)",
      items: {
        type: "object",
        properties: { ru: { type: "string" }, tr: { type: "string" } },
        required: ["ru", "tr"],
      },
    },
    goalsCompleted: { type: "array", items: { type: "integer" }, description: "Öğrencinin şimdiye kadar (tüm sohbet boyunca) başardığı senaryo hedeflerinin indeksleri (0'dan başlar)" },
    memoryFact: {
      type: "string",
      description: "Öğrenci bu mesajında kendisi hakkında yeni bir kişisel bilgi (isim, meslek, hobi, sevdiği içecek, memleket, hayal vb.) paylaştıysa Türkçe kısa özet (örn. 'Kahveyi sütsüz seviyor'); paylaşmadıysa boş string.",
    },
  },
  required: ["reply", "translit", "translation", "corrections", "coachNote", "newWords", "suggestions", "goalsCompleted"],
};

export function coachSystem(scenario: Scenario, level: LevelId, personalContext?: string) {
  return `${COACH_PERSONA}

ŞU AN BİR ROLEPLAY YAPIYORSUN.
Canlandırdığın karakter: ${scenario.character}
Sahne: ${scenario.setting}
Öğrencinin bu senaryodaki hedefleri:
${scenario.goals.map((g, i) => `${i}. ${g}`).join("\n")}

${personalContext ? `🧠 KALICI KARAKTER VE KOÇ HAFIZASI:\n${personalContext}\n` : ""}
${languagePolicy(level)}
${TRANSLIT_RULES}
${STRESS_RULE}

Kurallar:
- "reply" alanında SADECE karakter olarak, Rusça konuş. Karakterden çıkma; Türkçe açıklamalar "coachNote" ve "corrections" alanlarına.
- Öğrencinin seviyesine göre konuş; A1'de çok kısa ve basit cümleler.
- Öğrenci Türkçe yazarsa veya takılırsa: karakter olarak basitçe tekrar sor, coachNote'ta Rusça nasıl söyleyeceğini göster.
- Öğrenciyi hedeflere doğru doğal şekilde yönlendir (ör. bir soru sorarak).
- Tüm hedefler tamamlanınca sahneyi doğal şekilde kapatmaya yönel ve coachNote'ta tebrik et.
- Latin harflerle yazılmış Rusçayı anla; corrections'ta Kiril hâlini göster.`;
}

export async function coachReply(
  scenario: Scenario,
  level: LevelId,
  history: { role: "user" | "coach"; content: string }[],
  personalContext?: string,
) {
  return generateJson<CoachReply>({
    system: coachSystem(scenario, level, personalContext),
    schema: SCHEMA,
    temperature: 0.8,
    contents: history.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    })),
  });
}
