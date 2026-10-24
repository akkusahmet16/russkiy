"use client";

import { useRef, useState, type KeyboardEvent } from "react";

const ROWS = [
  ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ"],
  ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю", "ё"],
];

export function RuInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Rusça cevabını yaz… (Latin harfler de olur)",
  disabled,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  const [showKb, setShowKb] = useState(false);
  const [upper, setUpper] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  function insert(ch: string) {
    const el = ref.current;
    if (!el) return onChange(value + ch);
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? value.length;
    const next = value.slice(0, s) + ch + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + ch.length, s + ch.length);
    });
    if (upper) setUpper(false);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && onSubmit) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          lang="ru"
          spellCheck={false}
          className="w-full resize-none rounded-2xl border-2 border-[#18181B] bg-[#FAF8F3] px-4 py-3.5 pr-20 text-lg font-semibold text-[#141413] outline-none placeholder:text-[#8A847C] placeholder:font-normal focus:bg-white focus:shadow-[0_3px_0_0_#18181B] transition disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setShowKb((s) => !s)}
          title="Ekran Kiril Klavyesini Aç/Kapat"
          className={`absolute right-3 top-3 rounded-xl border-2 border-[#18181B] px-2.5 py-1 font-mono-code text-xs font-extrabold transition cursor-pointer ${
            showKb
              ? "bg-[#141413] text-white"
              : "bg-[#EFECE4] text-[#141413] hover:bg-[#E2DDD2] shadow-[0_2px_0_0_#18181B]"
          }`}
        >
          ⌨ АБВ
        </button>
      </div>
      {showKb && (
        <div className="rounded-2xl border-2 border-[#18181B] bg-[#EFECE4] p-3 select-none shadow-[0_3px_0_0_#18181B]">
          {ROWS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5 mb-1.5">
              {row.map((k) => (
                <button
                  key={k}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insert(upper ? k.toUpperCase() : k)}
                  className="h-9 min-w-[2rem] flex-1 max-w-[2.7rem] rounded-lg border border-[#18181B] bg-white font-bold text-base text-[#141413] shadow-[0_2px_0_0_#18181B] hover:bg-[#FEF3C7] active:translate-y-0.5 cursor-pointer"
                >
                  {upper ? k.toUpperCase() : k}
                </button>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-1.5 mt-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setUpper((u) => !u)}
              className={`h-9 px-3 rounded-lg border border-[#18181B] font-mono-code text-xs font-bold ${
                upper ? "bg-[#141413] text-white" : "bg-white text-[#141413] shadow-[0_2px_0_0_#18181B]"
              }`}
            >
              ⇧ BÜYÜK
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(" ")}
              className="h-9 flex-1 max-w-xs rounded-lg border border-[#18181B] bg-white font-mono-code text-xs font-bold text-[#141413] shadow-[0_2px_0_0_#18181B]"
            >
              BOŞLUK
            </button>
            {["?", ",", ".", "!"].map((p) => (
              <button
                key={p}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insert(p)}
                className="h-9 w-9 rounded-lg border border-[#18181B] bg-white font-bold text-[#141413] shadow-[0_2px_0_0_#18181B]"
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange(value.slice(0, -1))}
              className="h-9 px-3 rounded-lg border border-[#18181B] bg-white font-mono-code text-xs font-bold text-[#141413] shadow-[0_2px_0_0_#18181B]"
            >
              ⌫ SİL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
