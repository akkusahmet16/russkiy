"use client";

import { useState } from "react";
import { api } from "@/lib/client";

export function AiKeyBanner({ onSaved }: { onSaved?: () => void }) {
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveKey() {
    if (!key.trim()) return;
    setSaving(true);
    try {
      await api("/api/settings/key", { body: { apiKey: key.trim() } });
      setSaved(true);
      onSaved?.();
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  if (saved) return null;

  return (
    <div className="card p-6 bg-[#FEF3C7] space-y-3">
      <div className="font-display text-base font-extrabold text-[#141413]">
        API Anahtarı Gerekli — AI Koç Stüdyosunu Aktifleştir
      </div>
      <p className="text-sm text-[#44403C]">
        Canlı roleplay sohbeti, AI cümle kontrolü, sesli telaffuz analizi ve dinamik ders üretimi için{" "}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-[#1D4ED8] underline font-bold"
        >
          Google AI Studio
        </a>{" "}
        üzerinden ücretsiz bir Gemini API anahtarı alıp aşağıya yapıştırabilirsin:
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="AIzaSy... (Gemini API Anahtarın)"
          className="flex-1 rounded-xl border-2 border-[#18181B] bg-white px-4 py-2.5 font-mono-code text-sm text-[#141413] outline-none"
        />
        <button type="button" onClick={saveKey} disabled={saving || !key.trim()} className="btn-primary text-sm">
          {saving ? "Kaydediliyor…" : "Kaydet ve Aktifleştir"}
        </button>
      </div>
    </div>
  );
}

export function ErrorBox({ message, code }: { message: string; code?: string }) {
  if (code === "NO_AI_KEY") return <AiKeyBanner />;
  return (
    <div className="rounded-2xl border-2 border-[#18181B] bg-[#FFE4E6] p-4 text-sm font-bold text-[#BE123C] shadow-[0_3px_0_0_#18181B]">
      Hata: {message}
    </div>
  );
}
