"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { CURRICULUM, findLesson } from "@/content/curriculum";
import { SCENARIOS } from "@/content/scenarios";
import { AiKeyBanner } from "@/components/Banners";
import { Spinner } from "@/components/Speak";

interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
  href: string;
}

interface DashboardStats {
  name: string;
  level: string;
  xp: number;
  streak: number;
  dailyGoalXp: number;
  todayXp: number;
  dueCount: number;
  cardCount: number;
  completedCount: number;
  totalLessons: number;
  nextLessonId: string;
  week: { date: string; xp: number }[];
  dailyQuests?: DailyQuest[];
  mistakeCount?: number;
  onboarding?: {
    completed: boolean;
    goalFocus: string;
    placedLevel: string;
    dailyMinutes: number;
  };
  aiReady: boolean;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [startingScenario, setStartingScenario] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    api<DashboardStats>("/api/stats").then(setStats).catch(console.error);
  }, []);

  async function startScenario(scenarioId: string) {
    setStartingScenario(scenarioId);
    try {
      const { id } = await api<{ id: number }>("/api/coach/sessions", { body: { scenarioId } });
      router.push(`/coach/${id}`);
    } catch {
      setStartingScenario(null);
    }
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-[#D9381E]" />
      </div>
    );
  }

  const nextFound = findLesson(stats.nextLessonId);
  const pctGoal = Math.min(100, Math.round((stats.todayXp / stats.dailyGoalXp) * 100));
  const pctCourse = Math.round((stats.completedCount / stats.totalLessons) * 100);
  const quests = stats.dailyQuests ?? [];
  const completedQuestsCount = quests.filter((q) => q.completed).length;

  return (
    <div className="space-y-8">
      {/* ─────────────── ÜST EDİTORYAL HEADER & KPI ROZETLERİ ─────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b-2 border-[#18181B] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#18181B] bg-[#EFECE4] px-2.5 py-1 font-mono-code text-[11px] font-bold uppercase tracking-wider text-[#141413]">
            <span className="h-2 w-2 rounded-full bg-[#D9381E]" /> GÜNLÜK DİL KAMPÜSÜ • МГУ SİSTEMİ
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#141413] mt-2.5 tracking-tight">
            Приве́т! Bugün ne inşa ediyoruz?
          </h1>
        </div>

        {/* 3'lü Taktil KPI Barı */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border-2 border-[#18181B] bg-[#FEF3C7] px-4 py-2.5 shadow-[0_3px_0_0_#18181B] flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#18181B] bg-white font-mono-code text-sm font-extrabold text-[#B45309]">
              {stats.streak}d
            </span>
            <div>
              <div className="font-mono-code text-[10px] font-bold uppercase text-[#92400E]">GÜN SERİSİ</div>
              <div className="text-sm font-extrabold text-[#141413]">{stats.streak} Gün Aktif</div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#18181B] bg-[#DCFCE7] px-4 py-2.5 shadow-[0_3px_0_0_#18181B] flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#18181B] bg-white font-mono-code text-xs font-extrabold text-[#15803D]">
              XP
            </span>
            <div>
              <div className="font-mono-code text-[10px] font-bold uppercase text-[#166534]">DENEYİM PUANI</div>
              <div className="text-sm font-extrabold text-[#141413]">{stats.xp} XP</div>
            </div>
          </div>

          <Link
            href="/placement"
            className="rounded-2xl border-2 border-[#18181B] bg-[#E0EAFF] px-4 py-2.5 shadow-[0_3px_0_0_#18181B] hover:-translate-y-0.5 transition flex items-center gap-3"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#18181B] bg-[#1D4ED8] font-display text-sm font-extrabold text-white">
              {stats.level}
            </span>
            <div>
              <div className="font-mono-code text-[10px] font-bold uppercase text-[#1E40AF]">SEVİYE (DEĞİŞTİR)</div>
              <div className="text-sm font-extrabold text-[#141413]">CEFR {stats.level}</div>
            </div>
          </Link>
        </div>
      </div>

      {!stats.aiReady && <AiKeyBanner />}

      {/* ─────────────── SEVİYE TESPİT DAVET KARTI (ONBOARDING) ─────────────── */}
      {!stats.onboarding?.completed && (
        <div className="rounded-2xl border-2 border-[#18181B] bg-[#FEF3C7] p-6 shadow-[0_4px_0_0_#18181B] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-block rounded-md border border-[#18181B] bg-white px-2 py-0.5 font-mono-code text-[10px] font-extrabold uppercase text-[#B45309]">
              KİŞİSELLEŞTİRME SİHİRBAZI • 2 DAKİKA
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#141413]">
              Sıfırdan mı başlıyorsun, yoksa biraz Rusça temelin var mı?
            </h2>
            <p className="text-sm font-medium text-[#44403C]">
              6 soruluk adaptif seviye sınavıyla doğru üniteden başla, bildiğin dersleri otomatik atla ve günlük çalışma
              temponu seç.
            </p>
          </div>
          <Link href="/placement" className="btn-primary text-sm shrink-0">
            Seviyemi Belirle →
          </Link>
        </div>
      )}

      {/* ─────────────── ANA BENTO GRID: SIRADAKİ DERS & HAFTALIK PERFORMANS ─────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sol: Sıradaki Ders (Hero Card) */}
        <div className="lg:col-span-7 rounded-2xl border-2 border-[#18181B] bg-white p-6 md:p-8 shadow-[0_5px_0_0_#18181B] flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 rounded-lg border-2 border-[#18181B] bg-[#FFE4E0] px-3 py-1 font-mono-code text-xs font-extrabold text-[#D9381E]">
                SIRADAKİ STÜDYO DERSİ • {nextFound?.level.id}
              </span>
              <span className="font-mono-code text-xs font-bold text-[#57534E]">
                {nextFound?.unit.title}
              </span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#141413] leading-tight">
              {nextFound?.lesson.title}
            </h2>
            <p className="text-base font-medium text-[#44403C]">{nextFound?.lesson.goal}</p>

            {/* 3 Aşamalı Ders Yapısı Önizlemesi */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F3] p-2.5">
                <div className="font-mono-code text-[10px] font-bold text-[#78716C]">ADIM 01</div>
                <div className="text-xs font-extrabold text-[#141413] mt-0.5">Mantık Kartları</div>
              </div>
              <div className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F3] p-2.5">
                <div className="font-mono-code text-[10px] font-bold text-[#78716C]">ADIM 02</div>
                <div className="text-xs font-extrabold text-[#141413] mt-0.5">Vurgu & Ses Stüdyosu</div>
              </div>
              <div className="rounded-xl border border-[#D6CFC2] bg-[#FAF8F3] p-2.5">
                <div className="font-mono-code text-[10px] font-bold text-[#78716C]">ADIM 03</div>
                <div className="text-xs font-extrabold text-[#141413] mt-0.5">İnteraktif Test</div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 pt-5 border-t-2 border-[#EFECE4]">
            <Link href={`/lesson/${stats.nextLessonId}`} className="btn-primary text-sm">
              Derse Başla →
            </Link>
            <Link href="/roadmap" className="btn-ghost text-sm">
              Müfredat Haritası ({stats.completedCount}/{stats.totalLessons})
            </Link>
          </div>
        </div>

        {/* Sağ: Günlük Tempo & 7 Günlük Aktivite Grafiği */}
        <div className="lg:col-span-5 rounded-2xl border-2 border-[#18181B] bg-[#EFECE4] p-6 shadow-[0_5px_0_0_#18181B] flex flex-col justify-between">
          <div className="rounded-xl border-2 border-[#18181B] bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-extrabold text-[#141413]">GÜNLÜK HEDEF</span>
              <span className="font-mono-code text-xs font-extrabold text-[#D9381E]">
                {stats.todayXp} / {stats.dailyGoalXp} XP
              </span>
            </div>
            <div className="mt-2.5 h-4 w-full overflow-hidden rounded-full border-2 border-[#18181B] bg-[#F5F2EA]">
              <div
                className="h-full bg-[#D9381E] transition-all"
                style={{ width: `${pctGoal}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#57534E]">
              {pctGoal >= 100
                ? "Bugünkü hedefini eksiksiz tamamladın!"
                : "1 ders + 5 kart tekrarı günlük hedefi tamamlar."}
            </p>
          </div>

          <div className="mt-5 rounded-xl border-2 border-[#18181B] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-code text-[11px] font-bold uppercase text-[#57534E]">
                SON 7 GÜN PERFORMANSI
              </span>
              <span className="font-mono-code text-[11px] font-bold text-[#15803D]">%{pctGoal} Bugün</span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end h-20">
              {stats.week.map((d) => {
                const h = Math.max(16, Math.min(100, Math.round((d.xp / stats.dailyGoalXp) * 100)));
                const dayLabel = new Date(d.date + "T12:00:00").toLocaleDateString("tr-TR", { weekday: "short" });
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1.5">
                    <div className="w-full h-14 flex items-end rounded-lg bg-[#F5F2EA] p-0.5 border border-[#D6CFC2]">
                      <div
                        title={`${d.date}: ${d.xp} XP`}
                        className={`w-full rounded-md transition-all ${
                          d.xp > 0 ? "bg-[#1D4ED8] border border-[#18181B]" : "bg-[#E4DFD3]"
                        }`}
                        style={{ height: `${d.xp > 0 ? h : 16}%` }}
                      />
                    </div>
                    <span className="font-mono-code text-[10px] font-bold text-[#57534E]">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────── GÜNLÜK GÖREV PAKETİ (DAILY QUESTS) ─────────────── */}
      {quests.length > 0 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-mono-code text-[11px] font-bold uppercase tracking-wider text-[#D9381E]">
                ALIŞKANLIK SİSTEMİ • GÜNLÜK RİTİMLER
              </div>
              <h2 className="font-display text-xl font-extrabold text-[#141413] mt-0.5">
                Bugünün 3 Görevi ({completedQuestsCount} / {quests.length} Tamamlandı)
              </h2>
            </div>
            <span className="rounded-xl border-2 border-[#18181B] bg-[#FEF3C7] px-3 py-1 font-mono-code text-xs font-extrabold text-[#92400E]">
              +60 BONUS XP
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quests.map((q, idx) => {
              const pct = Math.min(100, Math.round((q.current / q.target) * 100));
              return (
                <Link
                  key={q.id}
                  href={q.href}
                  className={`rounded-2xl border-2 border-[#18181B] p-4 flex flex-col justify-between transition hover:-translate-y-0.5 shadow-[0_3px_0_0_#18181B] ${
                    q.completed ? "bg-[#DCFCE7]" : "bg-[#FAF8F3] hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg border border-[#18181B] bg-white px-2 py-0.5 font-mono-code text-xs font-extrabold text-[#141413]">
                        GÖREV 0{idx + 1}
                      </span>
                      <span
                        className={`rounded-lg border border-[#18181B] px-2 py-0.5 font-mono-code text-[11px] font-extrabold ${
                          q.completed ? "bg-[#15803D] text-white" : "bg-[#FEF3C7] text-[#92400E]"
                        }`}
                      >
                        {q.completed ? "TAMAMLANDI" : `+${q.xpReward} XP`}
                      </span>
                    </div>
                    <div className="font-display text-base font-extrabold text-[#141413] mt-3">{q.title}</div>
                    <p className="text-xs font-medium text-[#57534E] mt-1">{q.description}</p>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between font-mono-code text-[11px] font-bold text-[#141413]">
                      <span>İLERLEME</span>
                      <span>
                        {q.current} / {q.target}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full border border-[#18181B] bg-white overflow-hidden">
                      <div
                        className={`h-full transition-all ${q.completed ? "bg-[#15803D]" : "bg-[#D9381E]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────── 3 UZMANLIK STÜDYOSU (TEKRAR • HATA DEFTERİ • GERÇEK RUSYA) ─────────────── */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* 1. SM-2 Hafıza Stüdyosu */}
        <div className="card p-6 flex flex-col justify-between bg-[#E0F2FE]">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-[#18181B] bg-white px-2 py-0.5 font-mono-code text-[10px] font-extrabold text-[#0369A1]">
                SM-2 ALGORİTMASI
              </span>
              <span className="font-mono-code text-xs font-extrabold text-[#141413]">{stats.cardCount} Kart</span>
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#141413] mt-3">
              {stats.dueCount > 0 ? `${stats.dueCount} Kalıp Tekrar Bekliyor` : "Hafıza Desten Güncel"}
            </h3>
            <p className="text-xs font-medium text-[#334155] mt-1.5">
              Tamamladığın derslerdeki ifadeler tam unutmaya yakın olduğun gün karşına çıkar.
            </p>
          </div>
          <div className="mt-5 flex gap-2">
            <Link href="/review" className="btn-primary text-xs flex-1">
              Tekrara Başla ({stats.dueCount})
            </Link>
            <Link href="/cards" className="btn-ghost text-xs">
              Arşiv
            </Link>
          </div>
        </div>

        {/* 2. Kişisel Hata Defteri */}
        <div className="card p-6 flex flex-col justify-between bg-[#F3E8FF]">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-[#18181B] bg-white px-2 py-0.5 font-mono-code text-[10px] font-extrabold text-[#6D28D9]">
                ZAYIF NOKTA BELLEĞİ
              </span>
              <span className="font-mono-code text-xs font-extrabold text-[#141413]">
                {stats.mistakeCount ?? 0} Kayıt
              </span>
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#141413] mt-3">Kişisel Hata Defterim</h3>
            <p className="text-xs font-medium text-[#3B0764] mt-1.5">
              Sohbetlerde karıştırdığın ekler ve kalıplar otomatik kaydedilir; kendi hatalarınla test çöz.
            </p>
          </div>
          <div className="mt-5">
            <Link href="/mistakes" className="btn-ghost text-xs w-full bg-white">
              Hata Antrenmanını Aç →
            </Link>
          </div>
        </div>

        {/* 3. Gerçek Rusya Medya Stüdyosu */}
        <div className="card p-6 flex flex-col justify-between bg-[#DCFCE7]">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-[#18181B] bg-white px-2 py-0.5 font-mono-code text-[10px] font-extrabold text-[#15803D]">
                KÜLTÜR & MEDYA LAB
              </span>
              <span className="font-mono-code text-xs font-extrabold text-[#141413]">3 Modül</span>
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#141413] mt-3">Gerçek Rusya Stüdyosu</h3>
            <p className="text-xs font-medium text-[#14532D] mt-1.5">
              Rus el yazısı (Курси́в) simülatörü, kült film replikleriyle Shadowing ve çift karakterli radyo.
            </p>
          </div>
          <div className="mt-5">
            <Link href="/immersion" className="btn-ghost text-xs w-full bg-white">
              Stüdyoya Gir →
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────── A1 → C2 MÜFREDAT OMURGASI ─────────────── */}
      <div className="card p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b-2 border-[#EFECE4]">
          <div>
            <div className="font-mono-code text-[11px] font-bold uppercase text-[#57534E]">
              AKADEMİK & DOĞAL MÜFREDAT İLERLEMESİ
            </div>
            <h3 className="font-display text-lg font-extrabold text-[#141413] mt-0.5">
              A1 → C2 Tam Kapsamlı Rusça (%{pctCourse} Tamamlandı • {stats.completedCount}/{stats.totalLessons} Ders)
            </h3>
          </div>
          <Link href="/roadmap" className="btn-ghost text-xs">
            Tüm Müfredatı Gör →
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CURRICULUM.map((lvl) => {
            const isCurr = lvl.id === stats.level;
            return (
              <Link
                key={lvl.id}
                href="/roadmap"
                className={`rounded-xl border-2 border-[#18181B] p-3 text-left transition hover:-translate-y-0.5 ${
                  isCurr
                    ? "bg-[#141413] text-white shadow-[0_3px_0_0_#D9381E]"
                    : "bg-[#FAF8F3] text-[#141413] shadow-[0_2px_0_0_#18181B]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-display text-lg font-extrabold ${isCurr ? "!text-white" : "text-[#141413]"}`}>
                    {lvl.id}
                  </span>
                  <span
                    className={`font-mono-code text-[10px] font-bold ${
                      isCurr ? "!text-[#FBBF24]" : "text-[#78716C]"
                    }`}
                  >
                    {lvl.trki?.split(" ")[0] ?? lvl.id}
                  </span>
                </div>
                <div className={`text-xs font-bold truncate mt-1 ${isCurr ? "!text-stone-200" : "text-[#57534E]"}`}>
                  {lvl.title}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─────────────── CANLI ROLEPLAY SAHNELERİ ─────────────── */}
      <div className="space-y-4">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <div className="font-mono-code text-[11px] font-bold uppercase tracking-wider text-[#D9381E]">
              GERÇEK HAYAT SİMÜLASYONLARI • 27 KARAKTER
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#141413] mt-0.5">
              Canlı Diyalog & Sesli Telefon Modu
            </h2>
          </div>
          <Link href="/coach" className="btn-ghost text-xs">
            Tüm 27 Sahneyi Aç →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "sasha-cafe",
            "first-date-park",
            "russian-family-dinner",
            "dacha-weekend",
            "relationship-talk",
            "moscow-kitchen",
          ]
            .map((id) => SCENARIOS.find((x) => x.id === id))
            .filter((s): s is NonNullable<typeof s> => Boolean(s))
            .map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => startScenario(s.id)}
                disabled={startingScenario === s.id}
                className="card-interactive p-5 text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#18181B] bg-[#FAF8F3] text-2xl">
                      {s.emoji}
                    </span>
                    <span className="rounded-lg border border-[#18181B] bg-[#E0EAFF] px-2.5 py-0.5 font-mono-code text-xs font-extrabold text-[#1D4ED8]">
                      CEFR {s.minLevel}
                    </span>
                  </div>
                  <div className="font-display text-lg font-extrabold text-[#141413] mt-3.5">{s.title}</div>
                  <p className="text-xs font-medium text-[#57534E] mt-1">{s.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5E0D5] flex items-center justify-between">
                  <span className="font-mono-code text-[11px] font-bold text-[#78716C] truncate max-w-[180px]">
                    {s.character.split("—")[0]}
                  </span>
                  <span className="text-xs font-extrabold text-[#D9381E]">
                    {startingScenario === s.id ? "Açılıyor…" : "Sahneye Gir →"}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
