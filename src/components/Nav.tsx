"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    sub: "27 Sahne & Sesli Arama",
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

export function Nav() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href) || (href === "/roadmap" && path.startsWith("/lesson"));

  return (
    <>
      {/* Masaüstü Mimari Yan Menü */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 flex-col border-r-2 border-[#18181B] bg-[#EFECE4] px-5 py-6 z-30">
        {/* Marka Başlığı */}
        <Link
          href="/"
          className="mb-6 flex items-center justify-between rounded-2xl border-2 border-[#18181B] bg-white p-3.5 shadow-[0_3px_0_0_#18181B] transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#18181B] bg-[#D9381E] font-display text-xl font-extrabold text-white shadow-[0_2px_0_0_#18181B]">
              Р
            </span>
            <div>
              <div className="font-display text-lg font-extrabold tracking-tight text-[#141413] leading-none">
                RUSSKIY
              </div>
              <div className="font-mono-code text-[11px] font-semibold text-[#57534E] mt-1">
                STUDIO • МГУ METHOD
              </div>
            </div>
          </div>
          <span className="rounded-md border border-[#18181B] bg-[#FEF3C7] px-1.5 py-0.5 font-mono-code text-[10px] font-bold text-[#92400E]">
            v2.4
          </span>
        </Link>

        <div className="px-2 mb-2 font-mono-code text-[10px] font-bold uppercase tracking-widest text-[#78716C]">
          Modüller & Stüdyolar
        </div>

        {/* Navigasyon Listesi */}
        <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
          {ITEMS.map((it) => {
            const isAct = active(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                  isAct
                    ? "border-2 border-[#18181B] bg-white shadow-[0_3px_0_0_#18181B] translate-x-0.5"
                    : "border-2 border-transparent hover:border-[#18181B]/30 hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#18181B] font-mono-code text-xs font-bold ${
                      isAct ? "bg-[#141413] text-white" : it.color
                    }`}
                  >
                    {it.code}
                  </span>
                  <div className="truncate">
                    <div className="text-sm font-extrabold text-[#141413] leading-tight truncate">{it.label}</div>
                    <div className="text-[11px] font-medium text-[#78716C] truncate">{it.sub}</div>
                  </div>
                </div>
                {isAct && <span className="h-2 w-2 rounded-full bg-[#D9381E] shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Alt Bilgi Kartı */}
        <div className="mt-4 rounded-2xl border-2 border-[#18181B] bg-[#141413] p-4 text-white shadow-[0_3px_0_0_#D9381E]">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[10px] uppercase tracking-wider text-[#FBBF24]">
              ТРКИ / CEFR STANDARD
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="font-display text-xs font-bold text-white mt-1">
            A1 Başlangıç → C2 Носи́тель
          </div>
          <div className="text-[11px] text-stone-300 mt-0.5">
            Canlı Native Audio & Kişisel Hafıza Aktif
          </div>
        </div>
      </aside>

      {/* Mobil Alt Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around border-t-2 border-[#18181B] bg-[#FFFFFF] py-2 px-1 shadow-[0_-4px_0_0_rgba(24,24,27,0.06)]">
        {ITEMS.slice(0, 6).map((it) => {
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
              <span className="truncate max-w-[56px]">{it.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
