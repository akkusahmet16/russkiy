# 🤖 AI_HANDOFF_AND_ARCHITECTURE.md — Multi-Agent Developer & Pedagogical Specification

> **Purpose of this file:** This document is the authoritative technical and pedagogical handoff guide for any AI coding assistant (Claude, Gemini, GPT, Cursor, Windsurf, Antigravity) or human engineer working on **Russkiy**. Read this file completely before modifying code, prompts, database models, or curriculum content.

---

## 1. System Overview & Tech Stack

- **Framework:** Next.js `16.4.3` (App Router, React 19, TypeScript, Tailwind CSS v4).
- **Database:** SQLite via Prisma v7 (`@prisma/client` + `@prisma/adapter-better-sqlite3`).
  - Schema: `prisma/schema.prisma`
  - Generated client: `src/generated/prisma` (imported via `@/generated/prisma/client` inside `src/lib/db.ts`).
- **AI Engine:** `@google/genai` SDK (`src/lib/ai.ts`).
  - **Primary Fast Model:** `gemini-3.1-flash-lite-preview` with `thinkingConfig: { thinkingBudget: 0 }` (~1.5s latency).
  - **Fallback Chain:** `["gemini-3.1-flash-lite-preview", "gemini-3.6-flash", "gemini-3.5-flash-lite"]`.
  - **WARNING:** Never hardcode `gemini-2.5-flash` or `gemini-2.5-flash-lite` — they return `HTTP 404 NOT_FOUND` on newer API keys. And avoid deep-thinking configurations on synchronous UI routes (`thinkingLevel: "LOW"` on `gemini-3.8-flash` can queue for >30s).
  - **TTS Model:** `gemini-2.5-flash-preview-tts` (24kHz PCM converted to WAV and cached on disk in `.tts-cache/`).

---

## 2. Directory & File Map

```text
russkiy/
├── prisma/
│   └── schema.prisma              # SQLite models (Profile, DailyActivity, LessonProgress, GeneratedLesson, Card, ChatSession, ChatMessage)
├── src/
│   ├── content/
│   │   ├── types.ts               # Core TypeScript types (LevelId A1..C2, Phrase, Exercise, LessonContent, Scenario)
│   │   ├── curriculum.ts          # Full A1 (ТЭУ) → C2 (ТРКИ-4) curriculum tree + helper functions
│   │   └── scenarios.ts           # 13 roleplay scenarios from A1 (Cafe, Dorm, Metro) to C2 (Moscow Kitchen Philosophy)
│   ├── lib/
│   │   ├── ai.ts                  # Gemini client, model fallback chain, LRU cache, Russian pedagogical & translit rules
│   │   ├── db.ts                  # Prisma Better-SQLite3 singleton + getProfile()
│   │   ├── lessons.ts             # Lesson loader + AI on-demand lesson generator (cached in GeneratedLesson table)
│   │   ├── coach.ts               # Roleplay engine + structured feedback schema (corrections, newWords, suggestions, goalsCompleted)
│   │   ├── srs.ts                 # SM-2 spaced repetition algorithm
│   │   ├── progress.ts            # XP, streak, 7-day chart, and current level calculation
│   │   ├── http.ts                # Standardized API response & error handling
│   │   └── client.ts              # Frontend fetch wrapper
│   ├── components/
│   │   ├── Speak.tsx              # Neural TTS player + background prefetchAudio() + Web Speech API fallback
│   │   ├── Recorder.tsx           # 16kHz mono WAV WebAudio recorder + /api/pronounce evaluator
│   │   ├── RuInput.tsx            # Russian input with toggleable on-screen Cyrillic keyboard
│   │   ├── Markdown.tsx           # High-contrast GFM markdown renderer
│   │   ├── Nav.tsx                # Sidebar & mobile bottom nav (wrapped in <Suspense> in layout.tsx)
│   │   └── Banners.tsx            # Inline API key setup banner & error displays
│   └── app/
│       ├── page.tsx               # Dashboard ("Bugün")
│       ├── roadmap/page.tsx       # A1 → C2 (ТРКИ-4) interactive roadmap
│       ├── lesson/[id]/page.tsx   # 4-stage interactive micro-learning lesson player
│       ├── coach/page.tsx         # Roleplay scenario gallery & past sessions
│       ├── coach/[id]/page.tsx    # Live AI roleplay chat with inline corrections & SRS card saving
│       ├── review/page.tsx        # SM-2 flashcard review session
│       ├── cards/page.tsx         # Personal vocabulary & chunk deck manager
│       └── api/                   # REST Route Handlers (stats, roadmap, lessons/[id], check, pronounce, tts, ask, coach, review, cards, settings/key)
```

---

## 3. Non-Negotiable Pedagogical & Linguistic Invariants

When generating or editing Russian lessons, exercises, or AI prompts, **every AI agent must enforce these 5 rules**:

1. **Living Russian (Живая речь) Over Textbook Russian:**
   - Never teach stiff, unnatural textbook translations when native Russians use a natural chunk.
   - *Examples:* Teach `Я бу́ду капучи́но` / `Мне, пожа́луйста…` for ordering (not just `Я хочу…`); teach `Норма́льно` for answering `Как дела́?`; teach `У тебя́ есть Telegram?` for exchanging contacts.
2. **Mandatory Stress Marks (Ударение):**
   - All multi-syllable Russian words presented to learners **must** include an acute accent (`\u0301`) on the stressed vowel (e.g., `Я хочу́ говори́ть по-ру́сски`), except single-syllable words and words with `ё` (which is always stressed).
   - The UI component `<HighlightedRu />` in `src/app/lesson/[id]/page.tsx` parses `\u0301` to visually highlight stressed vowels in amber.
3. **Authentic Moscow Pronunciation Transliteration:**
   - Transliteration must reflect **actual spoken Moscow phonetics**, not letter-by-letter spelling:
     - Unstressed `о` → `a` (`хорошо́` → `haraşó`)
     - Unstressed `е/я` → `i` (`меня́` → `minyá`, `сего́дня` → `sivódnya`)
     - `что` → `şta`, `коне́чно` → `kanyéşna`, `-ого/-его` → `-ava/-iva`
4. **Chunks Before Abstract Grammar Tables:**
   - Introduce grammar through high-frequency functional chunks (`Я хочу́ + inf`, `Мне на́до + inf`, `У меня́ нет вре́мени`) before explaining morphological paradigms.
5. **Alignment with Russian State Standard ТРКИ (TORFL):**
   - **A1 (ТЭУ):** Survival chunks, phonetics, ИК-1..3 intonation.
   - **A2 (ТБУ):** Past/Future, 6 cases via functional triggers, campus/street Russian.
   - **B1 (ТРКИ-1):** Verbal aspect pairs (НСВ/СВ), verbs of motion with prefixes, Russian bureaucracy (МФЦ, Госуслуги, Банк, Поликлиника).
   - **B2 (ТРКИ-2):** Professional/CV Russian, job interviews, participles & gerunds (причастия и деепричастия), formal correspondence.
   - **C1 (ТРКИ-3):** Stylistic registers (научный, официально-деловой, публицистический), precedent cultural texts (прецедентные феномены: Soviet cinema quotes, idioms).
   - **C2 (ТРКИ-4):** Native-level nuance (частицы `же, ведь, мол, дескать, вряд ли`), irony/subtext, literary & philosophical discourse.

---

## 4. Performance & Latency Rules

1. **Preserve the 0ms Fast-Path in `/api/check`:**
   - `src/app/api/check/route.ts` normalizes the user's answer and compares it against the reference answer first. If it matches (ignoring stress marks, case, punctuation, and `ё/е`), it returns `verdict: "correct"` in **0ms** without calling the LLM. Do not remove this fast-path.
2. **Audio Prefetching:**
   - Whenever a new phrase or slide becomes visible, call `prefetchAudio(ruText)` from `src/components/Speak.tsx` so the WAV file is already cached before the user clicks 🔊.
3. **Structured JSON Schemas:**
   - Always pass `responseMimeType: "application/json"` and `responseJsonSchema` via `generateJson()` in `src/lib/ai.ts`.

---

## 5. Prioritized Backlog for Future AI Agents

When the user asks to continue developing or expanding the platform, prioritize these tasks:

- [ ] **Sprint 1 — Pre-baking All Curriculum Lessons:** Run a background script using `getLessonContent(id)` to pre-generate and verify all remaining AI lessons across A1–C2 so every lesson loads in 0ms offline.
- [ ] **Sprint 2 — Placement Test & Adaptive Onboarding (`/placement`):** Build an interactive 10-question adaptive diagnostic test that places the learner at the exact level/unit (A1..C2) and customizes their daily XP goal.
- [ ] **Sprint 3 — ТРКИ Mock Exam Mode (`/exam/[level]`):** Timed certificate simulation covering the 5 official ТРКИ subtests (*Лексика. Грамматика*, *Чтение*, *Аудирование*, *Письмо*, *Говорение*).
- [ ] **Sprint 4 — Real-Time Voice Call Mode (`/coach/live`):** Integrate Gemini Live WebSocket audio streaming for hands-free voice conversations with Sasha and Anya.
- [ ] **Sprint 5 — Multi-User SaaS & Localization:** Migrate Prisma provider to PostgreSQL, add Auth.js/Clerk authentication, and support multiple UI languages (`tr`, `en`, `es`, `ar`, `de`) for global launch.
