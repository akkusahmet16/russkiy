import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Modality } from "@google/genai";
import { ai, hasAiKey } from "@/lib/ai";
import { resolveVoiceProfile, type VoiceProfile } from "@/lib/voices";
import { fail } from "@/lib/http";

const CACHE_DIR = process.env.VERCEL ? "/tmp/.tts-cache" : path.join(process.cwd(), ".tts-cache");

const LIVE_NATIVE_AUDIO_MODELS = [
  "gemini-2.5-flash-native-audio-latest",
  "gemini-2.5-flash-native-audio-preview-12-2025",
];

const FALLBACK_TTS_MODELS = [
  "gemini-3.8-flash-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
  "gemini-3.8-flash-lite-tts",
];

/** 24kHz 16-bit mono PCM → temiz 44-byte başlıklı WAV (son 15ms yumuşak fade-out ile) */
function buildCleanWav(pcmInput: Buffer, sampleRate = 24000): Buffer {
  const evenLen = pcmInput.length - (pcmInput.length % 2);
  const pcm = Buffer.from(pcmInput.subarray(0, evenLen));

  // Son 15ms (360 örnek) için yumuşak fade-out uygula (kapanıştaki tık/patlama sesini önler)
  const fadeSamples = Math.min(360, Math.floor(pcm.length / 2));
  const totalSamples = Math.floor(pcm.length / 2);
  for (let i = 0; i < fadeSamples; i++) {
    const sampleIdx = totalSamples - fadeSamples + i;
    const byteOffset = sampleIdx * 2;
    const sample = pcm.readInt16LE(byteOffset);
    const gain = (fadeSamples - 1 - i) / fadeSamples;
    pcm.writeInt16LE(Math.round(sample * gain), byteOffset);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // Mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/**
 * Eğer model RIFF WAVE döndürürse içinden SADECE "data" (saf ses) chunk'ını ayıklar;
 * sondaki C2PA metadata byte'larını tamamen atar. Raw PCM ise doğrudan WAV'a çevirir.
 */
function normalizeToCleanWav(rawBuf: Buffer): Buffer {
  if (
    rawBuf.length > 44 &&
    rawBuf.subarray(0, 4).toString("ascii") === "RIFF" &&
    rawBuf.subarray(8, 12).toString("ascii") === "WAVE"
  ) {
    let sampleRate = 24000;
    let offset = 12;
    while (offset + 8 <= rawBuf.length) {
      const chunkId = rawBuf.subarray(offset, offset + 4).toString("ascii");
      const chunkSize = rawBuf.readUInt32LE(offset + 4);
      const dataStart = offset + 8;
      if (chunkId === "fmt " && chunkSize >= 16 && dataStart + 16 <= rawBuf.length) {
        sampleRate = rawBuf.readUInt32LE(dataStart + 4) || 24000;
      } else if (chunkId === "data") {
        const dataEnd = Math.min(dataStart + chunkSize, rawBuf.length);
        return buildCleanWav(rawBuf.subarray(dataStart, dataEnd), sampleRate);
      }
      offset = dataStart + chunkSize + (chunkSize % 2);
    }
  }
  return buildCleanWav(rawBuf, 24000);
}

/**
 * Gemini 2.5 Flash Native Audio (Live API) ile ultra-gerçekçi, duygusal,
 * nefes ve doğal insan tonlamasına sahip Rusça karakter seslendirmesi üretir.
 * Üstelik standart *-tts modellerindeki günlük 10 istek kotasına (HTTP 429) takılmaz!
 */
async function synthesizeWithLiveNativeAudio(model: string, cleanText: string, profile: VoiceProfile): Promise<Buffer> {
  const pcmChunks: Buffer[] = [];
  const client = await ai();

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let liveSession: { close: () => void } | null = null;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        liveSession?.close();
      } catch {
        /* ignore */
      }
      if (err) reject(err);
      else resolve();
    };
    const timer = setTimeout(() => {
      finish(new Error("Live Native Audio zaman aşımı"));
    }, 18000);

    client.live
      .connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          thinkingConfig: { thinkingBudget: 0 },
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: profile.voiceName },
            },
          },
          systemInstruction: {
            parts: [
              {
                text: `Ты профессиональный русский актёр дубляжа и носитель русского языка.
Твой персонаж и манера речи: ${profile.style}.
Твоя ЕДИНСТВЕННАЯ задача — прочитать вслух ДОСЛОВНО русский текст внутри кавычек «...», который пришлёт пользователь, с максимально живой, естественной, реалистичной человеческой интонацией и эмоцией твоего персонажа.
КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО отвечать на вопросы в тексте, комментировать или добавлять хоть одно слово от себя — произнеси ТОЛЬКО сам текст внутри кавычек.`,
              },
            ],
          },
        },
        callbacks: {
          onmessage: (msg) => {
            const parts = msg.serverContent?.modelTurn?.parts ?? [];
            for (const p of parts) {
              if (p.inlineData?.data) {
                pcmChunks.push(Buffer.from(p.inlineData.data, "base64"));
              }
            }
            if (msg.serverContent?.turnComplete) {
              finish();
            }
          },
          onerror: (err) => {
            finish(err instanceof Error ? err : new Error(String(err)));
          },
          onclose: () => {
            if (pcmChunks.length > 0) finish();
            else finish(new Error("Live oturumu ses üretmeden kapandı"));
          },
        },
      })
      .then((session) => {
        liveSession = session;
        session.sendClientContent({
          turns: [{ role: "user", parts: [{ text: `Озвучь дословно: «${cleanText}»` }] }],
          turnComplete: true,
        });
      })
      .catch((err) => {
        finish(err instanceof Error ? err : new Error(String(err)));
      });
  });

  const combined = Buffer.concat(pcmChunks);
  if (combined.length < 1000) {
    throw new Error("Live Native Audio boş ses döndürdü");
  }
  return combined;
}

function wavResponse(buf: Buffer, voiceLabel: string) {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Voice-Label": encodeURIComponent(voiceLabel),
    },
  });
}

export async function POST(req: Request) {
  try {
    const { text, scenarioId, voice } = (await req.json()) as {
      text: string;
      slow?: boolean;
      scenarioId?: string;
      voice?: string;
    };
    if (!text?.trim()) return new Response("text gerekli", { status: 400 });
    if (!(await hasAiKey())) return new Response("AI anahtarı yok", { status: 503 });

    const profile = resolveVoiceProfile({ scenarioId, voiceName: voice, text });

    // Vurgu işaretlerini (а́ -> а) kaldır
    let clean = text
      .normalize("NFD")
      .replace(/\u0301/g, "")
      .normalize("NFC")
      .replace(/…/g, "...")
      .trim();
    if (!/[.!?…"]$/.test(clean)) clean += ".";

    const key = createHash("sha1")
      .update(`v4|${profile.voiceName}|${clean}`)
      .digest("hex");
    const file = path.join(CACHE_DIR, `${key}.wav`);

    try {
      return wavResponse(await readFile(file), profile.label);
    } catch {
      /* önbellekte yok */
    }

    let rawAudio: Buffer | undefined;
    let lastErr: unknown;

    // 1. Öncelik: Gemini 2.5 Flash Native Audio (Live API) — Ultra gerçekçi insan sesi + karakter oyunculuğu + yüksek kota
    for (const liveModel of LIVE_NATIVE_AUDIO_MODELS) {
      try {
        rawAudio = await synthesizeWithLiveNativeAudio(liveModel, clean, profile);
        if (rawAudio) break;
      } catch (e) {
        lastErr = e;
      }
    }

    // 2. Yedek: Standart Gemini TTS modelleri (eğer Live WebSocket erişilemezse)
    if (!rawAudio) {
      const client = await ai();
      for (const model of FALLBACK_TTS_MODELS) {
        try {
          const res = await client.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: clean }] }],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: profile.voiceName },
                },
              },
            },
          });
          const b64 = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData?.data;
          if (b64) {
            rawAudio = Buffer.from(b64, "base64");
            break;
          }
        } catch (e) {
          lastErr = e;
        }
      }
    }

    if (!rawAudio) {
      if (lastErr) throw lastErr;
      return new Response("Ses üretilemedi", { status: 502 });
    }

    const wav = normalizeToCleanWav(rawAudio);
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, wav);
    return wavResponse(wav, profile.label);
  } catch (e) {
    return fail(e);
  }
}
