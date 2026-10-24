"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { SpeakButton, Spinner } from "@/components/Speak";

interface CardItem {
  id: number;
  ru: string;
  translit: string;
  tr: string;
  note: string | null;
  interval: number;
  reps: number;
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardItem[] | null>(null);
  const [ru, setRu] = useState("");
  const [translit, setTranslit] = useState("");
  const [tr, setTr] = useState("");
  const [note, setNote] = useState("");

  function load() {
    api<{ cards: CardItem[] }>("/api/cards").then((d) => setCards(d.cards));
  }

  useEffect(() => {
    load();
  }, []);

  async function addCard() {
    if (!ru.trim() || !tr.trim()) return;
    await api("/api/cards", { body: { ru, translit, tr, note } });
    setRu("");
    setTranslit("");
    setTr("");
    setNote("");
    load();
  }

  async function removeCard(id: number) {
    await api("/api/cards", { method: "DELETE", body: { id } });
    load();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">🗂️ Kelime & Kalıp Kartlarım</h1>
          <p className="text-sm text-white/65">
            Tamamladığın derslerden ve koç sohbetlerinden biriken tüm ifadeler burada. İstersen kendin de kart ekleyebilirsin.
          </p>
        </div>
        <Link href="/review" className="btn-primary text-sm">
          🔁 Tekrar Yap
        </Link>
      </div>

      {/* Yeni kart ekleme formu */}
      <div className="card p-5 space-y-3">
        <div className="text-sm font-semibold">➕ Yeni Kalıp / Kelime Ekle</div>
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            value={ru}
            onChange={(e) => setRu(e.target.value)}
            placeholder="Rusça (örn: Коро́че)"
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-sky-400/60"
          />
          <input
            value={translit}
            onChange={(e) => setTranslit(e.target.value)}
            placeholder="Okunuşu (örn: Karóçe)"
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-sky-400/60"
          />
          <input
            value={tr}
            onChange={(e) => setTr(e.target.value)}
            placeholder="Türkçe anlamı (örn: Kısacası)"
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-sky-400/60"
          />
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Not (opsiyonel)"
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-sky-400/60"
            />
            <button type="button" onClick={addCard} className="btn-primary text-sm px-4">
              Ekle
            </button>
          </div>
        </div>
      </div>

      {!cards ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner className="h-8 w-8 text-rose-400" />
        </div>
      ) : cards.length === 0 ? (
        <div className="card p-8 text-center text-sm text-white/60">
          Henüz kartın yok. Bir dersi tamamladığında kalıplar otomatik olarak buraya eklenir!
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.id} className="card p-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-lg">{c.ru}</div>
                {c.translit && <div className="text-xs text-sky-300">{c.translit}</div>}
                <div className="text-sm text-white/80 mt-1">{c.tr}</div>
                {c.note && <div className="text-xs text-amber-200/80 mt-1">💡 {c.note}</div>}
                <div className="text-[11px] text-white/40 mt-2">
                  Tekrar sayısı: {c.reps} • Aralık: {c.interval} gün
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SpeakButton text={c.ru} size="sm" showSpeakerBadge />
                <button
                  type="button"
                  onClick={() => removeCard(c.id)}
                  className="text-xs text-white/35 hover:text-rose-300 px-1.5"
                  title="Sil"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
