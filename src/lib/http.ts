import "server-only";
import { NextResponse } from "next/server";
import { AiNotConfiguredError } from "./ai";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(e: unknown) {
  if (e instanceof AiNotConfiguredError) {
    return NextResponse.json({ error: e.message, code: "NO_AI_KEY" }, { status: 503 });
  }
  console.error(e);
  const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
  // Gemini kota / yoğunluk hataları için anlaşılır mesaj
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    return NextResponse.json({ error: "AI kotası doldu veya çok sık istek atıldı. Biraz bekleyip tekrar dene.", code: "RATE_LIMIT" }, { status: 429 });
  }
  if (/503|UNAVAILABLE|overloaded/i.test(msg)) {
    return NextResponse.json({ error: "AI şu an yoğun. Birkaç saniye sonra tekrar dene.", code: "BUSY" }, { status: 503 });
  }
  return NextResponse.json({ error: msg }, { status: 500 });
}
