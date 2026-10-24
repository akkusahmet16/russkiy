import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Unbounded, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RUSSKIY — Etkileşimli Rusça Dil Stüdyosu (A1 → C2)",
  description:
    "Akıcı konuşma, gerçek Rusya simülasyonları ve mikro-adımlarla A1'den C2'ye (ТРКИ-4) uzanan yeni nesil Rusça öğrenim ürünü",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${jakarta.variable} ${unbounded.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Suspense fallback={null}>
          <Nav />
        </Suspense>
        <main className="md:pl-72 pb-28 md:pb-16">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">{children}</div>
        </main>
      </body>
    </html>
  );
}
