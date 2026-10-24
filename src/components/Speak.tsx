"use client";

import { useState } from "react";
import { resolveVoiceProfile } from "@/lib/voices";

const audioCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();
let current: HTMLAudioElement | null = null;

export interface SpeakOptions {
  slow?: boolean;
  scenarioId?: string;
  voice?: string;
}

function browserSpeak(text: string, opts?: SpeakOptions) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const profile = resolveVoiceProfile({ scenarioId: opts?.scenarioId, voiceName: opts?.voice, text });
  const clean = text.normalize("NFD").replace(/\u0301/g, "").normalize("NFC");
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "ru-RU";
  u.pitch = profile.pitch;
  u.rate = opts?.slow ? 0.68 : profile.rate;

  const ruVoices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ru"));
  if (ruVoices.length > 0) {
    const genderHint =
      profile.gender === "male"
        ? /yuri|pavel|dmitry|maxim|male|муж/i
        : /milena|katya|irina|elena|tatyana|female|жен/i;
    const matched = ruVoices.find((v) => genderHint.test(v.name));
    u.voice = matched ?? ruVoices[0];
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

async function fetchTtsUrl(text: string, opts?: SpeakOptions): Promise<string | null> {
  const profile = resolveVoiceProfile({ scenarioId: opts?.scenarioId, voiceName: opts?.voice, text });
  const key = `v4|${profile.voiceName}|${text}`;
  if (audioCache.has(key)) return audioCache.get(key)!;
  if (inflight.has(key)) return inflight.get(key)!;

  const p = (async () => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          scenarioId: opts?.scenarioId,
          voice: profile.voiceName,
        }),
      });
      if (!res.ok) return null;
      const url = URL.createObjectURL(await res.blob());
      audioCache.set(key, url);
      return url;
    } catch {
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

export function prefetchAudio(text: string, opts?: SpeakOptions) {
  if (!text?.trim() || typeof window === "undefined") return;
  void fetchTtsUrl(text, opts);
}

export async function speak(text: string, slowOrOpts: boolean | SpeakOptions = false) {
  if (!text?.trim()) return;
  const opts: SpeakOptions = typeof slowOrOpts === "boolean" ? { slow: slowOrOpts } : slowOrOpts;
  try {
    current?.pause();
    const url = await fetchTtsUrl(text, opts);
    if (!url) throw new Error("tts");
    const audio = new Audio(url);
    audio.preservesPitch = true;
    audio.playbackRate = opts.slow ? 0.72 : 1.0;
    current = audio;
    await audio.play();
  } catch {
    browserSpeak(text, opts);
  }
}

export function SpeakButton({
  text,
  size = "md",
  withSlow = false,
  scenarioId,
  voice,
  showSpeakerBadge = false,
}: {
  text: string;
  size?: "sm" | "md";
  withSlow?: boolean;
  scenarioId?: string;
  voice?: string;
  showSpeakerBadge?: boolean;
}) {
  const [loading, setLoading] = useState<null | "n" | "s">(null);
  const profile = resolveVoiceProfile({ scenarioId, voiceName: voice, text });
  const shortName = profile.label.split("(")[0].trim();
  const cls = size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-3.5 text-sm";

  async function play(slow: boolean) {
    setLoading(slow ? "s" : "n");
    await speak(text, { slow, scenarioId, voice: profile.voiceName });
    setLoading(null);
  }

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      {showSpeakerBadge && (
        <span
          className="rounded-lg border border-[#18181B] bg-[#FEF3C7] px-2.5 py-1 font-mono-code text-[11px] font-bold text-[#92400E]"
          title={`Seslendiren: ${profile.label}`}
        >
          {shortName}
        </span>
      )}
      <button
        type="button"
        onClick={() => play(false)}
        title={`Dinle — ${profile.label}`}
        className={`${cls} inline-flex items-center justify-center gap-1 rounded-xl border-2 border-[#18181B] bg-[#E0EAFF] font-bold text-[#1D4ED8] shadow-[0_2px_0_0_#18181B] hover:bg-[#C7D8FF] active:translate-y-0.5 transition cursor-pointer`}
      >
        {loading === "n" ? <Spinner /> : "▶ Dinle"}
      </button>
      {withSlow && (
        <button
          type="button"
          onClick={() => play(true)}
          title={`Yavaş dinle (0.72x) — ${profile.label}`}
          className={`${cls} inline-flex items-center justify-center rounded-xl border-2 border-[#18181B] bg-[#F7F4EC] font-mono-code font-bold text-[#141413] shadow-[0_2px_0_0_#18181B] hover:bg-[#ECE6D8] active:translate-y-0.5 transition cursor-pointer`}
        >
          {loading === "s" ? <Spinner /> : "0.7x"}
        </button>
      )}
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
