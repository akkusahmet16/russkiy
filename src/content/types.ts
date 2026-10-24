export type LevelId = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Phrase {
  ru: string; // vurgu işaretli Rusça (ó gibi akut aksan)
  translit: string; // Türkçe harflerle doğal Moskova okunuşu
  tr: string; // Türkçe anlam
  note?: string; // kullanım / kültür / telaffuz notu
  literal?: string; // kelimesi kelimesine mantığı (isteğe bağlı)
}

export type Exercise =
  | {
      id: string;
      type: "translate"; // Türkçe → Rusça çeviri (Kelime blokları + Klavye + AI kontrol)
      prompt: string;
      answer: string; // referans cevap
      hint?: string;
    }
  | {
      id: string;
      type: "respond"; // durum/soru verilir, öğrenci Rusça cevap yazar (AI kontrol eder)
      prompt: string;
      answer: string; // örnek cevap
      hint?: string;
    }
  | {
      id: string;
      type: "choice"; // çoktan seçmeli (yerel kontrol)
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }
  | {
      id: string;
      type: "speak"; // cümleyi sesli söyle (AI telaffuz değerlendirmesi)
      prompt: string;
      answer: string; // söylenecek Rusça metin
      translit?: string;
    };

export interface LessonContent {
  intro: string; // markdown açıklama (etkileşimli kartlara otomatik bölünür)
  phrases: Phrase[];
  exercises: Exercise[];
  tips?: string[]; // "Rus gibi konuş" kültür ve doğallık ipuçları
}

export interface LessonMeta {
  id: string;
  title: string;
  goal: string; // "Bu dersin sonunda ... yapabileceksin"
  topics: string[]; // AI üretimi için içerik ipuçları
  scenarioId?: string; // ders sonrası pratik için koç senaryosu
}

export interface Lesson extends LessonMeta {
  content?: LessonContent; // yoksa AI ilk açılışta üretir
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Level {
  id: LevelId;
  trki?: string; // Resmi Rus Devlet Sertifika karşılığı (ТЭУ, ТБУ, ТРКИ-1..4)
  title: string;
  description: string;
  canDo: string[]; // seviye sonu yetkinlikleri
  units: Unit[];
}

export type ScenarioCategory = "social" | "romance" | "family" | "deep" | "survival" | "work_campus";

export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  minLevel: LevelId;
  category?: ScenarioCategory;
  description: string;
  character: string; // koçun canlandırdığı kişi
  setting: string; // AI için sahne tarifi
  opener: string; // ilk Rusça replik
  openerTr: string;
  goals: string[]; // öğrencinin senaryoda başarması gerekenler
}
