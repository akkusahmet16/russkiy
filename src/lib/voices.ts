/**
 * Karakter ve Senaryo Bazlı Çoklu Ses (Multi-Voice Native Audio TTS) Sistemi
 * Her senaryo karakterinin cinsiyeti (kadın/erkek) ile birebir eşleşen
 * doğrulanmış Gemini Native Audio Prebuilt Voice kimliği ve
 * sistem talimatında (systemInstruction) kullanılan duygusal oyunculuk tonu (style) tanımlıdır.
 *
 * Doğrulanmış Kadın Sesleri (Female):
 *   Kore, Zephyr, Callirrhoe, Despina, Aoede, Leda, Erinome,
 *   Sulafat, Achernar, Pulcherrima, Laomedeia, Gacrux, Autonoe, Vindemiatrix
 *
 * Doğrulanmış Erkek Sesleri (Male):
 *   Puck, Orus, Enceladus, Iapetus, Umbriel, Schedar, Charon, Algenib,
 *   Fenrir, Rasalgethi, Achird, Zubenelgenubi, Algieba, Alnilam, Sadachbia, Sadaltager
 */

export interface VoiceProfile {
  voiceName: string; // Gemini prebuiltVoiceConfig.voiceName
  label: string; // Kullanıcıya gösterilen ses/karakter etiketi
  gender: "female" | "male";
  style: string; // Native Audio systemInstruction içinde kullanılan vokal oyunculuk kimliği
  pitch: number; // Web Speech API yedek ses tonu (0.8 - 1.2)
  rate: number; // Web Speech API yedek konuşma hızı
}

/** Senaryoların Her Biri İçin Cinsiyeti Doğrulanmış Özel Karakter Ses Profilleri */
export const SCENARIO_VOICES: Record<string, VoiceProfile> = {
  // ─────────────── KADIN KARAKTERLER (FEMALE VOICES) ───────────────
  free: {
    voiceName: "Kore",
    label: "Koç А́ня (Kadın • Sıcak & Net)",
    gender: "female",
    style: "молодая, тёплая, дружелюбная московская девушка-преподаватель Аня; живой, естественный разговорный тон с мягкой улыбкой в голосе",
    pitch: 1.05,
    rate: 0.95,
  },
  "cafe-order": {
    voiceName: "Zephyr",
    label: "Бари́ста Ка́тя (Kadın • Genç & Enerjik)",
    gender: "female",
    style: "молодая приветливая девушка-бариста Катя в московской кофейне; бодрый, доброжелательный и живой голос",
    pitch: 1.1,
    rate: 1.0,
  },
  metro: {
    voiceName: "Callirrhoe",
    label: "Еле́на Петро́вна (Kadın • Yardımsever & Sakin)",
    gender: "female",
    style: "интеллигентная, спокойная и отзывчивая взрослая москвичка Елена Петровна; мягкий и вежливый тон",
    pitch: 0.98,
    rate: 0.92,
  },
  market: {
    voiceName: "Despina",
    label: "Касси́р Тама́ра (Kadın • Doğal & Sakin)",
    gender: "female",
    style: "обычная русская женщина-кассир Тамара в супермаркете; естественный, будничный, спокойный разговорный голос",
    pitch: 0.95,
    rate: 0.95,
  },
  party: {
    voiceName: "Aoede",
    label: "Ма́ша (Kadın • Neşeli & Canlı)",
    gender: "female",
    style: "очень энергичная, радостная и общительная 20-летняя студентка Маша на домашней вечеринке; живые эмоции и восторг",
    pitch: 1.12,
    rate: 1.02,
  },
  "first-date-park": {
    voiceName: "Leda",
    label: "Али́на (Kadın • Zarif & Romantik)",
    gender: "female",
    style: "22-летняя москвичка Алина на романтическом первом свидании в Парке Горького; нежный, мягкий, тёплый, слегка кокетливый и очень живой женский голос",
    pitch: 1.08,
    rate: 0.94,
  },
  "russian-family-dinner": {
    voiceName: "Sulafat",
    label: "Ната́лья Ива́новна (Kadın • Anaç & Misafirperver)",
    gender: "female",
    style: "очень радушная, заботливая, тёплая русская мама Наталья Ивановна, которая с любовью угощает гостя за семейным столом",
    pitch: 0.96,
    rate: 0.92,
  },
  "flat-rent": {
    voiceName: "Gacrux",
    label: "Гали́на Миха́йловна (Kadın • Olgun Ev Sahibesi)",
    gender: "female",
    style: "взрослая, деловая, но доброжелательная хозяйка московской квартиры Галина Михайловна; уверенный и естественный тон",
    pitch: 0.94,
    rate: 0.94,
  },
  university: {
    voiceName: "Achernar",
    label: "Ири́на Влади́мировна (Kadın • Kibar & Kültürlü)",
    gender: "female",
    style: "культурная, вежливая сотрудница театральной кассы Ирина Владимировна; приятный, мягкий и интеллигентный женский голос",
    pitch: 1.0,
    rate: 0.93,
  },
  "relationship-talk": {
    voiceName: "Pulcherrima",
    label: "Ле́ра (Kadın • Duygusal & İçten)",
    gender: "female",
    style: "любящая девушка Лера в искреннем, немного грустном и эмоциональном разговоре с парнем; живой, чувственный и близкий голос",
    pitch: 1.06,
    rate: 0.92,
  },
  "career-dilemma": {
    voiceName: "Laomedeia",
    label: "Да́ша (Kadın • Zeki & Samimi Dost)",
    gender: "female",
    style: "близкая подруга Даша на вечерней прогулке; умный, тёплый, заинтересованный и абсолютно естественный разговорный тон",
    pitch: 1.02,
    rate: 0.96,
  },
  "couple-moving-in": {
    voiceName: "Autonoe",
    label: "Ксю́ша (Kadın • Sevecen & Canlı Partner)",
    gender: "female",
    style: "любящая, радостная и энергичная девушка Ксюша при переезде в общую квартиру; тёплый, живой, домашний женский голос",
    pitch: 1.07,
    rate: 0.97,
  },
  "job-interview": {
    voiceName: "Erinome",
    label: "О́льга (Kadın • Net & Entelektüel)",
    gender: "female",
    style: "умная, харизматичная подруга Ольга в живом дружеском споре за столом; выразительная, уверенная и естественная интонация",
    pitch: 1.01,
    rate: 0.97,
  },
  "white-nights-piter": {
    voiceName: "Vindemiatrix",
    label: "Со́ня (Kadın • Yumuşak & Şiirsel)",
    gender: "female",
    style: "петербургская девушка-архитектор Соня ночью на набережной Невы; мелодичный, задумчивый, нежный и проникновенный голос",
    pitch: 1.03,
    rate: 0.9,
  },
  "soulmate-confession": {
    voiceName: "Achernar",
    label: "Верони́ка (Kadın • Derin & Samimi)",
    gender: "female",
    style: "очень близкая девушка Вероника в тихом ночном разговоре по душам; интимный, мягкий, искренний полушёпот",
    pitch: 1.0,
    rate: 0.88,
  },
  "family-generations-debate": {
    voiceName: "Gacrux",
    label: "Ба́бушка Ни́на Андре́евна (Kadın • Bilge Büyükanne)",
    gender: "female",
    style: "колоритная, добрая, но острая на язык 70-летняя русская бабушка Нина Андреевна; тёплый, живой, выразительный голос с мудрой иронией",
    pitch: 0.88,
    rate: 0.88,
  },

  // ─────────────── ERKEK KARAKTERLER (MALE VOICES) ───────────────
  "sasha-cafe": {
    voiceName: "Puck",
    label: "Са́ша (Erkek • Enerjik Üniversiteli)",
    gender: "male",
    style: "21-летний московский студент Саша в кафе с лучшим другом; очень живой, бодрый, непринуждённый молодой мужской голос",
    pitch: 1.0,
    rate: 1.0,
  },
  "dorm-roommate": {
    voiceName: "Orus",
    label: "Ди́ма (Erkek • Rahat & Samimi Ev Arkadaşı)",
    gender: "male",
    style: "дружелюбный, открытый молодой парень Дима, новый сосед по квартире; простой, естественный и тёплый мужской голос",
    pitch: 0.92,
    rate: 0.96,
  },
  "dacha-weekend": {
    voiceName: "Sadachbia",
    label: "Кири́лл (Erkek • Neşeli & Canlı Dost)",
    gender: "male",
    style: "весёлый, радушный друг Кирилл на даче у мангала; громкий, радостный, компанейский мужской голос",
    pitch: 0.92,
    rate: 0.98,
  },
  "telegram-late-night": {
    voiceName: "Iapetus",
    label: "Макс (Erkek • Sakin & Sırdaş Dost)",
    gender: "male",
    style: "близкий друг Макс ночью на кухне за чаем; спокойный, понимающий, искренний и тёплый мужской голос",
    pitch: 0.88,
    rate: 0.92,
  },
  "friends-roadtrip": {
    voiceName: "Umbriel",
    label: "Анто́н (Erkek • Rahat Gezgin Müzisyen)",
    gender: "male",
    style: "26-летний музыкант и путешественник Антон в ночном поезде Москва–Петербург; тёплый, мечтательный и дружеский мужской голос",
    pitch: 0.9,
    rate: 0.94,
  },
  "banya-tradition": {
    voiceName: "Schedar",
    label: "И́горь (Erkek • Tok & Babacan Ses)",
    gender: "male",
    style: "добродушный, весёлый русский друг Игорь после парной в бане; глубокий, расслабленный и радушный мужской баритон",
    pitch: 0.84,
    rate: 0.92,
  },
  doctor: {
    voiceName: "Charon",
    label: "До́ктор Серге́й Никола́евич (Erkek • Sakin Hekim)",
    gender: "male",
    style: "опытный, спокойный и внимательный врач-терапевт Сергей Николаевич; уверенный, заботливый мужской голос",
    pitch: 0.86,
    rate: 0.9,
  },
  "bank-registration": {
    voiceName: "Algieba",
    label: "Алексе́й (Erkek • Akıcı & Kurumsal Danışman)",
    gender: "male",
    style: "вежливый, компетентный молодой сотрудник банка Алексей; чёткий, приятный и живой мужской голос",
    pitch: 0.92,
    rate: 0.98,
  },
  "meet-the-parents": {
    voiceName: "Alnilam",
    label: "Ви́ктор Петро́вич (Erkek • Ciddi & Otoriter Baba)",
    gender: "male",
    style: "серьёзный, основательный, уважающий честность глава семьи Виктор Петрович; глубокий, сдержанный и зрелый мужской голос",
    pitch: 0.8,
    rate: 0.9,
  },
  "friend-crisis-support": {
    voiceName: "Enceladus",
    label: "Дени́с (Erkek • Duygusal & İç Döken Dost)",
    gender: "male",
    style: "близкий друг Денис, переживающий тяжёлое расставание; тихий, искренний, грустный и очень человечный мужской голос",
    pitch: 0.88,
    rate: 0.88,
  },
  "irony-and-memes": {
    voiceName: "Achird",
    label: "Тиму́р (Erkek • Esprili & Rahat Moskovalı)",
    gender: "male",
    style: "27-летний харизматичный москвич Тимур в баре с друзьями; живой, ироничный, с юмором и улыбкой мужской голос",
    pitch: 0.94,
    rate: 1.02,
  },
  "academic-defense": {
    voiceName: "Rasalgethi",
    label: "Па́вел (Erkek • Entelektüel Yönetmen)",
    gender: "male",
    style: "интеллигентный молодой кинорежиссёр Павел после кинопоказа; вдумчивый, выразительный и увлечённый мужской голос",
    pitch: 0.87,
    rate: 0.92,
  },
  "moscow-kitchen": {
    voiceName: "Sadaltager",
    label: "Илья́ (Erkek • Derin Yazar & Filozof)",
    gender: "male",
    style: "32-летний петербургский писатель Илья за ночным чаем на кухне; глубокий, неторопливый, мудрый и слегка ироничный мужской голос",
    pitch: 0.83,
    rate: 0.9,
  },
};

/**
 * Derslerdeki kalıplar ve kartlar için 3 kadın + 3 erkek Rus konuşmacı havuzu.
 */
export const LESSON_SPEAKER_POOL: VoiceProfile[] = [
  SCENARIO_VOICES["free"], // Аня (Kadın - Kore)
  SCENARIO_VOICES["sasha-cafe"], // Саша (Erkek - Puck)
  SCENARIO_VOICES["first-date-park"], // Алина (Kadın - Leda)
  SCENARIO_VOICES["dorm-roommate"], // Дима (Erkek - Orus)
  SCENARIO_VOICES["cafe-order"], // Катя (Kadın - Zephyr)
  SCENARIO_VOICES["telegram-late-night"], // Макс (Erkek - Iapetus)
];

/** Metne veya senaryoya göre cinsiyeti doğrulanmış karakter sesini döndürür */
export function resolveVoiceProfile(opts?: { scenarioId?: string; voiceName?: string; text?: string }): VoiceProfile {
  if (opts?.scenarioId && SCENARIO_VOICES[opts.scenarioId]) {
    return SCENARIO_VOICES[opts.scenarioId];
  }
  if (opts?.voiceName) {
    const found = Object.values(SCENARIO_VOICES).find((v) => v.voiceName === opts.voiceName);
    if (found) return found;
  }
  const t = opts?.text ?? "";
  // Metin içinde dişil veya eril geçmiş zaman / sıfat ipucu varsa cinsiyeti eşleştir
  if (/студе́нтка|турча́нка|я рада|я была|я пошла|я сказала|сама́/i.test(t)) {
    return SCENARIO_VOICES["first-date-park"]; // Kadın (Leda)
  }
  if (/студе́нт\b|ту́рок|я рад\b|я был\b|я пошёл|я сказал|дру́жище|брат/i.test(t)) {
    return SCENARIO_VOICES["sasha-cafe"]; // Erkek (Puck)
  }

  // Metnin hash değerine göre havuzdan deterministik olarak konuşmacı seç
  let hash = 0;
  for (let i = 0; i < t.length; i++) hash = (hash * 31 + t.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % LESSON_SPEAKER_POOL.length;
  return LESSON_SPEAKER_POOL[idx];
}
