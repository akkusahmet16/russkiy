"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

interface AuthResponse {
  user?: {
    id: string;
    email: string;
    name: string;
    hasApiKey: boolean;
    maskedKey: string;
  };
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showKeyFieldOnLogin, setShowKeyFieldOnLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<AuthResponse>("/api/auth", {
        body: {
          action: mode,
          name: mode === "register" ? name : undefined,
          email,
          password,
          geminiApiKey: geminiApiKey.trim() || undefined,
        },
      });
      if (res.error || !res.user) {
        setError(res.error || "İşlem başarısız oldu.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Sol Mimari Tanıtım Sütunu */}
        <div className="lg:col-span-6 rounded-3xl border-2 border-[#18181B] bg-[#141413] p-8 md:p-10 text-white shadow-[0_6px_0_0_#D9381E] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-white bg-[#D9381E] font-display text-2xl font-extrabold text-white">
                  Р
                </span>
                <div>
                  <div className="font-display text-xl font-extrabold tracking-tight text-white">
                    RUSSKIY STUDIO
                  </div>
                  <div className="font-mono-code text-xs text-[#FBBF24]">
                    KİŞİSEL RUSÇA STÜDYOSU • A1 → C2
                  </div>
                </div>
              </div>
              <span className="rounded-lg border border-stone-700 bg-stone-900 px-2.5 py-1 font-mono-code text-[11px] font-bold text-emerald-400">
                BYOK • KİŞİSEL HESAP
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <h1 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">
                Kendi Hesabın, Kendi İlerlemen, Kendi AI Anahtarın.
              </h1>
              <p className="text-sm text-stone-300 leading-relaxed">
                RUSSKIY; her öğrencinin ilerlemesini, kelime kartlarını, hata defterini ve 29 Rus karakterle kurduğu
                ilişki hafızasını kendi hesabında izole olarak saklar.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="rounded-2xl border border-stone-700 bg-stone-900/90 p-4">
                <div className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
                  01 • KİŞİSEL İLERLEME KAYDI
                </div>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Tamamladığın dersler, XP serin (streak), SM-2 hafıza kartların ve konuşma karnelerin hesabına özel
                  kaydedilir.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-700 bg-stone-900/90 p-4">
                <div className="font-mono-code text-xs font-bold uppercase tracking-wider text-emerald-400">
                  02 • KENDİ GEMINI API ANAHTARIN (BYOK)
                </div>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Her kullanıcı kendi ücretsiz Google Gemini API anahtarını girer. Böylece sesli AI koçluk (Gemini 2.5
                  Native Audio) ve ders üretiminde başkalarının kotasından etkilenmezsin.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-700 bg-stone-900/90 p-4">
                <div className="font-mono-code text-xs font-bold uppercase tracking-wider text-sky-400">
                  03 • 29 GERÇEKÇİ KARAKTER & TELEFON MODU
                </div>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  Ка́тя, Ди́ма ve Ба́бушка Ни́на seni isminle tanır, önceki sohbetlerde anlattığın detayları hatırlar.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span>ТРКИ-1 / ТРКИ-4 Müfredatı</span>
            <span className="font-mono-code text-[#FBBF24]">МГУ • СПбГУ Standard</span>
          </div>
        </div>

        {/* Sağ Giriş / Kayıt Formu Sütunu */}
        <div className="lg:col-span-6 rounded-3xl border-2 border-[#18181B] bg-white p-7 md:p-9 shadow-[0_6px_0_0_#18181B] flex flex-col justify-between">
          <div>
            {/* Sekmeler */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-[#18181B] bg-[#F5F2EA] p-1.5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`rounded-xl py-2.5 text-xs font-display font-extrabold transition ${
                  mode === "register"
                    ? "bg-[#D9381E] text-white border-2 border-[#18181B] shadow-[0_2px_0_0_#18181B]"
                    : "text-[#57534E] hover:text-[#141413]"
                }`}
              >
                Yeni Hesap Oluştur
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`rounded-xl py-2.5 text-xs font-display font-extrabold transition ${
                  mode === "login"
                    ? "bg-[#141413] text-white border-2 border-[#18181B] shadow-[0_2px_0_0_#D9381E]"
                    : "text-[#57534E] hover:text-[#141413]"
                }`}
              >
                Giriş Yap
              </button>
            </div>

            <div className="mb-5">
              <h2 className="font-display text-xl font-extrabold text-[#141413]">
                {mode === "register" ? "Öğrenci Kimliğini Oluştur" : "Stüdyoya Tekrar Hoş Geldin"}
              </h2>
              <p className="text-xs text-[#57534E] mt-1">
                {mode === "register"
                  ? "İsmini, e-postanı ve kişisel Gemini API anahtarını girerek hemen başla."
                  : "Kayıtlı e-posta adresin ve şifrenle kaldığın dersten devam et."}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border-2 border-[#18181B] bg-[#FFE4E6] px-4 py-3 text-xs font-bold text-[#BE123C]">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block font-mono-code text-[11px] font-bold uppercase tracking-wider text-[#141413] mb-1.5">
                    Adın / Kullanıcı Adın *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Ahmet"
                    className="w-full rounded-xl border-2 border-[#18181B] bg-[#FAF8F3] px-4 py-2.5 text-sm font-semibold text-[#141413] outline-none focus:bg-white focus:ring-2 focus:ring-[#D9381E]"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono-code text-[11px] font-bold uppercase tracking-wider text-[#141413] mb-1.5">
                  E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className="w-full rounded-xl border-2 border-[#18181B] bg-[#FAF8F3] px-4 py-2.5 text-sm font-semibold text-[#141413] outline-none focus:bg-white focus:ring-2 focus:ring-[#D9381E]"
                />
              </div>

              <div>
                <label className="block font-mono-code text-[11px] font-bold uppercase tracking-wider text-[#141413] mb-1.5">
                  Şifre *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 4 karakter"
                  className="w-full rounded-xl border-2 border-[#18181B] bg-[#FAF8F3] px-4 py-2.5 text-sm font-semibold text-[#141413] outline-none focus:bg-white focus:ring-2 focus:ring-[#D9381E]"
                />
              </div>

              {/* Kişisel Gemini API Key Alanı */}
              {(mode === "register" || showKeyFieldOnLogin) ? (
                <div className="rounded-2xl border-2 border-[#18181B] bg-[#FEF3C7] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-mono-code text-[11px] font-extrabold uppercase tracking-wider text-[#92400E]">
                      🔑 Kişisel Gemini API Anahtarın
                    </label>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[#18181B] bg-white px-2.5 py-1 font-mono-code text-[10px] font-bold text-[#1D4ED8] hover:bg-stone-50"
                    >
                      Ücretsiz Anahtar Al ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy... veya AQ... (Google AI Studio anahtarın)"
                    className="w-full rounded-xl border-2 border-[#18181B] bg-white px-3.5 py-2 font-mono-code text-xs text-[#141413] outline-none"
                  />
                  <p className="text-[11px] text-[#57534E] leading-snug">
                    Anahtarın yalnızca senin hesabına şifreli olarak kaydedilir. Dilersen giriş yaptıktan sonra sol
                    menüden de ekleyebilir veya değiştirebilirsin.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowKeyFieldOnLogin(true)}
                  className="text-xs font-bold text-[#1D4ED8] underline"
                >
                  + Giriş yaparken Gemini API anahtarımı da güncellemek istiyorum
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-sm font-display font-extrabold mt-2"
              >
                {loading
                  ? "Stüdyo Hazırlanıyor…"
                  : mode === "register"
                    ? "Hesabımı Oluştur ve Stüdyoya Gir →"
                    : "Giriş Yap ve Devam Et →"}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200 text-center text-xs text-[#57534E]">
            {mode === "register" ? (
              <>
                Zaten hesabın var mı?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-extrabold text-[#D9381E] underline"
                >
                  Buradan Giriş Yap
                </button>
              </>
            ) : (
              <>
                Henüz hesabın yok mu?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-extrabold text-[#D9381E] underline"
                >
                  Yeni Hesap Oluştur
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
