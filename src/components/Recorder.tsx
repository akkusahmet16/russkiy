"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/client";
import { Spinner } from "./Speak";

interface PronounceResult {
  transcript: string;
  score: number;
  feedback: string;
  issues: { word: string; problem: string; tip: string }[];
}

async function blobToWavBase64(blob: Blob): Promise<string> {
  const arrayBuf = await blob.arrayBuffer();
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(arrayBuf);
  await ctx.close();

  const targetRate = 16000;
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetRate), targetRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  const samples = rendered.getChannelData(0);

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.start();
    recRef.current = rec;
    setRecording(true);
  }

  function stop(): Promise<Blob> {
    return new Promise((resolve) => {
      const rec = recRef.current;
      if (!rec) return resolve(new Blob());
      rec.onstop = () => {
        rec.stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(chunks.current, { type: rec.mimeType }));
      };
      rec.stop();
      setRecording(false);
    });
  }

  return { recording, start, stop };
}

export function PronunciationCheck({ target, onResult }: { target: string; onResult?: (score: number) => void }) {
  const { recording, start, stop } = useRecorder();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PronounceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    if (!recording) {
      try {
        setResult(null);
        await start();
      } catch {
        setError("Mikrofona erişilemedi. Tarayıcı iznini kontrol et.");
      }
      return;
    }
    const blob = await stop();
    setBusy(true);
    try {
      const audio = await blobToWavBase64(blob);
      const r = await api<PronounceResult>("/api/pronounce", { body: { target, audio, mimeType: "audio/wav" } });
      setResult(r);
      onResult?.(r.score);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Değerlendirme başarısız");
    } finally {
      setBusy(false);
    }
  }

  const scoreBadge = !result
    ? ""
    : result.score >= 80
      ? "bg-[#DCFCE7] text-[#15803D] border-[#15803D]"
      : result.score >= 50
        ? "bg-[#FEF3C7] text-[#B45309] border-[#B45309]"
        : "bg-[#FFE4E6] text-[#BE123C] border-[#BE123C]";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-xl border-2 border-[#18181B] px-5 py-2.5 text-sm font-bold shadow-[0_3px_0_0_#18181B] transition cursor-pointer ${
          recording ? "bg-[#D9381E] text-white animate-pulse" : "bg-[#FAF8F3] text-[#141413] hover:bg-[#ECE6D8]"
        } disabled:opacity-50`}
      >
        {busy ? <Spinner /> : recording ? "⏹ Kaydı Bitir & Analiz Et" : "🎙️ Mikrofona Konuş & Test Et"}
      </button>
      {error && <p className="text-xs font-bold text-[#BE123C]">{error}</p>}
      {result && (
        <div className="rounded-2xl border-2 border-[#18181B] bg-[#FAF8F3] p-4 text-sm space-y-2.5 shadow-[0_3px_0_0_#18181B]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`rounded-lg border px-2.5 py-0.5 font-mono-code text-lg font-extrabold ${scoreBadge}`}>
              %{result.score}
            </span>
            {result.transcript && (
              <span className="text-xs font-semibold text-[#57534E]">
                Algılanan: <b className="text-[#141413]">«{result.transcript}»</b>
              </span>
            )}
          </div>
          <p className="font-medium text-[#141413]">{result.feedback}</p>
          {result.issues.length > 0 && (
            <ul className="space-y-1.5">
              {result.issues.map((i, k) => (
                <li key={k} className="rounded-xl border border-[#D6CFC2] bg-white px-3 py-2 text-xs">
                  <span className="font-extrabold text-[#B45309]">{i.word}</span> — {i.problem}
                  <div className="text-[#57534E] mt-0.5">İpucu: {i.tip}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
