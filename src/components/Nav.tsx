"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

const ITEMS = [
  {
    href: "/",
    code: "01",
    label: "Kampüs & Bugün",
    sub: "Günlük Plan",
    color: "bg-[#FFE4E0] text-[#D9381E]",
  },
  {
    href: "/roadmap",
    code: "02",
    label: "Müfredat Haritası",
    sub: "A1 → C2 ТРКИ",
    color: "bg-[#E0EAFF] text-[#1D4ED8]",
  },
  {
    href: "/coach",
    code: "03",
    label: "Canlı Diyaloglar",
    sub: "29 Sahne & Sesli Arama",
    color: "bg-[#FEF3C7] text-[#B45309]",
  },
  {
    href: "/immersion",
    code: "04",
    label: "Gerçek Rusya",
    sub: "Курси́в • Film • Radyo",
    color: "bg-[#DCFCE7] text-[#15803D]",
  },
  {
    href: "/mistakes",
    code: "05",
    label: "Hata Defterim",
    sub: "Zayıf Nokta Analizi",
    color: "bg-[#F3E8FF] text-[#6D28D9]",
  },
  {
    href: "/review",
    code: "06",
    label: "Akıllı Tekrar",
    sub: "SM-2 Hafıza Sistemi",
    color: "bg-[#E0F2FE] text-[#0369A1]",
  },
  {
    href: "/cards",
    code: "07",
    label: "Kalıp Arşivim",
    sub: "Kişisel Sözlük",
    color: "bg-[#F5F0E6] text-[#44403C]",
  },
  {
    href: "/placement",
    code: "08",
    label: "Seviye Tespit",
    sub: "Adaptif Sınav",
    color: "bg-[#FFE4E6] text-[#BE123C]",
  },
];

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  hasApiKey: boolean;
  maskedKey: string;
}

export function Nav() {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const isLoginPage = path === "/login";

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (mainEl) {
      if (isLoginPage) {
        mainEl.classList.remove("md:pl-72");
      } else {
        mainEl.classList.add("md:pl-72");
      }
    }
  }, [isLoginPage]);

  useEffect(() => {
    let cancelled = false;
    api<{ user: CurrentUser | null }>("/api/auth")
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
        setNewName(res.user?.name || "");
        setChecked(true);
        if (!res.user && path !== "/login") {
          router.replace("/login");
        }
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [path, router]);

  async function handleLogout() {
    await api("/api/auth", { body: { action: "logout" } });
    setUser(null);
    router.replace("/login");
  }

  async function handleSaveSettings() {
    if (!newKey.trim()) return;
    setSaving(true);
    try {
      const res = await api<{ saved: boolean; maskedKey: string; name: string }>("/api/settings/key", {
        body: { apiKey: newKey.trim(), name: newName.trim() || undefined },
      });
      if (user) {
        setUser({
          ...user,
          name: res.name || user.name,
          hasApiKey: true,
          maskedKey: res.maskedKey,
        });
      }
      setNewKey("");
      setShowKeyModal(false);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  if (isLoginPage || (checked && !user)) {
    return null;
  }

  const active = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href) || (href === "/roadmap" && path.startsWith("/lesson"));

  return (
    <>
      {/* Masaüstü Mimari Yan Menü */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 flex-col border-r-2 border-[#18181B] bg-[#EFECE4] px-5 py-5 z-30">
        {/* Marka Başlığı */}
        <Link
          href="/"
          className="mb-5 flex items-center justify-between rounded-2xl border-2 border-[#18181B] bg-white p-3.5 shadow-[0_3px_0_0_#18181B] transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#18181B] bg-[#D9381E] font-display text-lg font-extrabold text-white shadow-[0_2px_0_0_#18181B]">
              Р
            </span>
            <div>
              <div className="font-display text-base font-extrabold tracking-tight text-[#141413] leading-none">
                RUSSKIY
              </div>
              <div className="font-mono-code text-[10px] font-semibold text-[#57534E] mt-1">
                STUDIO • МГУ METHOD
              </div>
            </div>
          </div>
          <span className="rounded-md border border-[#18181B] bg-[#FEF3C7] px-1.5 py-0.5 font-mono-code text-[10px] font-bold text-[#92400E]">
            v2.5
          </span>
        </Link>

        <div className="px-2 mb-1.5 font-mono-code text-[10px] font-bold uppercase tracking-widest text-[#78716C]">
          Modüller & Stüdyolar
        </div>

        {/* Navigasyon Listesi */}
        <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
          {ITEMS.map((it) => {
            const isAct = active(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 transition-all ${
                  isAct
                    ? "border-2 border-[#18181B] bg-white shadow-[0_3px_0_0_#18181B] translate-x-0.5"
                    : "border-2 border-transparent hover:border-[#18181B]/30 hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#18181B] font-mono-code text-[11px] font-bold ${
                      isAct ? "bg-[#141413] text-white" : it.color
                    }`}
                  >
                    {it.code}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-extrabold text-[#141413] leading-tight truncate">{it.label}</div>
                    <div className="text-[10px] font-medium text-[#78716C] truncate">{it.sub}</div>
                  </div>
                </div>
                {isAct && <span className="h-2 w-2 rounded-full bg-[#D9381E] shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Öğrenci Hesabı & Kişisel Gemini API Kartı */}
        <div className="mt-3 rounded-2xl border-2 border-[#18181B] bg-[#141413] p-3.5 text-white shadow-[0_3px_0_0_#D9381E] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-stone-600 bg-[#D9381E] font-display text-xs font-extrabold text-white">
                {(user?.name || "Ö")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-display text-xs font-bold text-white truncate">
                  {user?.name || "Öğrenci"}
                </div>
                <div className="font-mono-code text-[10px] text-stone-400 truncate">
                  {user?.email || ""}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Hesaptan Çıkış Yap"
              className="rounded-lg border border-stone-700 bg-stone-900 px-2 py-1 font-mono-code text-[10px] font-bold text-stone-300 hover:bg-red-950 hover:text-red-300 hover:border-red-700 transition"
            >
              Çıkış
            </button>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/90 px-2.5 py-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono-code text-[9px] uppercase tracking-wider text-stone-400">
                KİŞİSEL GEMINI API
              </div>
              <div className="font-mono-code text-[11px] font-bold truncate mt-0.5">
                {user?.hasApiKey ? (
                  <span className="text-emerald-400">● {user.maskedKey}</span>
                ) : (
                  <span className="text-amber-400">⚠️ Anahtar Girilmedi</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="shrink-0 rounded-lg border border-stone-600 bg-white px-2.5 py-1 font-mono-code text-[10px] font-extrabold text-[#141413] hover:bg-[#FEF3C7] transition"
            >
              {user?.hasApiKey ? "Değiştir" : "+ Ekle"}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobil Alt Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around border-t-2 border-[#18181B] bg-[#FFFFFF] py-2 px-1 shadow-[0_-4px_0_0_rgba(24,24,27,0.06)]">
        {ITEMS.slice(0, 5).map((it) => {
          const isAct = active(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center rounded-xl px-2 py-1 text-[10px] font-bold transition ${
                isAct ? "bg-[#FFE4E0] text-[#D9381E] border border-[#18181B]" : "text-[#57534E]"
              }`}
            >
              <span className="font-mono-code text-[11px] font-extrabold">{it.code}</span>
              <span className="truncate max-w-[54px]">{it.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setShowKeyModal(true)}
          className="flex flex-col items-center rounded-xl px-2 py-1 text-[10px] font-bold text-[#57534E]"
        >
          <span className="font-mono-code text-[11px] font-extrabold">🔑</span>
          <span>Hesap</span>
        </button>
      </nav>

      {/* Kişisel Gemini API Anahtarı & Hesap Modalı */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border-2 border-[#18181B] bg-white p-6 shadow-[0_6px_0_0_#18181B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono-code text-[10px] font-bold uppercase tracking-wider text-[#D9381E]">
                  KİŞİSEL HESAP AYARLARI
                </span>
                <h3 className="font-display text-lg font-extrabold text-[#141413]">
                  Gemini API Anahtarın
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#18181B] bg-[#F5F2EA] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-stone-200 bg-[#FAF8F3] p-3 text-xs text-[#44403C] space-y-1">
              <div>
                Aktif Hesap: <strong>{user?.name}</strong> ({user?.email})
              </div>
              <div>
                Mevcut Anahtar:{" "}
                <strong className="font-mono-code">
                  {user?.hasApiKey ? user.maskedKey : "Henüz tanımlanmadı"}
                </strong>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-mono-code text-[11px] font-bold uppercase text-[#141413] mb-1">
                  Görünen Adın
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#18181B] bg-[#FAF8F3] px-3.5 py-2 text-sm font-semibold text-[#141413] outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono-code text-[11px] font-bold uppercase text-[#141413]">
                    Yeni Gemini API Anahtarı *
                  </label>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono-code text-[10px] font-bold text-[#1D4ED8] underline"
                  >
                    Google AI Studio'dan Al ↗
                  </a>
                </div>
                <input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="AIzaSy... veya AQ..."
                  className="w-full rounded-xl border-2 border-[#18181B] bg-[#FAF8F3] px-3.5 py-2.5 font-mono-code text-xs text-[#141413] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border-2 border-[#18181B] bg-[#FFE4E6] px-3.5 py-2.5 text-xs font-bold text-[#BE123C]"
              >
                Hesaptan Çıkış Yap
              </button>
              <button
                type="button"
                disabled={saving || !newKey.trim()}
                onClick={handleSaveSettings}
                className="btn-primary text-xs py-2.5 px-5"
              >
                {saving ? "Kaydediliyor…" : "Anahtarı Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
