"use client";

export class ApiError extends Error {
  code?: string;
  status: number;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(url: string, opts?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: opts?.method ?? (opts?.body ? "POST" : "GET"),
    headers: opts?.body ? { "Content-Type": "application/json" } : undefined,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data && typeof data === "object" && "error" in data && data.error)) {
    throw new ApiError((data as { error?: string }).error ?? `Hata (${res.status})`, res.status, (data as { code?: string }).code);
  }
  return data as T;
}

/** Vurgu işaretlerini kaldırır (karşılaştırma için) */
export function stripStress(s: string) {
  return s.normalize("NFD").replace(/\u0301/g, "").normalize("NFC");
}
