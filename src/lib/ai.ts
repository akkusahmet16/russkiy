import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { LevelId } from "@/content/types";

let client: GoogleGenAI | null = null;
let cachedApiKey: string | undefined;

export class AiNotConfiguredError extends Error {
  constructor() {
    super("GEMINI_API_KEY tanımlı değil. Proje kökündeki .env dosyasına anahtarını ekle.");
  }
}

export function hasAiKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function ai() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiNotConfiguredError();
  if (!client || cachedApiKey !== key) {
    client = new GoogleGenAI({ apiKey: key });
    cachedApiKey = key;
  }
  return client;
}

const DEPRECATED_MODELS = new Set(["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]);

export function TEXT_MODEL() {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (!envModel || DEPRECATED_MODELS.has(envModel)) {
    return "gemini-3.1-flash-lite-preview";
  }
  return envModel;
}

export const FALLBACK_MODELS = ["gemini-3.1-flash-lite-preview", "gemini-3.6-flash", "gemini-3.5-flash-lite"];
export const TTS_MODEL = () => process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
export const TTS_VOICE = () => process.env.GEMINI_TTS_VOICE || "Kore";

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

// Hızlı bellek önbelleği (aynı kontrol/soru tekrar sorulursa 0ms yanıt)
const jsonCache = new Map<string, unknown>();

function modelThinkingConfig(model: string) {
  if (model.includes("3.1-flash-lite")) {
    return { thinkingConfig: { thinkingBudget: 0 } };
  }
  return {};
}

/** Yapılandırılmış (JSON şemalı) yanıt üretir — düşük gecikmeli + otomatik model yedeklemeli. */
export async function generateJson<T>(opts: {
  system: string;
  contents: { role: "user" | "model"; parts: Part[] }[] | string;
  schema: Record<string, unknown>;
  temperature?: number;
  cacheKey?: string;
}): Promise<T> {
  if (opts.cacheKey && jsonCache.has(opts.cacheKey)) {
    return jsonCache.get(opts.cacheKey) as T;
  }

  const contents =
    typeof opts.contents === "string"
      ? [{ role: "user" as const, parts: [{ text: opts.contents }] }]
      : opts.contents;

  const modelsToTry = Array.from(new Set([TEXT_MODEL(), ...FALLBACK_MODELS]));
  let lastErr: unknown;

  for (const model of modelsToTry) {
    try {
      const res = await ai().models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: opts.system,
          responseMimeType: "application/json",
          responseJsonSchema: opts.schema,
          temperature: opts.temperature ?? 0.5,
          ...modelThinkingConfig(model),
        },
      });
      const text = res.text ?? "";
      const parsed = JSON.parse(text) as T;
      if (opts.cacheKey) {
        if (jsonCache.size > 500) jsonCache.clear();
        jsonCache.set(opts.cacheKey, parsed);
      }
      return parsed;
    } catch (e) {
      lastErr = e;
      if (e instanceof AiNotConfiguredError) throw e;
    }
  }
  throw lastErr;
}

/** Düz metin (markdown) yanıt üretir — düşük gecikmeli + model yedeklemeli. */
export async function generateText(opts: { system: string; prompt: string; temperature?: number }) {
  const modelsToTry = Array.from(new Set([TEXT_MODEL(), ...FALLBACK_MODELS]));
  let lastErr: unknown;
  for (const model of modelsToTry) {
    try {
      const res = await ai().models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
        config: {
          systemInstruction: opts.system,
          temperature: opts.temperature ?? 0.5,
          ...modelThinkingConfig(model),
        },
      });
      return res.text ?? "";
    } catch (e) {
      lastErr = e;
      if (e instanceof AiNotConfiguredError) throw e;
    }
  }
  throw lastErr;
}

// ───────── Ortak pedagojik kurallar ─────────

export const TRANSLIT_RULES = `Okunuş (translit) kuralları — Türk okuyucu için Türk alfabesiyle, GERÇEK Moskova telaffuzuna göre yaz:
- х→h, ч→ç, ш→ş, щ→ş', ж→j, ц→ts, ы→ı, й→y, я→ya, ю→yu, ё→yo, е→ye (kelime başı/ünlü sonrası) veya e, ь→' (yumuşaklık)
- Vurgusuz о → a (хорошо → haraşó), vurgusuz е/я → i (меня → minyá), что → şta, сегодня → sivódnya, -ого/-его → -ava/-iva, конечно → kanyéşna
- Vurgulu heceyi akut aksanla işaretle (á, ó, ú, é, í).`;

export const STRESS_RULE =
  "Rusça metinlerde öğrenci için vurgulu ünlüyü akut aksanla (́) işaretle: хочу́, говори́ть. Tek heceli kelimelerde ve ё harfinde işaretleme.";

export function languagePolicy(level: LevelId) {
  switch (level) {
    case "A1":
      return "Öğrenci A1 (başlangıç). Açıklamalar TAMAMEN Türkçe. Rusça cümleler kısa (3-7 kelime), en sık kullanılan günlük kelimelerle. Her Rusça cümleye Türkçe çeviri ver.";
    case "A2":
      return "Öğrenci A2 (temel sohbet). Açıklamalar Türkçe, örnekler doğal günlük Rusça. Yeni kelimelerin çevirisini ver.";
    case "B1":
      return "Öğrenci B1 (bağımsız konuşmacı). Açıklamaların yarısı Rusça yarısı Türkçe olabilir; gramer nüansları Türkçe. Doğal hızda, deyimsel günlük konuşma dili.";
    case "B2":
      return "Öğrenci B2 (ileri akıcılık). Çoğunlukla Rusça konuş; sadece ince üslup ve gramer farklarını Türkçe açıkla. Zengin, duygusal ve doğal ifadeler kullan.";
    case "C1":
      return "Öğrenci C1 (üst düzey hakimiyet). Neredeyse tamamen doğal, zengin Rusça konuş; edebi/kültürel alt metinleri, deyimleri ve üslup katmanlarını (регистры речи) kullan.";
    case "C2":
      return "Öğrenci C2 (аналог носителя языка). Tamamen eğitimli bir ana dili Rusça olan kişi (носитель) gibi konuş; ince ironi, прецедентные тексты (kült film/edebiyat göndermeleri) ve derin nüanslar kullan.";
  }
}

export const COACH_PERSONA = `Sen "Аня (Anya)" adında, Moskova'dan, Rusçayı ve Rus kültürünü her yönüyle (günlük yaşam, samimi arkadaşlık, aşk/ilişkiler, aile, mizah, seyahat, sokak dili, sanat ve edebiyat) öğreten sıcak, esprili ve sabırlı bir dil koçusun.
Temel ilkelerin:
1. Gramer tablolarında boğmadan, gerçek hayatta Rusların söylediği canlı kalıpları (живая русская речь) öğret.
2. Kitabi ve yapay ders kitabı cümlelerinden kaçın; Moskova ve St. Petersburg'da insanların gerçekten nasıl konuştuğunu göster.
3. Hataları nazikçe düzelt, Türk öğrencilerin sık yaptığı hataları (в/б, с/ц, ь, vurgusuz о→a, vurgu yeri) özellikle yakala.`;
