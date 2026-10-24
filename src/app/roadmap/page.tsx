"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Spinner } from "@/components/Speak";

interface RoadmapLesson {
  id: string;
  title: string;
  goal: string;
  ready: boolean;
  progress: { status: string; bestScore: number } | null;
}

interface RoadmapUnit {
  id: string;
  title: string;
  description: string;
  lessons: RoadmapLesson[];
}

interface RoadmapLevel {
  id: string;
  trki: string;
  title: string;
  description: string;
  canDo: string[];
  units: RoadmapUnit[];
}

interface RoadmapData {
  levels: RoadmapLevel[];
  nextLessonId: string;
  currentLevel: string;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-[#FFE4E0] text-[#D9381E]",
  A2: "bg-[#FEF3C7] text-[#B45309]",
  B1: "bg-[#DCFCE7] text-[#15803D]",
  B2: "bg-[#E0EAFF] text-[#1D4ED8]",
  C1: "bg-[#F3E8FF] text-[#6D28D9]",
  C2: "bg-[#141413] text-white",
};

export default function RoadmapPage() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");

  useEffect(() => {
    api<RoadmapData>("/api/roadmap").then((d) => {
      setData(d);
      setSelectedLevel(d.currentLevel || "A1");
    });
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-[#D9381E]" />
      </div>
    );
  }

  const level = data.levels.find((l) => l.id === selectedLevel) ?? data.levels[0];

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="border-b-2 border-[#18181B] pb-5">
        <div className="inline-flex items-center gap-2 rounded-lg border border-[#18181B] bg-[#E0EAFF] px-2.5 py-1 font-mono-code text-[11px] font-extrabold uppercase text-[#1D4ED8]">
          AKADEMİK MÜFREDAT OMURGASI • CEFR & ТРКИ-4
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#141413] mt-2">
          A1&apos;den C2&apos;ye Doğal Rusça Haritası
        </h1>
        <p className="text-[#44403C] text-sm md:text-base font-medium mt-1">
          Günlük hayattan samimi arkadaşlığa, aşktan aile sofrasına, sokak mizahından edebiyata kadar Rusçayı her
          yönüyle öğreten 6 aşamalı etkileşimli eğitim sistemi.
        </p>
      </div>

      {/* 6 Seviye Seçici (A1 -> C2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.levels.map((lvl) => {
          const all = lvl.units.flatMap((u) => u.lessons);
          const done = all.filter((l) => l.progress?.status === "completed").length;
          const active = lvl.id === level.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setSelectedLevel(lvl.id)}
              className={`rounded-2xl border-2 border-[#18181B] p-4 text-left transition cursor-pointer ${
                active
                  ? "bg-[#141413] text-white shadow-[0_4px_0_0_#D9381E] -translate-y-0.5"
                  : "bg-white hover:bg-[#FAF8F3] shadow-[0_3px_0_0_#18181B]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-display text-2xl font-extrabold ${active ? "!text-white" : "text-[#141413]"}`}>
                  {lvl.id}
                </span>
                <span
                  className={`rounded-md border border-[#18181B] px-1.5 py-0.5 font-mono-code text-[11px] font-bold ${
                    active ? "bg-[#D9381E] !text-white" : "bg-[#EFECE4] text-[#141413]"
                  }`}
                >
                  {done}/{all.length}
                </span>
              </div>
              <div
                className={`font-mono-code text-[10px] font-bold mt-1.5 truncate ${
                  active ? "!text-[#FBBF24]" : "text-[#B45309]"
                }`}
              >
                {lvl.trki}
              </div>
              <div className={`text-xs font-extrabold mt-0.5 line-clamp-1 ${active ? "!text-white" : "text-[#141413]"}`}>
                {lvl.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Seçili Seviye Manifestosu */}
      <div className="card p-6 md:p-8 bg-[#FAF8F3] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <span
              className={`inline-block rounded-lg border-2 border-[#18181B] px-3 py-1 font-mono-code text-xs font-extrabold ${
                LEVEL_COLORS[level.id] ?? "bg-white"
              }`}
            >
              SEVİYE {level.id} • {level.trki}
            </span>
            <h2 className="font-display text-2xl font-extrabold text-[#141413] mt-2">
              {level.id} — {level.title}
            </h2>
            <p className="text-sm md:text-base font-medium text-[#44403C] mt-1">{level.description}</p>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-[#E2DDD2]">
          <div className="font-mono-code text-[11px] font-extrabold uppercase tracking-wider text-[#15803D] mb-3">
            BU SEVİYEYİ BİTİRDİĞİNDE KAZANACAĞIN YETKİNLİKLER:
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {level.canDo.map((c, i) => (
              <li
                key={i}
                className="rounded-xl border-2 border-[#18181B] bg-white px-4 py-3 text-xs md:text-sm font-bold text-[#141413] shadow-[0_2px_0_0_#18181B]"
              >
                ✓ {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Üniteler ve Dersler */}
      <div className="space-y-6">
        {level.units.map((u, ui) => (
          <div key={u.id} className="card p-6 space-y-4 bg-white">
            <div className="flex items-start justify-between gap-3 border-b-2 border-[#EFECE4] pb-3">
              <div>
                <div className="font-mono-code text-xs font-extrabold uppercase tracking-wider text-[#D9381E]">
                  ÜNİTE 0{ui + 1}
                </div>
                <h3 className="font-display text-xl font-extrabold text-[#141413] mt-0.5">{u.title}</h3>
                <p className="text-sm font-medium text-[#57534E]">{u.description}</p>
              </div>
              <span className="rounded-xl border-2 border-[#18181B] bg-[#EFECE4] px-3 py-1 font-mono-code text-xs font-extrabold text-[#141413]">
                {u.lessons.length} Ders
              </span>
            </div>

            <div className="grid gap-3">
              {u.lessons.map((l, li) => {
                const isCompleted = l.progress?.status === "completed";
                const isNext = l.id === data.nextLessonId;
                return (
                  <Link
                    key={l.id}
                    href={`/lesson/${l.id}`}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-[#18181B] p-4 transition hover:-translate-y-0.5 shadow-[0_3px_0_0_#18181B] ${
                      isNext
                        ? "bg-[#FFE4E0]"
                        : isCompleted
                          ? "bg-[#DCFCE7]"
                          : "bg-[#FAF8F3] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[#18181B] font-mono-code text-sm font-extrabold ${
                          isCompleted
                            ? "bg-[#15803D] !text-white"
                            : isNext
                              ? "bg-[#D9381E] !text-white"
                              : "bg-white text-[#141413]"
                        }`}
                      >
                        {isCompleted ? "✓" : `0${li + 1}`}
                      </div>
                      <div>
                        <div className="font-extrabold text-base text-[#141413] flex items-center gap-2 flex-wrap">
                          <span>{l.title}</span>
                          {isNext && (
                            <span className="rounded-md border border-[#18181B] bg-[#D9381E] px-2 py-0.5 font-mono-code text-[10px] font-extrabold !text-white">
                              SIRADAKİ DERS
                            </span>
                          )}
                          {l.ready ? (
                            <span className="rounded-md border border-[#18181B] bg-white px-2 py-0.5 font-mono-code text-[10px] font-bold text-[#15803D]">
                              STÜDYO HAZIR
                            </span>
                          ) : (
                            <span className="rounded-md border border-[#18181B] bg-[#E0EAFF] px-2 py-0.5 font-mono-code text-[10px] font-bold text-[#1D4ED8]">
                              DİNAMİK MODÜL
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm font-medium text-[#44403C] mt-0.5">{l.goal}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {isCompleted && l.progress && (
                        <span className="rounded-lg border border-[#18181B] bg-white px-2.5 py-1 font-mono-code text-xs font-extrabold text-[#15803D]">
                          SKOR: %{l.progress.bestScore}
                        </span>
                      )}
                      <span className="rounded-xl border-2 border-[#18181B] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#141413] shadow-[0_2px_0_0_#18181B]">
                        Dersi Aç →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
