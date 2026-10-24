"use client";

import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/client";
import type { Scenario } from "@/content/types";
import type { CoachMeta } from "@/lib/coach";
import { SpeakButton, Spinner, speak, prefetchAudio } from "@/components/Speak";
import { resolveVoiceProfile } from "@/lib/voices";
import { RuInput } from "@/components/RuInput";
import { ErrorBox } from "@/components/Banners";

interface ChatMsg {
  id: number;
  role: "user" | "coach";
  content: string;
  meta: CoachMeta | null;
}

interface AffinityData {
  scenarioId: string;
  affinity: number;
  messageCount: number;
  tierLabel: string;
  tierEmoji: string;
  facts: string[];
}

interface SessionData {
  id: number;
  title: string;
  scenario: Scenario;
  affinity?: AffinityData;
  messages: ChatMsg[];
}

interface SRInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: { 0: { transcript: string }; isFinal?: boolean }[] }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

function getSR(): (new () => SRInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SRInstance;
    webkitSpeechRecognition?: new () => SRInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function CoachSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<SessionData | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<{ message: string; code?: string } | null>(null);
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  // 📞 Canlı Sesli Görüşme (Hands-Free Telefon Modu)
  const [callMode, setCallMode] = useState(false);
  const [callListening, setCallListening] = useState(false);
  const [callSpeaking, setCallSpeaking] = useState(false);
  const [callShowSubtitles, setCallShowSubtitles] = useState(false);
  const [callAutoLoop, setCallAutoLoop] = useState(true);
  const [callLiveTranscript, setCallLiveTranscript] = useState("");
  const [showCallReport, setShowCallReport] = useState(false);
  const srRef = useRef<SRInstance | null>(null);
  const callModeRef = useRef(false);
  const callAutoLoopRef = useRef(true);

  useEffect(() => {
    callModeRef.current = callMode;
  }, [callMode]);

  useEffect(() => {
    callAutoLoopRef.current = callAutoLoop;
  }, [callAutoLoop]);

  useEffect(() => {
    api<SessionData>(`/api/coach/sessions/${id}`)
      .then((d) => {
        setSession(d);
        const firstCoach = d.messages.find((m) => m.role === "coach");
        if (firstCoach) {
          prefetchAudio(firstCoach.content, { scenarioId: d.scenario.id });
        }
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages.length]);

  function stopListening() {
    try {
      srRef.current?.stop();
    } catch {
      /* ignore */
    }
    setCallListening(false);
  }

  function startCallListening() {
    const SR = getSR();
    if (!SR) {
      setErr({ message: "Tarayıcın ses tanımayı desteklemiyor (Chrome veya Edge önerilir)." });
      return;
    }
    stopListening();
    const rec = new SR();
    rec.lang = "ru-RU";
    rec.interimResults = true;
    rec.continuous = false;
    setCallLiveTranscript("");
    setCallListening(true);

    let finalSpoken = "";
    rec.onresult = (e) => {
      const latest = e.results[e.results.length - 1];
      const txt = latest?.[0]?.transcript ?? "";
      setCallLiveTranscript(txt);
      if (latest?.isFinal !== false) {
        finalSpoken = txt;
      }
    };
    rec.onerror = () => {
      setCallListening(false);
    };
    rec.onend = () => {
      setCallListening(false);
      const toSend = (finalSpoken || callLiveTranscript).trim();
      if (toSend && callModeRef.current) {
        void send(toSend, true);
      }
    };
    srRef.current = rec;
    rec.start();
  }

  async function send(textOverride?: string, fromVoiceCall = false) {
    const msg = (textOverride ?? input).trim();
    if (!msg || sending) return;
    setErr(null);
    setSending(true);
    if (!textOverride) setInput("");
    setCallLiveTranscript("");

    try {
      const res = await api<{ user: ChatMsg; coach: ChatMsg; affinity?: AffinityData }>(`/api/coach/sessions/${id}`, {
        body: { message: msg },
      });
      setSession((prev) =>
        prev
          ? {
              ...prev,
              affinity: res.affinity ?? prev.affinity,
              messages: [...prev.messages, res.user, res.coach],
            }
          : prev,
      );
      setCallSpeaking(true);
      await speak(res.coach.content, { scenarioId: session?.scenario.id });
      setCallSpeaking(false);

      // Eller serbest telefon modundaysak karakter sözünü bitirince mikrofonu otomatik aç
      if (fromVoiceCall && callModeRef.current && callAutoLoopRef.current) {
        setTimeout(() => {
          if (callModeRef.current) startCallListening();
        }, 350);
      }
    } catch (e) {
      setCallSpeaking(false);
      setErr({
        message: e instanceof Error ? e.message : "Mesaj gönderilemedi",
        code: e instanceof ApiError ? e.code : undefined,
      });
      if (!textOverride) setInput(msg);
    } finally {
      setSending(false);
    }
  }

  async function saveWord(w: { ru: string; translit: string; tr: string }) {
    await api("/api/cards", { body: w });
    setAddedWords((a) => ({ ...a, [w.ru]: true }));
  }

  function enterCallMode() {
    setShowCallReport(false);
    setCallMode(true);
    const lastCoachMsg = [...(session?.messages ?? [])].reverse().find((m) => m.role === "coach");
    if (lastCoachMsg && session) {
      setCallSpeaking(true);
      void speak(lastCoachMsg.content, { scenarioId: session.scenario.id }).then(() => {
        setCallSpeaking(false);
        if (callAutoLoopRef.current) startCallListening();
      });
    }
  }

  function endCallAndShowReport() {
    stopListening();
    setCallMode(false);
    setShowCallReport(true);
  }

  if (!session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-rose-400" />
      </div>
    );
  }

  const lastCoach = [...session.messages].reverse().find((m) => m.role === "coach");
  const completedGoals = new Set<number>(
    session.messages.flatMap((m) => m.meta?.goalsCompleted ?? []),
  );
  const voiceProfile = resolveVoiceProfile({ scenarioId: session.scenario.id });
  const affinity = session.affinity;

  // Konuşma Karnesi (Call Summary) istatistikleri
  const userMessages = session.messages.filter((m) => m.role === "user");
  const allCorrections = userMessages.flatMap((m) => m.meta?.corrections ?? []);
  const allNewWords = session.messages
    .filter((m) => m.role === "coach")
    .flatMap((m) => m.meta?.newWords ?? []);
  const accuracyScore =
    userMessages.length === 0
      ? 100
      : Math.max(45, Math.min(100, Math.round(100 - (allCorrections.length / userMessages.length) * 22)));

  return (
    <div className="space-y-5">
      {/* Üst bilgi, Karakter İlişki Barı (Affinity) ve Telefon Modu Butonu */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Link href="/coach" className="text-xs text-sky-300 hover:underline">
              ← Tüm Senaryolar
            </Link>
            <h1 className="font-display text-xl font-bold mt-0.5">{session.title}</h1>
            <div className="text-xs text-white/55">{session.scenario.character}</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200">
              🎙️ <b>{voiceProfile.label}</b>
            </div>
            <button
              type="button"
              onClick={() => (callMode ? endCallAndShowReport() : enterCallMode())}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                callMode
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                  : "bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30"
              }`}
            >
              {callMode ? "📴 Aramayı Bitir & Karne Al" : "📞 Canlı Sesli Arama Modu"}
            </button>
          </div>
        </div>

        {/* Kalıcı Karakter İlişki Barı (Affinity) & Hatırlanan Detaylar */}
        {affinity && (
          <div className="rounded-xl bg-black/25 border border-white/10 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-200">
                {affinity.tierEmoji} İlişki Seviyesi: <b>{affinity.tierLabel}</b>
              </span>
              <span className="text-white/60">Samimiyet: %{affinity.affinity}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all"
                style={{ width: `${affinity.affinity}%` }}
              />
            </div>
            {affinity.facts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-white/45">🧠 Seni hatırlıyor:</span>
                {affinity.facts.slice(0, 4).map((f, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-white/8 border border-white/10 px-2 py-0.5 text-[11px] text-sky-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Senaryo hedefleri */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
          {session.scenario.goals.map((g, i) => {
            const done = completedGoals.has(i);
            return (
              <span
                key={i}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  done ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/65"
                }`}
              >
                {done ? "✓ " : "○ "}
                {g}
              </span>
            );
          })}
        </div>
      </div>

      {/* ────────────────── 📞 CANLI SESLİ ARAMA (HANDS-FREE VOICE CALL) EKRANI ────────────────── */}
      {callMode && (
        <div className="card p-8 bg-[#FAF8F3] text-center space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-[#57534E]">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#18181B] bg-[#DCFCE7] px-3 py-1 text-[#15803D] font-extrabold">
              <span className="h-2 w-2 rounded-full bg-[#15803D] animate-ping" /> CANLI SESLİ GÖRÜŞME
            </span>
            <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#141413]">
              <input
                type="checkbox"
                checked={callAutoLoop}
                onChange={(e) => setCallAutoLoop(e.target.checked)}
                className="accent-[#D9381E]"
              />
              <span>Eller Serbest (Otomatik Sıra)</span>
            </label>
          </div>

          {/* Karakter Avatar & Ses Dalgası */}
          <div className="py-4 flex flex-col items-center space-y-3">
            <div
              className={`relative grid h-28 w-28 place-items-center rounded-full text-5xl border-4 border-[#18181B] transition-all duration-300 ${
                callSpeaking
                  ? "bg-[#E0EAFF] shadow-[0_6px_0_0_#1D4ED8] scale-105"
                  : callListening
                    ? "bg-[#FFE4E0] shadow-[0_6px_0_0_#D9381E] scale-105"
                    : "bg-white shadow-[0_4px_0_0_#18181B]"
              }`}
            >
              {session.scenario.emoji}
            </div>
            <div className="font-display text-2xl font-extrabold text-[#141413]">
              {voiceProfile.label.split("(")[0]}
            </div>
            <div className="font-mono-code text-xs font-extrabold text-[#1D4ED8]">
              {sending
                ? "DÜŞÜNÜYOR…"
                : callSpeaking
                  ? "KARAKTER KONUŞUYOR…"
                  : callListening
                    ? "SENİ DİNLİYOR… (RUSÇA KONUŞ)"
                    : "HAZIR — KONUŞMAK İÇİN MİKROFONA DOKUN"}
            </div>
          </div>

          {/* Gizlenebilir Altyazı (Subtitles) */}
          <div className="max-w-lg mx-auto space-y-2">
            {callShowSubtitles && lastCoach ? (
              <div className="rounded-2xl bg-white border-2 border-[#18181B] p-4 space-y-1.5 shadow-[0_3px_0_0_#18181B]">
                <div className="text-base font-extrabold text-[#141413]">{lastCoach.content}</div>
                {lastCoach.meta?.translation && (
                  <div className="text-xs font-medium text-[#57534E]">🇹🇷 {lastCoach.meta.translation}</div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#EFECE4] border-2 border-[#18181B] p-4 text-xs font-bold text-[#57534E]">
                Gerçek hayat dinleme pratiği için altyazı gizli.
              </div>
            )}

            {callLiveTranscript && (
              <div className="rounded-xl bg-[#FFE4E0] border-2 border-[#18181B] px-4 py-2 text-sm font-bold text-[#D9381E]">
                Duyulan: <b>«{callLiveTranscript}»</b>
              </div>
            )}
          </div>

          {/* Arama Kontrolleri */}
          <div className="flex justify-center items-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => setCallShowSubtitles((v) => !v)}
              className="btn-ghost text-xs"
            >
              {callShowSubtitles ? "Altyazıyı Gizle" : "Altyazıyı Göster"}
            </button>

            <button
              type="button"
              disabled={sending}
              onClick={() => (callListening ? stopListening() : startCallListening())}
              className={`rounded-2xl border-2 border-[#18181B] px-6 py-3.5 font-extrabold text-sm transition shadow-[0_4px_0_0_#18181B] cursor-pointer ${
                callListening
                  ? "bg-[#D9381E] !text-white animate-pulse"
                  : "bg-[#15803D] !text-white hover:brightness-110"
              }`}
            >
              {callListening ? "⏹ Dinlemeyi Bitir & Gönder" : "🎙️ Bas ve Rusça Konuş"}
            </button>

            {lastCoach && (
              <button
                type="button"
                onClick={() => speak(lastCoach.content, { scenarioId: session.scenario.id })}
                className="btn-ghost text-xs"
              >
                ▶ Son Cümleyi Dinle
              </button>
            )}

            <button
              type="button"
              onClick={endCallAndShowReport}
              className="btn-ghost text-xs bg-[#FFE4E6] text-[#BE123C]"
            >
              Görüşmeyi Bitir & Karne Al
            </button>
          </div>
        </div>
      )}

      {/* ────────────────── 📊 KONUŞMA KARNESİ (CALL SUMMARY REPORT) ────────────────── */}
      {showCallReport && (
        <div className="card p-6 border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-slate-900 to-sky-500/10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-300 font-bold">📊 Konuşma Karnesi</div>
              <h2 className="font-display text-2xl font-bold mt-0.5">Görüşme Analizi & Geri Bildirim</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCallReport(false)}
              className="text-xs text-white/50 hover:text-white"
            >
              ✕ Kapat
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
              <div className="text-xs text-white/50">Doğruluk & Akıcılık</div>
              <div className="font-display text-2xl font-bold text-emerald-300 mt-1">%{accuracyScore}</div>
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
              <div className="text-xs text-white/50">Kurulan Cümle</div>
              <div className="font-display text-2xl font-bold text-sky-300 mt-1">{userMessages.length}</div>
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
              <div className="text-xs text-white/50">Tamamlanan Hedef</div>
              <div className="font-display text-2xl font-bold text-amber-300 mt-1">
                {completedGoals.size} / {session.scenario.goals.length}
              </div>
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
              <div className="text-xs text-white/50">Karakter Samimiyeti</div>
              <div className="font-display text-2xl font-bold text-rose-300 mt-1">%{affinity?.affinity ?? 10}</div>
            </div>
          </div>

          {allCorrections.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  ✏️ Görüşmedeki Kritik Düzeltmeler (Hata Defterine Kaydedildi)
                </div>
                <Link href="/mistakes" className="text-xs text-sky-300 hover:underline">
                  🧠 Hata Defterime Git →
                </Link>
              </div>
              <div className="grid gap-2">
                {allCorrections.slice(-4).map((c, i) => (
                  <div key={i} className="rounded-xl bg-black/30 border border-amber-400/25 p-3 text-xs">
                    <span className="line-through text-white/45">{c.original}</span> →{" "}
                    <b className="text-emerald-300">{c.corrected}</b>
                    <div className="text-white/70 mt-0.5">{c.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allNewWords.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                ✨ Bu Sohbette Geçen Önemli Kalıplar
              </div>
              <div className="flex flex-wrap gap-2">
                {allNewWords.slice(0, 6).map((w, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => saveWord(w)}
                    disabled={addedWords[w.ru]}
                    className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs"
                  >
                    <b>{w.ru}</b> — {w.tr} <span className="text-sky-300 ml-1">{addedWords[w.ru] ? "✓" : "+ Kart"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mesaj akışı */}
      <div className="space-y-4">
        {session.messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-xl rounded-2xl p-4 space-y-2 ${
                m.role === "user"
                  ? "bg-gradient-to-br from-rose-500/30 to-orange-500/20 border border-rose-400/30"
                  : "card"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-base font-medium leading-relaxed">{m.content}</div>
                {m.role === "coach" && (
                  <SpeakButton text={m.content} size="sm" withSlow scenarioId={session.scenario.id} />
                )}
              </div>

              {m.role === "coach" && m.meta?.translit && (
                <div className="text-xs text-sky-300">{m.meta.translit}</div>
              )}
              {m.role === "coach" && m.meta?.translation && (
                <div className="text-xs text-white/60">🇹🇷 {m.meta.translation}</div>
              )}

              {/* Öğrenci mesajının düzeltmeleri */}
              {m.role === "user" && m.meta?.corrections && m.meta.corrections.length > 0 && (
                <div className="rounded-xl bg-black/30 p-3 text-xs space-y-1.5 border border-amber-400/30">
                  <div className="font-semibold text-amber-200">✏️ Koçun Düzeltmesi (Hata Defterine Eklendi):</div>
                  {m.meta.corrections.map((c, idx) => (
                    <div key={idx}>
                      <span className="line-through text-white/50">{c.original}</span> →{" "}
                      <b className="text-emerald-300">{c.corrected}</b>
                      <div className="text-white/70">{c.explanation}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Koç notu */}
              {m.role === "coach" && m.meta?.coachNote && (
                <div className="rounded-xl bg-sky-500/10 border border-sky-400/25 px-3 py-2 text-xs text-sky-100">
                  💡 <b>Koç Anya:</b> {m.meta.coachNote}
                </div>
              )}

              {/* Yeni kelimeler — tek tıkla SRS kartlarına ekle */}
              {m.role === "coach" && m.meta?.newWords && m.meta.newWords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.meta.newWords.map((w, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => saveWord(w)}
                      disabled={addedWords[w.ru]}
                      className="rounded-lg bg-white/10 hover:bg-white/15 px-2.5 py-1 text-xs text-left transition"
                      title="Tekrar kartlarıma ekle"
                    >
                      <span className="font-semibold text-white">{w.ru}</span>{" "}
                      <span className="text-white/60">— {w.tr}</span>{" "}
                      <span className="text-sky-300 ml-1">{addedWords[w.ru] ? "✓" : "+ Kart"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {err && <ErrorBox message={err.message} code={err.code} />}

      {/* Önerilen hazır cevaplar (takılırsan tek tıkla doldur) */}
      {lastCoach?.meta?.suggestions && lastCoach.meta.suggestions.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs text-white/50">💡 Takıldıysan örnek cevaplardan birine tıkla:</div>
          <div className="flex flex-wrap gap-2">
            {lastCoach.meta.suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInput(s.ru)}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-left transition"
              >
                <div className="font-semibold text-white">{s.ru}</div>
                <div className="text-white/50">{s.tr}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mesaj yazma alanı */}
      <div className="card p-4 space-y-3">
        <RuInput
          value={input}
          onChange={setInput}
          onSubmit={() => send()}
          disabled={sending}
          placeholder="Rusça cevabını yaz (Enter = gönder, 'Я' = Kiril klavye)…"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/45">
            İpucu: Eller serbest konuşmak için üstteki <b>📞 Canlı Sesli Arama Modu</b> butonunu kullanabilirsin.
          </span>
          <button type="button" onClick={() => send()} disabled={sending || !input.trim()} className="btn-primary text-sm">
            {sending ? <Spinner /> : "Gönder →"}
          </button>
        </div>
      </div>
    </div>
  );
}
