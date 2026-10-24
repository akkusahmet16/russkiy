"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import type { Scenario, ScenarioCategory } from "@/content/types";
import { SCENARIO_VOICES } from "@/lib/voices";
import { Spinner } from "@/components/Speak";

interface SessionSummary {
  id: number;
  scenarioId: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

interface AffinityInfo {
  scenarioId: string;
  affinity: number;
  messageCount: number;
  tierLabel: string;
  tierEmoji: string;
  facts: string[];
}

const CATEGORIES: { id: "ALL" | ScenarioCategory; label: string }[] = [
  { id: "ALL", label: "✨ Tümü" },
  { id: "social", label: "🍻 Samimi Arkadaşlık" },
  { id: "romance", label: "❤️ İlişki & Flört" },
  { id: "family", label: "👨‍👩‍👧 Aile & Misafirlik" },
  { id: "deep", label: "🌌 По душа́м (Derin Sohbet)" },
  { id: "survival", label: "🚇 Günlük Yaşam & Şehir" },
  { id: "work_campus", label: "🎭 Kültür & Sanat" },
];

const LEVELS = ["ALL", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

const CATEGORY_BADGE: Record<string, { label: string; cls: string }> = {
  social: { label: "Arkadaşlık", cls: "bg-sky-500/20 text-sky-200 border-sky-400/30" },
  romance: { label: "İlişki & Flört", cls: "bg-rose-500/20 text-rose-200 border-rose-400/30" },
  family: { label: "Aile & Ev", cls: "bg-amber-500/20 text-amber-200 border-amber-400/30" },
  deep: { label: "По душа́м", cls: "bg-purple-500/20 text-purple-200 border-purple-400/30" },
  survival: { label: "Günlük Yaşam", cls: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" },
  work_campus: { label: "Kültür & Sanat", cls: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30" },
};

export default function CoachIndexPage() {
  const [data, setData] = useState<{
    scenarios: Scenario[];
    sessions: SessionSummary[];
    affinities?: Record<string, AffinityInfo>;
  } | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<"ALL" | ScenarioCategory>("ALL");
  const [lvlFilter, setLvlFilter] = useState<string>("ALL");
  const router = useRouter();

  function load() {
    api<{ scenarios: Scenario[]; sessions: SessionSummary[]; affinities?: Record<string, AffinityInfo> }>(
      "/api/coach/sessions",
    ).then(setData);
  }

  useEffect(() => {
    load();
  }, []);

  async function start(scenarioId: string) {
    setStarting(scenarioId);
    try {
      const { id } = await api<{ id: number }>("/api/coach/sessions", { body: { scenarioId } });
      router.push(`/coach/${id}`);
    } catch {
      setStarting(null);
    }
  }

  async function removeSession(id: number) {
    await api(`/api/coach/sessions/${id}`, { method: "DELETE" });
    load();
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-rose-400" />
      </div>
    );
  }

  const filtered = data.scenarios.filter((s) => {
    if (catFilter !== "ALL" && s.category !== catFilter) return false;
    if (lvlFilter !== "ALL" && s.minLevel !== lvlFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold">
          Canlı Konuşma • Kalıcı Karakter Hafızası • Telefon Görüşmesi Modu
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mt-1">
          💬 AI Koç & Gerçek Hayat Simülasyonları ({data.scenarios.length} Sahne)
        </h1>
        <p className="text-sm md:text-base text-white/75 mt-1">
          Her karakter seni ve önceki sohbetlerde anlattığın detayları hatırlar; konuştukça aranızdaki samimiyet
          (Affinity) seviyesi yükselir. İster yazılı ister <b>📞 Canlı Sesli Arama Modu</b> ile pratik yap.
        </p>
      </div>

      {/* Kategori ve Seviye Filtreleri */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCatFilter(c.id)}
              className={`rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold transition ${
                catFilter === c.id
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                  : "bg-white/8 text-white/75 hover:bg-white/15"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/10">
          <span className="text-xs text-white/50 mr-1">Seviye:</span>
          {LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setLvlFilter(lv)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                lvlFilter === lv ? "bg-sky-500 text-white" : "bg-white/8 text-white/65 hover:bg-white/15"
              }`}
            >
              {lv === "ALL" ? "Tümü (A1–C2)" : lv}
            </button>
          ))}
          <span className="ml-auto text-xs text-white/50">{filtered.length} senaryo gösteriliyor</span>
        </div>
      </div>

      {/* Senaryo Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const badge = s.category ? CATEGORY_BADGE[s.category] : null;
          const aff = data.affinities?.[s.id];
          return (
            <div key={s.id} className="card p-5 flex flex-col justify-between hover:border-white/25 transition">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-3xl">{s.emoji}</span>
                  <div className="flex items-center gap-1.5">
                    {badge && (
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    )}
                    <span className="rounded-md bg-white/12 px-2.5 py-0.5 text-xs font-bold text-white">
                      {s.minLevel}
                    </span>
                  </div>
                </div>
                <h2 className="font-display text-lg font-bold mt-3 text-white">{s.title}</h2>
                <p className="text-xs md:text-sm text-white/75 mt-1">{s.description}</p>
                <div className="mt-3 rounded-lg bg-black/25 px-3 py-2 text-xs text-white/60 space-y-1.5">
                  <div>👤 {s.character}</div>
                  {SCENARIO_VOICES[s.id] && (
                    <div className="text-[11px] text-sky-300/90">
                      🎙️ Özel Ses: <b>{SCENARIO_VOICES[s.id].label}</b>
                    </div>
                  )}
                  <div className="pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-200 font-medium">
                        {aff ? `${aff.tierEmoji} ${aff.tierLabel}` : "🌱 Но́вый знако́мый (Yeni Tanışma)"}
                      </span>
                      <span className="text-white/45">%{aff?.affinity ?? 0}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-emerald-400"
                        style={{ width: `${aff?.affinity ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => start(s.id)}
                disabled={starting === s.id}
                className="btn-primary mt-4 w-full text-sm"
              >
                {starting === s.id ? <Spinner /> : "Sohbete Başla →"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Geçmiş Sohbetler */}
      {data.sessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold">🕓 Önceki Sohbetlerin</h2>
          <div className="grid gap-2.5">
            {data.sessions.map((s) => (
              <div key={s.id} className="card p-4 flex items-center justify-between gap-3">
                <Link href={`/coach/${s.id}`} className="flex-1 hover:underline font-medium">
                  {s.title} <span className="text-xs text-white/45 font-normal">({s.messageCount} mesaj)</span>
                </Link>
                <div className="flex items-center gap-3">
                  <Link href={`/coach/${s.id}`} className="text-xs font-semibold text-sky-300 hover:underline">
                    Devam et →
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeSession(s.id)}
                    className="text-xs text-white/40 hover:text-rose-300"
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
    </div>
  );
}
