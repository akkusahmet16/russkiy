import "server-only";
import { prisma } from "./db";
import { findLesson, allLessons } from "@/content/curriculum";
import type { LessonContent } from "@/content/types";
import { generateJson, COACH_PERSONA, TRANSLIT_RULES, STRESS_RULE, languagePolicy } from "./ai";

const LESSON_SCHEMA = {
  type: "object",
  properties: {
    intro: {
      type: "string",
      description:
        "Markdown ders anlatımı (Türkçe). ## başlıklar, kısa tablolar, örnekler ve '> 💡' ipucu blokları kullan. 150-350 kelime.",
    },
    phrases: {
      type: "array",
      minItems: 8,
      maxItems: 12,
      items: {
        type: "object",
        properties: {
          ru: { type: "string" },
          translit: { type: "string" },
          tr: { type: "string" },
          note: { type: "string" },
        },
        required: ["ru", "translit", "tr"],
      },
    },
    exercises: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["translate", "respond", "choice", "speak"] },
          prompt: { type: "string" },
          answer: { type: "string", description: "translate/respond/speak için referans Rusça cevap" },
          translit: { type: "string", description: "speak için okunuş" },
          hint: { type: "string" },
          options: { type: "array", items: { type: "string" }, description: "choice için 3 seçenek" },
          correctIndex: { type: "integer", description: "choice için doğru seçenek indeksi" },
          explanation: { type: "string" },
        },
        required: ["id", "type", "prompt"],
      },
    },
    tips: { type: "array", items: { type: "string" }, maxItems: 3 },
  },
  required: ["intro", "phrases", "exercises"],
};

export async function getLessonContent(lessonId: string): Promise<LessonContent | null> {
  const found = findLesson(lessonId);
  if (!found) return null;
  if (found.lesson.content) return found.lesson.content;

  const cached = await prisma.generatedLesson.findUnique({ where: { lessonId } });
  if (cached) return JSON.parse(cached.json) as LessonContent;

  const content = await generateLesson(lessonId);
  await prisma.generatedLesson.upsert({
    where: { lessonId },
    update: { json: JSON.stringify(content) },
    create: { lessonId, json: JSON.stringify(content) },
  });
  return content;
}

async function generateLesson(lessonId: string): Promise<LessonContent> {
  const found = findLesson(lessonId)!;
  const { lesson, unit, level } = found;

  // Önceki derslerin başlıkları — tekrar etmemek ve üzerine inşa etmek için
  const list = allLessons();
  const idx = list.findIndex((x) => x.lesson.id === lessonId);
  const previous = list
    .slice(Math.max(0, idx - 8), idx)
    .map((x) => `- ${x.lesson.title} (${x.lesson.topics.join(", ")})`)
    .join("\n");

  const system = `${COACH_PERSONA}

Şimdi uygulamadaki müfredat için bir DERS içeriği üreteceksin.
${languagePolicy(level.id)}
${TRANSLIT_RULES}
${STRESS_RULE}

Kurallar:
- Ders, "${lesson.goal}" hedefine ulaştırmalı. Odak: gerçek hayatta kullanılacak doğal ifadeler.
- Gramer gerekiyorsa kuralı ezberletme; kalıp + 2-3 örnekle mantığı göster, tablolarla özetle.
- phrases: 8-12 adet, en kullanışlı ifadeler. Rusça kısım vurgu işaretli; translit Türkçe okunuş; note isteğe bağlı kısa kullanım notu.
- exercises: 6-8 adet karışık. En az 2 "translate" (prompt: Türkçe cümle, answer: Rusça), en az 1 "respond" (prompt: gerçekçi bir durum + varsa karşı tarafın Rusça repliği; answer: örnek doğal cevap), 1-2 "choice" (options 3 adet, correctIndex, explanation), son egzersiz "speak" (prompt: "Sesli söyle:", answer: vurgu işaretli Rusça cümle, translit).
- id değerleri e1, e2, ... olsun.
- tips: Rus kültürü veya doğal konuşma hakkında 1-3 kısa ipucu.`;

  const prompt = `Seviye: ${level.id} — ${level.title}
Ünite: ${unit.title} — ${unit.description}
Ders: ${lesson.title}
Hedef: ${lesson.goal}
İşlenecek konular: ${lesson.topics.join(", ")}

Öğrencinin daha önce gördüğü dersler:
${previous || "(ilk ders)"}

Bu dersin içeriğini üret.`;

  const content = await generateJson<LessonContent>({ system, contents: prompt, schema: LESSON_SCHEMA, temperature: 0.6 });

  // Güvenlik: geçersiz egzersizleri ayıkla
  content.exercises = (content.exercises ?? []).filter((e) => {
    if (e.type === "choice") return Array.isArray(e.options) && e.options.length >= 2 && typeof e.correctIndex === "number";
    return typeof (e as { answer?: string }).answer === "string";
  });
  return content;
}
