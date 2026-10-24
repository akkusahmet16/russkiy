"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { SpeakButton, Spinner, speak } from "@/components/Speak";
import { PronunciationCheck } from "@/components/Recorder";

interface ReviewCard {
  id: number;
  ru: string;
  translit: string;
  tr: string;
  note: string | null;
  previews: [string, string, string, string];
}

export default function ReviewPage() {
  const [cards, setCards] = useState<ReviewCard[] | null>(null);
  const [total, setTotal] = useState(0);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    api<{ total: number; cards: ReviewCard[] }>("/api/review").then((d) => {
      setCards(d.cards);
      setTotal(d.total);
    });
  }, []);

  if (!cards) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-rose-400" />
      </div>
    );
  }

  const current = cards[idx];

  async function grade(g: 0 | 1 | 2 | 3) {
    if (!current) return;
    await api("/api/review", { body: { id: current.id, grade: g } });
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  if (!current) {
    return (
      <div className="card p-10 text-center space-y-4">
        <div className="text-5xl">✨</div>
        <h1 className="font-display text-2xl font-bold">
          {total === 0 ? "Henüz tekrar kartın yok" : "Bugünkü tüm tekrarlarını bitirdin!"}
        </h1>
        <p className="text-sm text-white/65 max-w-md mx-auto">
          {total === 0
            ? "İlk dersini tamamladığında dersteki tüm kalıplar otomatik olarak aralıklı tekrar destene eklenir."
            : "SM-2 algoritması her kalıbı unutmaya yakın olduğun gün tekrar karşına çıkaracak."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/roadmap" className="btn-primary">
            Yeni Derse Geç →
          </Link>
          <Link href="/cards" className="btn-ghost">
            Tüm Kartlarım ({total})
          </Link>
        </div>
      </div>
    );
  }

  const GRADES: { g: 0 | 1 | 2 | 3; label: string; cls: string }[] = [
    { g: 0, label: "Tekrar", cls: "border-rose-400/40 bg-rose-500/15 text-rose-200" },
    { g: 1, label: "Zor", cls: "border-amber-400/40 bg-amber-500/15 text-amber-200" },
    { g: 2, label: "İyi", cls: "border-sky-400/40 bg-sky-500/15 text-sky-200" },
    { g: 3, label: "Kolay", cls: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200" },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>🔁 Aralıklı Tekrar (SM-2)</span>
        <span>
          {idx + 1} / {cards.length}
        </span>
      </div>

      <div className="card p-8 space-y-6 text-center">
        <div className="flex justify-center items-center gap-3 flex-wrap">
          <div className="font-display text-2xl md:text-3xl font-bold">{current.ru}</div>
          <SpeakButton text={current.ru} withSlow showSpeakerBadge />
        </div>

        {!flipped ? (
          <button
            type="button"
            onClick={() => {
              setFlipped(true);
              speak(current.ru);
            }}
            className="btn-ghost w-full py-4"
          >
            Anlamını Göster 👀
          </button>
        ) : (
          <div className="space-y-6 pt-4 border-t border-white/10">
            <div>
              {current.translit && <div className="text-sm text-sky-300 font-medium">{current.translit}</div>}
              <div className="text-xl font-semibold text-white mt-1">{current.tr}</div>
              {current.note && <div className="text-xs text-amber-200/80 mt-2">💡 {current.note}</div>}
            </div>

            <div className="text-left">
              <PronunciationCheck target={current.ru} />
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {GRADES.map(({ g, label, cls }) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => grade(g)}
                  className={`rounded-xl border p-3 text-center transition hover:brightness-125 ${cls}`}
                >
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-[11px] opacity-75">{current.previews[g]}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
