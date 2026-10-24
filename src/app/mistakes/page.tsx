"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { SpeakButton, Spinner, speak } from "@/components/Speak";
import { RuInput } from "@/components/RuInput";

interface MistakeItem {
  id: number;
  original: string;
  corrected: string;
  explanation: string;
  source: string;
  count: number;
  mastered: boolean;
  updatedAt: string;
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

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeItem[] | null>(null);
  const [drillMode, setDrillMode] = useState(false);
  const [drillIdx, setDrillIdx] = useState(0);
  const [drillInput, setDrillInput] = useState("");
  const [drillFeedback, setDrillFeedback] = useState<null | { ok: boolean; msg: string }>(null);

  function load() {
    api<{ mistakes: MistakeItem[] }>("/api/mistakes").then((d) => setMistakes(d.mistakes));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleMastered(m: MistakeItem) {
    await api("/api/mistakes", { body: { id: m.id, mastered: !m.mastered } });
    load();
  }

  async function remove(id: number) {
    await api("/api/mistakes", { method: "DELETE", body: { id } });
    load();
  }

  if (!mistakes) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-rose-400" />
      </div>
    );
  }

  const activeMistakes = mistakes.filter((m) => !m.mastered);
  const masteredMistakes = mistakes.filter((m) => m.mastered);
  const currentDrill = activeMistakes[drillIdx];

  function checkDrill() {
    if (!currentDrill || !drillInput.trim()) return;
    const isOk = normalizeRu(drillInput) === normalizeRu(currentDrill.corrected);
    speak(currentDrill.corrected);
    if (isOk) {
      setDrillFeedback({
        ok: true,
        msg: `Отли́чно! Doğru kurdun: «${currentDrill.corrected}» (+5 XP)`,
      });
      void api("/api/mistakes", { body: { id: currentDrill.id, mastered: true } });
    } else {
      setDrillFeedback({
        ok: false,
        msg: `Doğrusu: «${currentDrill.corrected}» — ${currentDrill.explanation}`,
      });
    }
  }

  function nextDrill() {
    setDrillInput("");
    setDrillFeedback(null);
    if (drillIdx + 1 < activeMistakes.length) {
      setDrillIdx(drillIdx + 1);
    } else {
      setDrillMode(false);
      setDrillIdx(0);
      load();
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold">
            Kişisel Zayıf Nokta Hafızası & Koç Analizi
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-1">
            🧠 Kişisel Hata Defterim ({activeMistakes.length} Aktif Nokta)
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Derslerde ve AI Koç sohbetlerinde yaptığın hatalar otomatik olarak burada toplanır ve AI Koç sonraki
            sohbetlerde bu kalıpları sana doğal biçimde tekrar ettirir.
          </p>
        </div>
        {activeMistakes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setDrillMode((v) => !v);
              setDrillIdx(0);
              setDrillInput("");
              setDrillFeedback(null);
            }}
            className="btn-primary text-sm shrink-0"
          >
            {drillMode ? "📋 Listeye Dön" : `⚡ Hatalarımla Antrenman Yap (${activeMistakes.length})`}
          </button>
        )}
      </div>

      {/* ────────────────── ⚡ ZAYIF NOKTA ANTRENMAN MODU ────────────────── */}
      {drillMode && currentDrill && (
        <div className="card p-6 md:p-8 border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-slate-900 to-rose-500/10 space-y-5">
          <div className="flex items-center justify-between text-xs text-amber-200 font-semibold">
            <span>
              ⚡ Zayıf Nokta Antrenmanı • {drillIdx + 1} / {activeMistakes.length}
            </span>
            <span>Daha önce {currentDrill.count} kez karıştırıldı</span>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-white/55">Daha önce şöyle yazmıştın (Hatalı):</div>
            <div className="rounded-xl bg-rose-500/15 border border-rose-400/30 px-4 py-3 text-lg font-semibold line-through text-rose-200">
              {currentDrill.original}
            </div>
            <div className="text-sm text-sky-200 pt-1">💡 İpucu: {currentDrill.explanation}</div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/70">Şimdi doğal ve doğru Rusçasını yaz:</label>
            <RuInput
              value={drillInput}
              onChange={setDrillInput}
              onSubmit={() => (drillFeedback ? nextDrill() : checkDrill())}
              placeholder="Doğru Rusça cümleyi yaz…"
            />
          </div>

          {drillFeedback && (
            <div
              className={`rounded-xl border p-4 text-sm font-medium ${
                drillFeedback.ok
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                  : "border-amber-400/40 bg-amber-500/15 text-amber-100"
              }`}
            >
              {drillFeedback.msg}
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!drillFeedback ? (
              <button type="button" onClick={checkDrill} className="btn-primary text-sm">
                Kontrol Et →
              </button>
            ) : (
              <button type="button" onClick={nextDrill} className="btn-primary text-sm">
                Sonraki Hata →
              </button>
            )}
          </div>
        </div>
      )}

      {/* HATA LİSTESİ */}
      {mistakes.length === 0 ? (
        <div className="card p-10 text-center space-y-4">
          <div className="text-5xl">✨</div>
          <h2 className="font-display text-xl font-bold">Henüz kaydedilmiş bir hatan yok!</h2>
          <p className="text-sm text-white/65 max-w-md mx-auto">
            AI Koç ile senaryolarda konuşurken veya ders alıştırmalarını çözerken yaptığın hatalar otomatik olarak
            buraya kaydedilir.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/coach" className="btn-primary text-sm">
              💬 AI Koç ile Pratik Yap
            </Link>
            <Link href="/roadmap" className="btn-ghost text-sm">
              🗺️ Derslere Git
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeMistakes.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-amber-300">
                🎯 Üzerinde Çalışılan Zayıf Noktalar ({activeMistakes.length})
              </h2>
              <div className="grid gap-3">
                {activeMistakes.map((m) => (
                  <div key={m.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-md bg-rose-500/20 border border-rose-400/30 px-2 py-0.5 text-[11px] font-bold text-rose-200">
                          {m.count}x tekrarlandı
                        </span>
                        <span className="text-[11px] text-white/45">
                          Kaynak: {m.source === "coach" ? "💬 AI Koç Sohbeti" : "📚 Ders Egzersizi"}
                        </span>
                      </div>
                      <div className="text-base">
                        <span className="line-through text-rose-300/75 mr-2">{m.original}</span>
                        <span className="text-white/50">→</span>{" "}
                        <b className="text-emerald-300 text-lg">{m.corrected}</b>
                      </div>
                      <div className="text-xs md:text-sm text-white/75">💡 {m.explanation}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <SpeakButton text={m.corrected} size="sm" withSlow showSpeakerBadge />
                      <button
                        type="button"
                        onClick={() => toggleMastered(m)}
                        className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 hover:bg-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-200"
                      >
                        ✓ Öğrendim
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(m.id)}
                        className="text-xs text-white/35 hover:text-rose-300 px-2"
                        title="Sil"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {masteredMistakes.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-emerald-300">
                ✅ Ustalaşılan / Çözülen Hatalar ({masteredMistakes.length})
              </h2>
              <div className="grid gap-2.5 opacity-75">
                {masteredMistakes.map((m) => (
                  <div key={m.id} className="card p-4 flex items-center justify-between gap-3">
                    <div className="text-sm">
                      <span className="line-through text-white/40 mr-2">{m.original}</span> →{" "}
                      <b className="text-emerald-300">{m.corrected}</b>
                    </div>
                    <div className="flex items-center gap-2">
                      <SpeakButton text={m.corrected} size="sm" />
                      <button
                        type="button"
                        onClick={() => toggleMastered(m)}
                        className="text-xs text-sky-300 hover:underline"
                      >
                        Tekrar Aktif Et
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
