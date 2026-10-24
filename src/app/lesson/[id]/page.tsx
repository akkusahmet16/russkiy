"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/client";
import type { LessonContent, Exercise, Phrase } from "@/content/types";
import { Markdown } from "@/components/Markdown";
import { SpeakButton, Spinner, speak, prefetchAudio } from "@/components/Speak";
import { resolveVoiceProfile } from "@/lib/voices";
import { PronunciationCheck } from "@/components/Recorder";
import { RuInput } from "@/components/RuInput";
import { ErrorBox } from "@/components/Banners";

interface LessonData {
  id: string;
  title: string;
  goal: string;
  level: string;
  unitTitle: string;
  content: LessonContent;
  nextLessonId: string | null;
  scenario: { id: string; title: string; emoji: string } | null;
}

interface CheckResult {
  verdict: "correct" | "almost" | "wrong";
  score: number;
  corrected: string;
  translit: string;
  feedback: string;
  alternatives?: string[];
}

/** Rusça kelimedeki vurgulu ünlüyü (а́, о́ vb.) görsel olarak öne çıkarır */
function HighlightedRu({ text }: { text: string }) {
  const nfd = text.normalize("NFD");
  const parts: { char: string; stressed: boolean }[] = [];
  for (let i = 0; i < nfd.length; i++) {
    if (nfd[i + 1] === "\u0301") {
      parts.push({ char: (nfd[i] + "\u0301").normalize("NFC"), stressed: true });
      i++;
    } else {
      parts.push({ char: nfd[i], stressed: false });
    }
  }
  return (
    <span>
      {parts.map((p, i) =>
        p.stressed ? (
          <span key={i} className="text-[#D9381E] underline decoration-[#D9381E] decoration-2 underline-offset-4">
            {p.char}
          </span>
        ) : (
          <span key={i}>{p.char}</span>
        ),
      )}
    </span>
  );
}

/** Markdown metnini '## ' başlıklarına göre etkileşimli mini kartlara böler */
function splitIntoSlides(intro: string): { title: string; body: string }[] {
  const raw = intro.split(/\n(?=##\s+)/g).map((s) => s.trim()).filter(Boolean);
  if (raw.length === 0) return [{ title: "Ders Özeti", body: intro }];
  return raw.map((chunk, idx) => {
    const m = chunk.match(/^##\s+([^\n]+)\n?([\s\S]*)$/);
    if (m) return { title: m[1].trim(), body: m[2].trim() };
    return { title: `Adım ${idx + 1}`, body: chunk };
  });
}

/** Kelime bankası (Word-Bank) için cümleyi ve çeldirici kelimeleri hazırlar */
function buildWordBank(answer: string, phrases: Phrase[], seed: string): string[] {
  const cleanWords = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\u0301/g, "")
      .normalize("NFC")
      .replace(/[.,!?;:«»"'…]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const targetWords = cleanWords(answer);
  const pool = new Set<string>();
  for (const p of phrases) {
    for (const w of cleanWords(p.ru)) {
      if (!targetWords.includes(w) && w.length > 1) pool.add(w);
    }
  }
  const distractors = Array.from(pool).slice(0, 4);
  const all = [...targetWords, ...distractors];
  // Deterministik karıştırma
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return all
    .map((w, idx) => ({ w, sort: Math.sin(hash + idx * 17) }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.w);
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<LessonData | null>(null);
  const [err, setErr] = useState<{ message: string; code?: string } | null>(null);

  // 4 Aşamalı Etkileşimli Eğitim Akışı:
  // "concepts" (Adım adım mantık) -> "phrases" (Kalıp & ses keşfi) -> "practice" (Alıştırmalar) -> "done"
  const [stage, setStage] = useState<"concepts" | "phrases" | "practice" | "done">("concepts");

  // Aşama 1: Konsept slaytları
  const [slideIdx, setSlideIdx] = useState(0);
  const [showAllNotes, setShowAllNotes] = useState(false);

  // Aşama 2: Etkileşimli Kalıp Kartları
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showAllPhrases, setShowAllPhrases] = useState(false);
  const [practiceMicPhrase, setPracticeMicPhrase] = useState(false);

  // Aşama 3: Alıştırmalar
  const [exIndex, setExIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [useWordBank, setUseWordBank] = useState(true);
  const [pickedWords, setPickedWords] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  // Ders tamamlama
  const [completionInfo, setCompletionInfo] = useState<{ xp: number; cardsAdded: number } | null>(null);

  // "Koça Sor" çekmecesi
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setErr(null);
    setStage("concepts");
    setSlideIdx(0);
    setPhraseIdx(0);
    setExIndex(0);
    setScores([]);
    api<LessonData>(`/api/lessons/${id}`)
      .then((d) => {
        setData(d);
        // İlk 3 kalıbın sesini arka planda hazırla
        d.content.phrases.slice(0, 3).forEach((p) => prefetchAudio(p.ru));
      })
      .catch((e) => setErr({ message: e.message, code: e instanceof ApiError ? e.code : undefined }));
  }, [id]);

  const slides = useMemo(() => (data ? splitIntoSlides(data.content.intro) : []), [data]);
  const phrases = data?.content.phrases ?? [];
  const exercises = data?.content.exercises ?? [];
  const currentEx: Exercise | undefined = exercises[exIndex];

  const wordBank = useMemo(() => {
    if (!currentEx || currentEx.type !== "translate") return [];
    return buildWordBank(currentEx.answer, phrases, currentEx.id + currentEx.prompt);
  }, [currentEx, phrases]);

  // Yeni kalıp kartına geçildiğinde sesi önceden yükle ve otomatik çal
  useEffect(() => {
    if (stage === "phrases" && phrases[phraseIdx]) {
      prefetchAudio(phrases[phraseIdx].ru);
      if (phrases[phraseIdx + 1]) prefetchAudio(phrases[phraseIdx + 1].ru);
    }
  }, [stage, phraseIdx, phrases]);

  if (err) {
    return (
      <div className="space-y-4">
        <Link href="/roadmap" className="text-sm text-sky-300 hover:underline">
          ← Yol Haritasına Dön
        </Link>
        <ErrorBox message={err.message} code={err.code} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-12 text-center space-y-4">
        <Spinner className="h-9 w-9 text-rose-400 mx-auto" />
        <div className="font-display text-lg font-bold">Etkileşimli ders hazırlanıyor…</div>
        <p className="text-sm text-white/60 max-w-md mx-auto">
          Koç Anya bu dersi senin seviyene göre adım adım kartlar ve alıştırmalar hâlinde oluşturuyor.
        </p>
      </div>
    );
  }

  function togglePickWord(idx: number) {
    if (checkResult) return;
    setPickedWords((prev) => {
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      setUserInput(next.map((i) => wordBank[i]).join(" "));
      return next;
    });
  }

  async function submitExercise() {
    if (!currentEx) return;
    if (currentEx.type === "choice") {
      if (selectedChoice === null) return;
      const ok = selectedChoice === currentEx.correctIndex;
      const corr = currentEx.options[currentEx.correctIndex];
      speak(corr);
      setCheckResult({
        verdict: ok ? "correct" : "wrong",
        score: ok ? 100 : 0,
        corrected: corr,
        translit: "",
        feedback: currentEx.explanation || (ok ? "Harika seçim!" : `Doğru cevap: ${corr}`),
      });
      setScores((s) => [...s, ok ? 100 : 0]);
      return;
    }

    if (currentEx.type === "translate" || currentEx.type === "respond") {
      if (!userInput.trim()) return;
      setChecking(true);
      try {
        const r = await api<CheckResult>("/api/check", {
          body: {
            type: currentEx.type,
            prompt: currentEx.prompt,
            answer: currentEx.answer,
            userAnswer: userInput,
          },
        });
        setCheckResult(r);
        if (r.corrected) speak(r.corrected);
        setScores((s) => [...s, r.score]);
      } catch {
        const clean = (x: string) =>
          x
            .toLowerCase()
            .normalize("NFD")
            .replace(/\u0301/g, "")
            .replace(/[.,!?]/g, "")
            .trim();
        const isMatch = clean(userInput) === clean(currentEx.answer);
        setCheckResult({
          verdict: isMatch ? "correct" : "almost",
          score: isMatch ? 100 : 65,
          corrected: currentEx.answer,
          translit: "",
          feedback: isMatch ? "Tam isabet!" : `Doğal söylenişi: «${currentEx.answer}»`,
        });
        speak(currentEx.answer);
        setScores((s) => [...s, isMatch ? 100 : 65]);
      } finally {
        setChecking(false);
      }
    }
  }

  function nextExercise() {
    setCheckResult(null);
    setUserInput("");
    setPickedWords([]);
    setSelectedChoice(null);
    if (exIndex + 1 < exercises.length) {
      setExIndex(exIndex + 1);
    } else {
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 90;
      setStage("done");
      api<{ xp: number; cardsAdded: number }>(`/api/lessons/${id}/complete`, { body: { score: avg } })
        .then(setCompletionInfo)
        .catch(console.error);
    }
  }

  async function askCoach() {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      const r = await api<{ answer: string }>("/api/ask", { body: { lessonId: id, question } });
      setAnswer(r.answer);
    } catch (e) {
      setAnswer(e instanceof Error ? `⚠️ ${e.message}` : "Bir hata oluştu.");
    } finally {
      setAsking(false);
    }
  }

  async function launchScenario() {
    if (!data?.scenario) return;
    const { id: sessionId } = await api<{ id: number }>("/api/coach/sessions", {
      body: { scenarioId: data.scenario.id },
    });
    router.push(`/coach/${sessionId}`);
  }

  const currentPhrase = phrases[phraseIdx];

  return (
    <div className="space-y-6">
      {/* Üst Başlık & 3 Aşamalı Etkileşimli Sekmeler */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/roadmap" className="text-xs font-semibold text-sky-300 hover:underline">
            ← {data.level} • {data.unitTitle}
          </Link>
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-1">{data.title}</h1>
          <p className="text-sm text-white/70 mt-0.5">🎯 {data.goal}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStage("concepts")}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold transition ${
              stage === "concepts" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25" : "bg-white/10 text-white/75 hover:bg-white/15"
            }`}
          >
            1. Mantığı Kavra ({slides.length})
          </button>
          <button
            type="button"
            onClick={() => setStage("phrases")}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold transition ${
              stage === "phrases" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25" : "bg-white/10 text-white/75 hover:bg-white/15"
            }`}
          >
            2. Kalıp Stüdyosu ({phrases.length})
          </button>
          <button
            type="button"
            onClick={() => setStage("practice")}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold transition ${
              stage === "practice" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25" : "bg-white/10 text-white/75 hover:bg-white/15"
            }`}
          >
            3. İnteraktif Test ({exercises.length})
          </button>
        </div>
      </div>

      {/* ────────────────── AŞAMA 1: ETKİLEŞİMLİ KONSEPT KARTLARI ────────────────── */}
      {stage === "concepts" && (
        <div className="space-y-5">
          {/* Adım göstergesi ve görünüm değiştirici */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setShowAllNotes(false);
                    setSlideIdx(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    !showAllNotes && idx === slideIdx ? "w-10 bg-rose-500" : "w-3 bg-white/20 hover:bg-white/35"
                  }`}
                  title={s.title}
                />
              ))}
              <span className="ml-2 text-xs text-white/60">
                Adım {slideIdx + 1} / {slides.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAllNotes((v) => !v)}
              className="text-xs text-sky-300 hover:underline font-medium"
            >
              {showAllNotes ? "🎴 Kart Görünümüne Dön" : "📖 Tümünü Tek Sayfada Gör"}
            </button>
          </div>

          {showAllNotes ? (
            <div className="card p-6 md:p-8">
              <Markdown>{data.content.intro}</Markdown>
            </div>
          ) : (
            <div className="card p-6 md:p-8 space-y-6 border-sky-500/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                    Kavram Kartı {slideIdx + 1} / {slides.length}
                  </span>
                  <h2 className="font-display text-xl md:text-2xl font-bold text-white mt-1">
                    {slides[slideIdx]?.title}
                  </h2>
                </div>
              </div>

              <Markdown>{slides[slideIdx]?.body ?? ""}</Markdown>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                  disabled={slideIdx === 0}
                  className="btn-ghost text-sm"
                >
                  ← Önceki
                </button>
                {slideIdx + 1 < slides.length ? (
                  <button
                    type="button"
                    onClick={() => setSlideIdx((i) => i + 1)}
                    className="btn-primary text-sm"
                  >
                    Anladım, Sonraki Kart →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStage("phrases");
                      if (phrases[0]) speak(phrases[0].ru);
                    }}
                    className="btn-primary text-sm"
                  >
                    🎧 Kalıp Stüdyosuna Geç ({phrases.length} Kalıp) →
                  </button>
                )}
              </div>
            </div>
          )}

          {data.content.tips && data.content.tips.length > 0 && (
            <div className="card p-5 border-amber-400/30 bg-amber-400/10 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                🌶️ Ruslar Gerçek Hayatta Nasıl Kullanır?
              </div>
              <ul className="list-disc pl-5 text-sm md:text-base text-amber-50 space-y-1.5">
                {data.content.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── AŞAMA 2: ETKİLEŞİMLİ KALIP STÜDYOSU ────────────────── */}
      {stage === "phrases" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-white/65">
              💡 <b>Sarı altı çizili harfler</b> vurguyu gösterir. Vurgusuz <b>о</b> harflerini <b>&quot;a&quot;</b> gibi oku!
            </div>
            <button
              type="button"
              onClick={() => setShowAllPhrases((v) => !v)}
              className="text-xs text-sky-300 hover:underline font-medium"
            >
              {showAllPhrases ? "🎧 Tek Tek Odaklan" : `📋 Tüm Kalıpları Liste Olarak Gör (${phrases.length})`}
            </button>
          </div>

          {showAllPhrases ? (
            <div className="grid gap-3.5 sm:grid-cols-2">
              {phrases.map((p, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setShowAllPhrases(false);
                    setPhraseIdx(i);
                  }}
                  className="card p-5 flex items-start justify-between gap-3 cursor-pointer hover:border-sky-400/40 transition"
                >
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-white">
                      <HighlightedRu text={p.ru} />
                    </div>
                    <div className="text-sm text-sky-300 font-semibold">{p.translit}</div>
                    <div className="text-base text-slate-100">{p.tr}</div>
                    {p.note && <div className="text-xs text-amber-200 mt-1">💡 {p.note}</div>}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <SpeakButton text={p.ru} size="sm" withSlow showSpeakerBadge />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            currentPhrase && (
              <div className="card p-6 md:p-10 space-y-6 border-sky-400/25">
                {/* Hızlı geçiş noktaları */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {phrases.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPhraseIdx(idx);
                          setPracticeMicPhrase(false);
                          speak(phrases[idx].ru);
                        }}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                          idx === phraseIdx ? "bg-sky-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-white/50">
                    Kalıp {phraseIdx + 1} / {phrases.length}
                  </span>
                </div>

                {/* Ana Kalıp Sahnesi */}
                <div className="py-4 text-center space-y-4">
                  <div className="font-display text-3xl md:text-4xl font-bold tracking-wide text-white">
                    <HighlightedRu text={currentPhrase.ru} />
                  </div>
                  <div className="inline-block rounded-full bg-sky-500/15 border border-sky-400/30 px-4 py-1.5 text-base md:text-lg font-semibold text-sky-200">
                    🗣️ {currentPhrase.translit}
                  </div>
                  <div className="text-xl md:text-2xl font-semibold text-emerald-200">{currentPhrase.tr}</div>
                  {currentPhrase.note && (
                    <div className="max-w-lg mx-auto rounded-xl bg-amber-400/10 border border-amber-400/25 px-4 py-2.5 text-sm text-amber-100">
                      💡 {currentPhrase.note}
                    </div>
                  )}

                  <div className="flex justify-center items-center gap-3 pt-2 flex-wrap">
                    <span className="rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-sky-200">
                      🎙️ Konuşmacı: <b>{resolveVoiceProfile({ text: currentPhrase.ru }).label}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(currentPhrase.ru, false)}
                      className="btn-ghost text-sm"
                    >
                      🔊 Doğal Hızda Dinle
                    </button>
                    <button
                      type="button"
                      onClick={() => speak(currentPhrase.ru, true)}
                      className="btn-ghost text-sm"
                    >
                      🐢 Yavaş Dinle
                    </button>
                    <button
                      type="button"
                      onClick={() => setPracticeMicPhrase((v) => !v)}
                      className="btn-ghost text-sm"
                    >
                      🎙️ Sesli Dene
                    </button>
                  </div>

                  {practiceMicPhrase && (
                    <div className="max-w-md mx-auto pt-3 text-left">
                      <PronunciationCheck target={currentPhrase.ru} />
                    </div>
                  )}
                </div>

                {/* Önceki / Sonraki Kalıp */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = Math.max(0, phraseIdx - 1);
                      setPhraseIdx(prev);
                      setPracticeMicPhrase(false);
                      speak(phrases[prev].ru);
                    }}
                    disabled={phraseIdx === 0}
                    className="btn-ghost text-sm"
                  >
                    ← Önceki Kalıp
                  </button>

                  {phraseIdx + 1 < phrases.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        const nxt = phraseIdx + 1;
                        setPhraseIdx(nxt);
                        setPracticeMicPhrase(false);
                        speak(phrases[nxt].ru);
                      }}
                      className="btn-primary text-sm"
                    >
                      Sonraki Kalıp →
                    </button>
                  ) : (
                    <button type="button" onClick={() => setStage("practice")} className="btn-primary text-sm">
                      🎮 İnteraktif Teste Başla →
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ────────────────── AŞAMA 3: İNTERAKTİF TEST & ALIŞTIRMALAR ────────────────── */}
      {stage === "practice" && currentEx && (
        <div className="card p-6 md:p-8 space-y-6">
          {/* İlerleme çubuğu */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-white/60">
              <span>
                Alıştırma {exIndex + 1} / {exercises.length}
              </span>
              <span className="text-sky-300">
                {currentEx.type === "translate"
                  ? "🧩 Cümleyi Kur / Çevir"
                  : currentEx.type === "respond"
                    ? "💬 Diyaloğa Cevap Ver"
                    : currentEx.type === "speak"
                      ? "🎙️ Sesli Telaffuz"
                      : "🎯 Doğruyu Seç"}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-sky-400 transition-all"
                style={{ width: `${Math.round(((exIndex + 1) / exercises.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* Soru başlığı */}
          <div className="space-y-2">
            <div className="text-xl md:text-2xl font-bold text-white">{currentEx.prompt}</div>
            {"hint" in currentEx && currentEx.hint && (
              <div className="text-sm text-amber-200">💡 İpucu: {currentEx.hint}</div>
            )}
          </div>

          {/* Çoktan seçmeli */}
          {currentEx.type === "choice" && (
            <div className="grid gap-3">
              {currentEx.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={Boolean(checkResult)}
                  onClick={() => setSelectedChoice(idx)}
                  className={`rounded-xl border p-4 text-left text-lg font-semibold transition ${
                    selectedChoice === idx
                      ? "border-sky-400 bg-sky-500/20 text-white"
                      : "border-white/12 bg-black/25 hover:border-white/30"
                  }`}
                >
                  <HighlightedRu text={opt} />
                </button>
              ))}
            </div>
          )}

          {/* Çeviri: Hem Kelime Bankası (Word-Bank) hem Klavye Modu */}
          {currentEx.type === "translate" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">
                  {useWordBank ? "Kelimelere tıklayarak cümleyi kur:" : "Kiril veya Latin harflerle cevabını yaz:"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUseWordBank((v) => !v);
                    setPickedWords([]);
                  }}
                  className="text-xs text-sky-300 hover:underline font-medium"
                >
                  {useWordBank ? "⌨️ Klavyeyle Kendim Yazacağım" : "🧩 Kelime Bloklarını Göster"}
                </button>
              </div>

              {useWordBank ? (
                <div className="space-y-4">
                  {/* Seçilen kelimeler kutusu */}
                  <div className="min-h-[60px] rounded-xl border border-white/15 bg-black/35 p-3.5 flex flex-wrap items-center gap-2">
                    {pickedWords.length === 0 ? (
                      <span className="text-sm text-white/35">Aşağıdaki Rusça kelimelere sırayla tıkla…</span>
                    ) : (
                      pickedWords.map((wIdx) => (
                        <button
                          key={wIdx}
                          type="button"
                          onClick={() => togglePickWord(wIdx)}
                          className="rounded-xl bg-sky-500/25 border border-sky-400/50 px-3.5 py-1.5 text-lg font-semibold text-white hover:bg-rose-500/30 transition"
                        >
                          {wordBank[wIdx]}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Kelime havuzu */}
                  <div className="flex flex-wrap gap-2">
                    {wordBank.map((w, idx) => {
                      const picked = pickedWords.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={picked || Boolean(checkResult)}
                          onClick={() => {
                            speak(w);
                            togglePickWord(idx);
                          }}
                          className={`rounded-xl border px-4 py-2 text-lg font-semibold transition ${
                            picked
                              ? "border-white/5 bg-white/5 text-transparent cursor-default"
                              : "border-white/15 bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <RuInput
                  value={userInput}
                  onChange={setUserInput}
                  onSubmit={checkResult ? nextExercise : submitExercise}
                  disabled={checking || Boolean(checkResult)}
                  placeholder="Cevabını Rusça yaz… (Sağ üstteki 'Я' butonuyla ekran klavyesini açabilirsin)"
                />
              )}
            </div>
          )}

          {/* Duruma Cevap Verme (Respond) */}
          {currentEx.type === "respond" && (
            <RuInput
              value={userInput}
              onChange={setUserInput}
              onSubmit={checkResult ? nextExercise : submitExercise}
              disabled={checking || Boolean(checkResult)}
              placeholder="Cevabını Rusça yaz… (Sağ üstteki 'Я' butonuyla ekran klavyesini açabilirsin)"
            />
          )}

          {/* Sesli Telaffuz */}
          {currentEx.type === "speak" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/15 bg-black/30 p-5 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    <HighlightedRu text={currentEx.answer} />
                  </div>
                  {currentEx.translit && <div className="text-base text-sky-300 mt-1">{currentEx.translit}</div>}
                </div>
                <SpeakButton text={currentEx.answer} withSlow />
              </div>
              <PronunciationCheck
                target={currentEx.answer}
                onResult={(sc) => {
                  setScores((s) => [...s, sc]);
                  setCheckResult({
                    verdict: sc >= 75 ? "correct" : "almost",
                    score: sc,
                    corrected: currentEx.answer,
                    translit: currentEx.translit ?? "",
                    feedback: "Harika! Sonraki adıma geçebilirsin.",
                  });
                }}
              />
            </div>
          )}

          {/* Değerlendirme Sonucu */}
          {checkResult && currentEx.type !== "speak" && (
            <div
              className={`rounded-xl border p-5 space-y-2 ${
                checkResult.verdict === "correct"
                  ? "border-emerald-400/40 bg-emerald-500/15"
                  : checkResult.verdict === "almost"
                    ? "border-amber-400/40 bg-amber-500/15"
                    : "border-rose-400/40 bg-rose-500/15"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  {checkResult.verdict === "correct"
                    ? "✅ Отли́чно! (Mükemmel!)"
                    : checkResult.verdict === "almost"
                      ? "🤏 Çok yaklaştın!"
                      : "❌ Doğrusuna bakalım"}
                </span>
                {checkResult.corrected && (
                  <button
                    type="button"
                    onClick={() => speak(checkResult.corrected)}
                    className="text-xs font-semibold text-sky-300 hover:underline"
                  >
                    🔊 Tekrar Dinle
                  </button>
                )}
              </div>
              {checkResult.corrected && (
                <div className="text-lg">
                  <span className="font-bold text-white">
                    <HighlightedRu text={checkResult.corrected} />
                  </span>
                  {checkResult.translit && <span className="ml-2 text-sm text-sky-300">({checkResult.translit})</span>}
                </div>
              )}
              <p className="text-sm md:text-base text-white/90">{checkResult.feedback}</p>
              {checkResult.alternatives && checkResult.alternatives.length > 0 && (
                <div className="text-xs text-white/70">
                  Alternatif doğal söyleniş: {checkResult.alternatives.join(" / ")}
                </div>
              )}
            </div>
          )}

          {/* Alt Butonlar */}
          <div className="flex justify-between items-center pt-2">
            {currentEx.type === "speak" && !checkResult ? (
              <button
                type="button"
                onClick={() => {
                  setScores((s) => [...s, 80]);
                  nextExercise();
                }}
                className="text-xs text-white/50 hover:text-white"
              >
                Şu an konuşamıyorum, atla →
              </button>
            ) : (
              <span />
            )}

            {!checkResult && currentEx.type !== "speak" ? (
              <button
                type="button"
                onClick={submitExercise}
                disabled={checking || (currentEx.type === "choice" ? selectedChoice === null : !userInput.trim())}
                className="btn-primary"
              >
                {checking ? <Spinner /> : "Kontrol Et"}
              </button>
            ) : checkResult ? (
              <button type="button" onClick={nextExercise} className="btn-primary">
                {exIndex + 1 < exercises.length ? "Sonraki Soru →" : "Dersi Tamamla 🎉"}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* ────────────────── AŞAMA 4: DERS TAMAMLANDI ────────────────── */}
      {stage === "done" && (
        <div className="card p-8 md:p-10 text-center space-y-5">
          <div className="text-5xl">🎉</div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Молоде́ц! (Harikasın!)</h2>
          <p className="text-white/80 max-w-md mx-auto">
            <b>{data.title}</b> dersini tamamladın.
            {completionInfo && (
              <>
                {" "}
                <b>+{completionInfo.xp} XP</b> kazandın ve <b>{completionInfo.cardsAdded} yeni kalıp</b> aralıklı tekrar
                destene eklendi!
              </>
            )}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {data.scenario && (
              <button type="button" onClick={launchScenario} className="btn-primary">
                {data.scenario.emoji} Şimdi Canlı Roleplay Yap: {data.scenario.title}
              </button>
            )}
            {data.nextLessonId && (
              <Link href={`/lesson/${data.nextLessonId}`} className="btn-ghost">
                Sonraki Derse Geç →
              </Link>
            )}
            <Link href="/roadmap" className="btn-ghost">
              Yol Haritası
            </Link>
          </div>
        </div>
      )}

      {/* Her aşamanın altında hızlı "Koç Anya'ya Sor" kutusu */}
      <div className="card p-5 space-y-3">
        <div className="text-sm font-semibold">🙋‍♀️ Takıldığın bir yer mi var? Koç Anya&apos;ya hemen sor:</div>
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askCoach()}
            placeholder="Örn: Bu kalıbı resmi ortamda kullanabilir miyim?"
            className="flex-1 rounded-xl border border-white/15 bg-black/35 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
          />
          <button type="button" onClick={askCoach} disabled={asking} className="btn-ghost text-sm">
            {asking ? <Spinner /> : "Sor"}
          </button>
        </div>
        {answer && (
          <div className="rounded-xl bg-black/35 p-4 border border-white/12">
            <Markdown>{answer}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
