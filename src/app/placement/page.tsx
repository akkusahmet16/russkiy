"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";
import type { LevelId } from "@/content/types";
import { SpeakButton, Spinner, speak } from "@/components/Speak";

interface PlacementQuestion {
  id: string;
  level: LevelId;
  prompt: string;
  audioRu?: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const QUESTIONS: PlacementQuestion[] = [
  {
    id: "q1-a1",
    level: "A1",
    prompt: "Rusçada «Молоко́» (Süt) kelimesi nasıl okunur ve vurgusuz 'о' harflerine ne olur?",
    audioRu: "Молоко́",
    options: [
      "Moloko (tüm 'о' harfleri net 'o' olarak okunur)",
      "Malakó (vurgusuz 'о' harfleri 'a' sesine kayar, vurgu son hecededir)",
      "Mólaka (vurgu ilk hecededir)",
      "Milikó (tüm ünlüler 'i' olur)",
    ],
    correctIdx: 1,
    explanation: "Rusçada (А́канье kuralı) vurgusuz 'о' harfleri 'a' gibi okunur: молоко́ → [malakó].",
  },
  {
    id: "q2-a1",
    level: "A1",
    prompt: "Kafede «Ben kahve istiyorum ama çalışmam lazım» cümlesinin doğal Rusça karşılığı hangisidir?",
    audioRu: "Я хочу́ ко́фе, но мне на́до рабо́тать.",
    options: [
      "Я хочу́ ко́фе, но мне на́до рабо́тать.",
      "Мне хочу́ ко́фе, но я на́до рабо́тать.",
      "Я лю́бит ко́фе, потому́ рабо́таю.",
      "У меня́ ко́фе и рабо́та.",
    ],
    correctIdx: 0,
    explanation: "İstek için «Я хочу́ + mastar/nesne», zorunluluk için ise «Мне на́до + mastar» kullanılır.",
  },
  {
    id: "q3-a2",
    level: "A2",
    prompt: "Rus arkadaşın «Ты уже́ прочита́л э́ту кни́гу?» diye sordu. Neden «чита́л» yerine «прочита́л» (НСВ/СВ) kullandı?",
    audioRu: "Ты уже́ прочита́л э́ту кни́гу?",
    options: [
      "Şu an okumaya devam ettiğini sormak için",
      "Kitabı okuyup bitirmiş olma sonucunu (СВ — tamamlanmış görünüş) merak ettiği için",
      "Gelecek zaman kipi olduğu için",
      "Çoğul bir kitaptan bahsettiği için",
    ],
    correctIdx: 1,
    explanation: "«Прочита́ть» (СВ) eylemin tamamlandığını ve sonucunu (kitabın bitmiş olmasını) vurgular.",
  },
  {
    id: "q4-b1",
    level: "B1",
    prompt: "«Е́сли бы у меня́ бы́ло вре́мя, я бы прие́хал к тебе́.» cümlesi ne anlatır?",
    audioRu: "Е́сли бы у меня́ бы́ло вре́мя, я бы прие́хал к тебе́.",
    options: [
      "Zamanım var, birazdan yanına geliyorum.",
      "Dün zamanım vardı ve yanına geldim.",
      "Zamanım olsaydı yanına gelirdim (gerçekleşmemiş hayali koşul).",
      "Ne zaman geleceğimi bilmiyorum.",
    ],
    correctIdx: 2,
    explanation: "«Е́сли бы + geçmiş zaman, ... бы + geçmiş zaman» yapısı Rusçada hayali/gerçek dışı koşul kipidir.",
  },
  {
    id: "q5-b2",
    level: "B2",
    prompt: "Bir Rus arkadaşın «Да не па́рься ты из-за э́той ерунды́!» dediğinde ne demek istiyor?",
    audioRu: "Да не па́рься ты из-за э́той ерунды́!",
    options: [
      "Bu önemli konuyu hemen patrona anlat!",
      "Böyle ufak/saçma bir şey için kafanı yorma, takma!",
      "Buhar odası çok sıcak, dışarı çık!",
      "Bunu tek başına asla çözemezsin.",
    ],
    correctIdx: 1,
    explanation: "«Не па́рься» (veya «не замора́чивайся») günlük Rusçada 'kafana takma, stres yapma' demektir.",
  },
  {
    id: "q6-c1",
    level: "C1",
    prompt: "«Мы просиде́ли на ку́хне до утра́, говоря́ по душа́м.» cümlesindeki «по душа́м» ifadesinin kültürel anlamı nedir?",
    audioRu: "Мы просиде́ли на ку́хне до утра́, говоря́ по душа́м.",
    options: [
      "Resmi bir iş sözleşmesi imzalamak",
      "Yüzeysel havadan sudan konuşmak",
      "Maskeleri çıkarıp en mahrem, samimi ve derin duyguları paylaşarak dertleşmek",
      "Yüksek sesle tartışıp kavga etmek",
    ],
    correctIdx: 2,
    explanation: "«Разгово́р по душа́м» Rus kültürünün kalbidir: içten, samimi, ruhun derinliklerinden gelen dost sohbeti.",
  },
];

const GOALS = [
  { id: "social", icon: "🍻", title: "Samimi Arkadaşlık & Sohbet", desc: "Ruslarla doğal muhabbet, mizah, argo ve dostluk kurmak" },
  { id: "romance", icon: "❤️", title: "İlişki, Flört & Duygular", desc: "Buluşmalar, iltifatlar, duygusal nüanslar ve aileyle tanışma" },
  { id: "survival", icon: "🚇", title: "Rusya'da Hayatta Kalma & Yaşam", desc: "Kafe, metro, ev kiralama, doktor, banka ve şehir hayatı" },
  { id: "deep", icon: "🌌", title: "Tam Kapsamlı Rusça (A1 → C2 Носи́тель)", desc: "Edebiyat, sinema, «по душам» felsefi sohbetler ve tam hakimiyet" },
];

export default function PlacementPage() {
  const router = useRouter();
  const [step, setStep] = useState<"prefs" | "quiz" | "result">("prefs");
  const [goalFocus, setGoalFocus] = useState("social");
  const [dailyMinutes, setDailyMinutes] = useState(15);

  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctLevels, setCorrectLevels] = useState<LevelId[]>([]);

  const [recommendedLevel, setRecommendedLevel] = useState<LevelId>("A1");
  const [chosenLevel, setChosenLevel] = useState<LevelId>("A1");
  const [saving, setSaving] = useState(false);

  const currentQ = QUESTIONS[qIdx];

  function checkAnswer() {
    if (selected === null) return;
    setRevealed(true);
    if (selected === currentQ.correctIdx) {
      setCorrectLevels((prev) => [...prev, currentQ.level]);
    }
    if (currentQ.audioRu) speak(currentQ.audioRu);
  }

  function nextQuestion() {
    if (qIdx + 1 < QUESTIONS.length) {
      setQIdx(qIdx + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      // Seviye hesapla
      const score = correctLevels.length;
      let rec: LevelId = "A1";
      if (score >= 6) rec = "C1";
      else if (score === 5) rec = "B2";
      else if (score === 4) rec = "B1";
      else if (score >= 2) rec = "A2";
      else rec = "A1";
      setRecommendedLevel(rec);
      setChosenLevel(rec);
      setStep("result");
    }
  }

  async function finishPlacement() {
    setSaving(true);
    try {
      await api("/api/placement", {
        body: { placedLevel: chosenLevel, goalFocus, dailyMinutes },
      });
      router.push("/");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-sky-300 hover:underline">
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-1">
            🎯 Kişisel Seviye Tespit & Yol Haritası Sihirbazı
          </h1>
        </div>
      </div>

      {/* ADIM 1: HEDEF VE TEMPO SEÇİMİ */}
      {step === "prefs" && (
        <div className="card p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-rose-300 font-bold">Adım 1 / 2</div>
            <h2 className="font-display text-xl font-bold">Rusçayı en çok hangi amaçla kullanmak istiyorsun?</h2>
            <p className="text-sm text-white/65">
              Koç Anya örneklerini ve senaryo önerilerini bu odağa göre şekillendirecek (tüm A1–C2 müfredatı açık kalır).
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoalFocus(g.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  goalFocus === g.id
                    ? "border-rose-400 bg-rose-500/15 shadow-lg shadow-rose-500/15"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="text-2xl">{g.icon}</div>
                <div className="font-display font-bold mt-2 text-white">{g.title}</div>
                <div className="text-xs text-white/65 mt-1">{g.desc}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <h3 className="font-semibold text-sm">Günde kaç dakika ayırabilirsin?</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { m: 5, label: "5 dk / gün", sub: "Hafif Tempo (15 XP)" },
                { m: 15, label: "15 dk / gün", sub: "İdeal Tempo (30 XP)" },
                { m: 30, label: "30 dk / gün", sub: "Yoğun Kamp (60 XP)" },
              ].map((t) => (
                <button
                  key={t.m}
                  type="button"
                  onClick={() => setDailyMinutes(t.m)}
                  className={`rounded-xl border p-3 text-center transition ${
                    dailyMinutes === t.m
                      ? "border-sky-400 bg-sky-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="text-[11px] text-white/55 mt-0.5">{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setRecommendedLevel("A1");
                setChosenLevel("A1");
                setStep("result");
              }}
              className="text-xs text-white/60 hover:text-white underline"
            >
              Testi atla, doğrudan A1&apos;den başla
            </button>
            <button type="button" onClick={() => setStep("quiz")} className="btn-primary">
              6 Soruluk Seviye Testine Geç →
            </button>
          </div>
        </div>
      )}

      {/* ADIM 2: 6 SORULUK ADAPTİF SEVİYE TESTİ */}
      {step === "quiz" && currentQ && (
        <div className="card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>
              Soru {qIdx + 1} / {QUESTIONS.length} • Ölçülen Seviye: <b className="text-sky-300">{currentQ.level}</b>
            </span>
            <div className="flex gap-1">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-6 rounded-full ${i <= qIdx ? "bg-rose-500" : "bg-white/15"}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg md:text-xl font-bold text-white leading-snug">{currentQ.prompt}</h2>
            {currentQ.audioRu && <SpeakButton text={currentQ.audioRu} size="sm" withSlow />}
          </div>

          <div className="grid gap-2.5">
            {currentQ.options.map((opt, idx) => {
              let cls = "border-white/12 bg-black/25 hover:border-white/30";
              if (revealed) {
                if (idx === currentQ.correctIdx) cls = "border-emerald-400 bg-emerald-500/20 text-emerald-100";
                else if (idx === selected) cls = "border-rose-400 bg-rose-500/20 text-rose-100";
              } else if (idx === selected) {
                cls = "border-sky-400 bg-sky-500/20 text-white";
              }
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(idx)}
                  className={`rounded-xl border p-4 text-left text-sm md:text-base font-medium transition ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-4 text-xs md:text-sm text-sky-100">
              💡 <b>Açıklama:</b> {currentQ.explanation}
            </div>
          )}

          <div className="flex justify-end pt-2">
            {!revealed ? (
              <button
                type="button"
                disabled={selected === null}
                onClick={checkAnswer}
                className="btn-primary"
              >
                Cevabı Kontrol Et
              </button>
            ) : (
              <button type="button" onClick={nextQuestion} className="btn-primary">
                {qIdx + 1 < QUESTIONS.length ? "Sonraki Soru →" : "Sonucu Gör →"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ADIM 3: SONUÇ VE SEVİYE ONAYI */}
      {step === "result" && (
        <div className="card p-6 md:p-8 space-y-6 text-center">
          <div className="text-5xl">🎉</div>
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold">Analiz Tamamlandı</div>
            <h2 className="font-display text-2xl font-bold mt-1">
              Önerilen Başlangıç Seviyen: <span className="text-sky-300">{recommendedLevel}</span>
            </h2>
            <p className="text-sm text-white/70 max-w-md mx-auto mt-1">
              İstersen önerilen seviyeden başlayabilir veya aşağıdan başlamak istediğin seviyeyi kendin seçebilirsin.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-w-lg mx-auto">
            {(["A1", "A2", "B1", "B2", "C1", "C2"] as LevelId[]).map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => setChosenLevel(lv)}
                className={`rounded-xl border p-3 font-display font-bold transition ${
                  chosenLevel === lv
                    ? "border-rose-400 bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                    : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {lv}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button type="button" onClick={finishPlacement} disabled={saving} className="btn-primary px-8">
              {saving ? <Spinner /> : `${chosenLevel} Seviyesinden Planımı Başlat →`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
