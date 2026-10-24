"use client";

import { useState } from "react";
import { SpeakButton, speak } from "@/components/Speak";
import { PronunciationCheck } from "@/components/Recorder";

// ────────────────── 1. КУРСИВ (EL YAZISI) & SOKAK TABELALARI VERİLERİ ──────────────────

const CURSIVE_TRAPS = [
  {
    print: "Т т",
    cursiveLook: "m",
    word: "ту́т / те́сто",
    translit: "tut / tésta",
    tr: "burada / hamur",
    tip: "Küçük el yazısı 'т' harfi tıpkı Latin 'm' harfi gibi 3 bacaklı yazılır! En büyük Rus el yazısı tuzağıdır.",
  },
  {
    print: "Д д",
    cursiveLook: "g / D",
    word: "да́ча / дом",
    translit: "dáça / dom",
    tr: "kır evi / ev",
    tip: "Küçük el yazısı 'д' harfi alta kuyruk indirir ve tıpkı Latin 'g' harfine benzer.",
  },
  {
    print: "И и / Й й",
    cursiveLook: "u / ŭ",
    word: "и́мя / мой",
    translit: "ímya / moy",
    tr: "isim / benim",
    tip: "Küçük 'и' harfi el yazısında tam olarak Latin 'u' harfi gibi görünür.",
  },
  {
    print: "П п",
    cursiveLook: "n",
    word: "па́па / пи́тер",
    translit: "pápa / píter",
    tr: "baba / Piter",
    tip: "Küçük 'п' harfi el yazısında Latin 'n' harfine dönüşür.",
  },
  {
    print: "Г г",
    cursiveLook: "r",
    word: "го́род / друг",
    translit: "górad / druk",
    tr: "şehir / dost",
    tip: "Küçük 'г' harfi el yazısında kıvrımlı bir Latin 'r' harfi gibidir.",
  },
  {
    print: "Ш ш / Л л / М м",
    cursiveLook: "шлм",
    word: "шинши́лла / лимо́н",
    translit: "şinşílla / limón",
    tr: "çinçilla / limon",
    tip: "«л» ve «м» harfleri sol altta küçük bir kanca ile başlar; «шиншилла» kelimesi el yazısında yan yana 15 dikey çizgi gibi görünür!",
  },
];

const CURSIVE_QUIZ = [
  {
    handwritten: "Привет, как дела?",
    options: ["Приве́т, как дела́? (Selam, nasılsın?)", "По́езд в Пи́тер (Piter treni)", "Принеси́ ча́ю (Çay getir)"],
    correct: 0,
    hint: "İlk kelimedeki 'п' (n gibi) ve 'т' (m gibi) harflerine dikkat et!",
  },
  {
    handwritten: "Жду тебя тут в кафе",
    options: [
      "Иду́ домо́й сейча́с (Şimdi eve gidiyorum)",
      "Жду тебя́ тут в кафе́ (Seni burada kafede bekliyorum)",
      "Где мой телефо́н? (Telefonum nerede?)",
    ],
    correct: 1,
    hint: "«тут» kelimesi el yazısında 'mym' gibi görünür!",
  },
  {
    handwritten: "Купи молоко и хлеб",
    options: [
      "Купи́ молоко́ и хлеб (Süt ve ekmek al)",
      "Откро́й окно́ и дверь (Pencereyi ve kapıyı aç)",
      "Позвони́ ма́ме ве́чером (Akşam annemi ara)",
    ],
    correct: 0,
    hint: "Ev arkadaşının mutfak masasına bıraktığı klasik el yazısı notu.",
  },
  {
    handwritten: "Осторожно, двери закрываются",
    options: [
      "Вы́ход в го́род (Şehre çıkış)",
      "Осторо́жно, две́ри закрыва́ются (Dikkat, kapılar kapanıyor)",
      "Ка́сса рабо́тает (Gişe açık)",
    ],
    correct: 1,
    hint: "Moskova metrosunun en meşhur cümlesi.",
  },
];

// ────────────────── 2. SHADOWING (GÖLGELEME & VURGU STÜDYOSU) VERİLERİ ──────────────────

interface ShadowClip {
  id: string;
  source: string;
  level: string;
  scenarioId: string;
  ru: string;
  syllables: { text: string; stressed?: boolean; reduced?: boolean }[];
  translit: string;
  tr: string;
  cultureNote: string;
}

const SHADOW_CLIPS: ShadowClip[] = [
  {
    id: "brat-sila",
    source: "🎬 Kült Film: «Брат 2» (2000)",
    level: "B1",
    scenarioId: "friends-roadtrip",
    ru: "Вот скажи́ мне, в чём си́ла, брат? Я ду́маю, что си́ла в пра́вде.",
    syllables: [
      { text: "Вот " },
      { text: "ска-", reduced: true },
      { text: "ЖИ́ ", stressed: true },
      { text: "мне, в чём " },
      { text: "СИ́-", stressed: true },
      { text: "ла, брат? Я " },
      { text: "ДУ́-", stressed: true },
      { text: "ма-ю, что " },
      { text: "СИ́-", stressed: true },
      { text: "ла в " },
      { text: "ПРА́В-", stressed: true },
      { text: "де." },
    ],
    translit: "Vot skají mne, v çom síla, brat? Ya dúmayu, şto síla v právde.",
    tr: "Söyle bana, güç neydedir kardeşim? Bence güç hakikattedir.",
    cultureNote:
      "Rus sinema tarihinin en ünlü repliği. Bir Rusla sohbet ederken «Си́ла в пра́вде» dediğinde yüzünde anında kocaman bir gülümseme görürsün.",
  },
  {
    id: "metro-doors",
    source: "🚇 Moskova Metrosu Anonsu",
    level: "A1",
    scenarioId: "metro",
    ru: "Осторо́жно, две́ри закрыва́ются. Сле́дующая ста́нция — Парк культу́ры.",
    syllables: [
      { text: "А-ста-", reduced: true },
      { text: "РО́Ж-", stressed: true },
      { text: "на, ", reduced: true },
      { text: "ДВЕ́-", stressed: true },
      { text: "ри за-кры-" },
      { text: "ВА́-", stressed: true },
      { text: "ют-ся. " },
      { text: "СЛЕ́-", stressed: true },
      { text: "ду-ю-ща-я " },
      { text: "СТА́Н-", stressed: true },
      { text: "ци-я — Парк куль-" },
      { text: "ТУ́-", stressed: true },
      { text: "ры." },
    ],
    translit: "Astarójna, dvéri zakrıváyutsya. Sléduyuşçaya stántsiya — Park kultúrı.",
    tr: "Dikkat, kapılar kapanıyor. Gelecek istasyon: Park Kulturı.",
    cultureNote:
      "«Осторо́жно» kelimesindeki ilk iki 'о' harfi vurgusuz olduğu için tam olarak 'A-sta-ROJ-na' diye okunur!",
  },
  {
    id: "gorky-date",
    source: "🌹 Gorki Parkı'nda Buluşma",
    level: "A2",
    scenarioId: "first-date-park",
    ru: "С тобо́й так легко́ и прия́тно разгова́ривать, бу́дто мы знако́мы сто лет!",
    syllables: [
      { text: "С та-", reduced: true },
      { text: "БО́Й ", stressed: true },
      { text: "так лег-" },
      { text: "КО́ ", stressed: true },
      { text: "и при-" },
      { text: "Я́Т-", stressed: true },
      { text: "на раз-га-", reduced: true },
      { text: "ВА́-", stressed: true },
      { text: "ри-вать, " },
      { text: "БУ́Д-", stressed: true },
      { text: "та мы зна-" },
      { text: "КО́-", stressed: true },
      { text: "мы сто лет!" },
    ],
    translit: "S tabóy tak lehkó i priyátna razgavárivat, búdta mı znakómı sto let!",
    tr: "Seninle konuşmak o kadar kolay ve keyifli ki, sanki yüz yıldır tanışıyoruz!",
    cultureNote: "«Легко́» kelimesindeki 'г' harfi istisnai olarak 'х' (h) gibi okunur: [lʲɪxˈko].",
  },
  {
    id: "slang-chill",
    source: "🍻 Günlük Moskova Argosu",
    level: "B2",
    scenarioId: "irony-and-memes",
    ru: "Коро́че, не замора́чивайся! Всё бу́дет пучко́м, прорвёмся!",
    syllables: [
      { text: "Ка-", reduced: true },
      { text: "РО́-", stressed: true },
      { text: "че, не за-ма-", reduced: true },
      { text: "РА́-", stressed: true },
      { text: "чи-вай-ся! Всё " },
      { text: "БУ́-", stressed: true },
      { text: "дет пуч-" },
      { text: "КО́М, ", stressed: true },
      { text: "пра-", reduced: true },
      { text: "РВЁМ-", stressed: true },
      { text: "ся!" },
    ],
    translit: "Karóçe, ne zamaráçivaysya! Vsyo búdet puçkóm, prarvyómsya!",
    tr: "Kısacası, kafanı hiç takma! Her şey süper olacak, üstesinden geleceğiz!",
    cultureNote: "«Прорвёмся!» Rusların zor zamanlarda birbirine moral vermek için en sevdiği kelimedir.",
  },
  {
    id: "kitchen-soul",
    source: "🫖 Gece Yarısı Mutfak Felsefesi",
    level: "C1",
    scenarioId: "moscow-kitchen",
    ru: "Са́мое гла́вное в жи́зни — найти́ свои́х люде́й и успоко́иться.",
    syllables: [
      { text: "СА́-", stressed: true },
      { text: "ма-е ", reduced: true },
      { text: "ГЛА́В-", stressed: true },
      { text: "на-е в ", reduced: true },
      { text: "ЖИ́З-", stressed: true },
      { text: "ни — най-" },
      { text: "ТИ́ ", stressed: true },
      { text: "сва-", reduced: true },
      { text: "И́Х ", stressed: true },
      { text: "лю-" },
      { text: "ДЕ́Й ", stressed: true },
      { text: "и ус-па-", reduced: true },
      { text: "КО́-", stressed: true },
      { text: "ить-ся." },
    ],
    translit: "Sámaye glávnaye v jízni — naytí svaíh lyudéy i uspakóitsya.",
    tr: "Hayattaki en önemli şey, kendi insanlarını (ruhunu anlayanları) bulup huzura ermektir.",
    cultureNote: "Ünlü Rus yönetmen Aleksey Balabanov'a atfedilen, modern Rusya'da mottolaşmış söz.",
  },
];

// ────────────────── 3. УТРЕННИЙ КОФЕ (ÇİFT KONUŞMACILI MİNİ PODCAST) ──────────────────

interface PodcastEpisode {
  id: string;
  level: string;
  title: string;
  desc: string;
  lines: {
    speaker: string;
    scenarioId: string; // Ses profili için
    ru: string;
    translit: string;
    tr: string;
  }[];
  question: {
    prompt: string;
    options: string[];
    correct: number;
  };
}

const PODCASTS: PodcastEpisode[] = [
  {
    id: "ep1-coffee",
    level: "A1–A2",
    title: "Bölüm 1: Moskova'da Yağmurlu Bir Sabah & Kahve",
    desc: "А́ня ve Са́ша üniversite yakınındaki bir kafede karşılaşıyor.",
    lines: [
      {
        speaker: "А́ня",
        scenarioId: "free",
        ru: "Приве́т, Са́ша! Кака́я сего́дня холо́дная пого́да в Москве́, пра́вда?",
        translit: "Privét, Sáşa! Kakáya sevódnya halódnaya pagóda v Maskvé, právda?",
        tr: "Selam Saşa! Bugün Moskova'da ne kadar soğuk bir hava var, değil mi?",
      },
      {
        speaker: "Са́ша",
        scenarioId: "sasha-cafe",
        ru: "О, приве́т, А́ня! Да, на у́лице настоя́щая о́сень. Я ужа́сно замёрз и о́чень хочу́ горя́чий ко́фе.",
        translit: "O, privét, Ánya! Da, na úlitse nastayáşçaya ósen. Ya ujásna zamyórz i óçen haçú garyáçiy kófe.",
        tr: "Oo, selam Anya! Evet, dışarıda gerçek bir sonbahar var. Fena üşüdüm (dondum) ve çok sıcak bir kahve istiyorum.",
      },
      {
        speaker: "А́ня",
        scenarioId: "free",
        ru: "Я то́же! Я уже́ взяла́ себе́ капучи́но с кори́цей и тёплый круасса́н. Сади́сь ря́дом!",
        translit: "Ya tóje! Ya ujé vzyalá sebé kapuçína s karítsey i tyóplıy kruassán. Sadís ryádam!",
        tr: "Ben de! Kendime şimdiden tarçınlı kapuçino ve sıcak kruvasan aldım. Yanıma otur!",
      },
      {
        speaker: "Са́ша",
        scenarioId: "sasha-cafe",
        ru: "С удо́вольствием! Сейча́с возьму́ америка́но без са́хара и приду́.",
        translit: "S udavólstviyem! Seyçás vazmú amerikána bez sáhara i pridú.",
        tr: "Memnuniyetle! Şimdi şekersiz bir Americano alıp geliyorum.",
      },
    ],
    question: {
      prompt: "Са́ша neden kahve içmek istiyor ve hangi kahveyi seçiyor?",
      options: [
        "Hava çok sıcak olduğu için buzlu latte alıyor",
        "Dışarıda çok üşüdüğü (замёрз) için şekersiz Americano alıyor",
        "Tarçınlı çay ve pasta alıyor",
      ],
      correct: 1,
    },
  },
  {
    id: "ep2-weekend-dacha",
    level: "B1–B2",
    title: "Bölüm 2: Hafta Sonu Planı — Daça mı, Piter Treni mi?",
    desc: "Али́на ve Ди́ма cuma akşamı hafta sonunu nasıl değerlendireceklerini tartışıyor.",
    lines: [
      {
        speaker: "Ди́ма",
        scenarioId: "dorm-roommate",
        ru: "Слу́шай, Али́на, у нас впереди́ це́лые выходны́е! Кири́лл зовёт всех к себе́ на да́чу жа́рить шашлыки́.",
        translit: "Slúşay, Alína, u nas fperedí tsélıye vıhadnı́ye! Kiríll zavyót fseh k sebé na dáçu járit şaşlıkí.",
        tr: "Bak Alina, önümüzde koskoca bir hafta sonu var! Kirill herkesi şaşlık pişirmeye kendi daçasına çağırıyor.",
      },
      {
        speaker: "Али́на",
        scenarioId: "first-date-park",
        ru: "Звучи́т зама́нчиво, но обещают дождь на суббо́ту. А что, е́сли вме́сто э́того махну́ть на ночно́м по́езде в Пи́тер?",
        translit: "Zvuçít zamánçiva, no abeşçáyut dojd na subbótu. A şto, yésli vmésta étava mahnút na naçnóm póyezde v Píter?",
        tr: "Kulağa cazip geliyor ama cumartesi için yağmur diyorlar. Peki bunun yerine gece treniyle aniden Piter'e kaçsak nasıl olur?",
      },
      {
        speaker: "Ди́ма",
        scenarioId: "dorm-roommate",
        ru: "Ничего́ себе́ иде́я! Спонта́нные пое́здки — э́то всегда́ лу́чшие воспомина́ния. Посмо́тришь биле́ты?",
        translit: "Niçevó sebé idéya! Spantánnıye payézdki — éta fsegdá lúçşiye vaspaminániya. Pasmótriş bilétı?",
        tr: "Vay canına, ne fikir ama! Spontane yolculuklar her zaman en iyi anılardır. Biletlere bakar mısın?",
      },
      {
        speaker: "Али́на",
        scenarioId: "first-date-park",
        ru: "Уже́ смотрю́! Оста́лось два ме́ста в купе́ на оди́ннадцать ве́чера. Берём, не разду́мывая!",
        translit: "Ujé smatryú! Astálas dva mésta v kupé na adínnadtsat véçera. Beryóm, ne razdúmıvaya!",
        tr: "Şimdiden bakıyorum! Akşam 11 treninde kupede iki yer kalmış. Hiç düşünmeden alıyoruz!",
      },
    ],
    question: {
      prompt: "«Махну́ть в Пи́тер» ifadesi bu diyalogda hangi anlamda kullanılmıştır?",
      options: [
      "Piter'e el sallamak",
      "Aniden, spontane bir kararla Piter'e gitmek / kaçamak yapmak",
      "Piter biletini iptal etmek",
      ],
      correct: 1,
    },
  },
  {
    id: "ep3-white-nights",
    level: "C1–C2",
    title: "Bölüm 3: По душа́м — Rus Ruhunda «Тоска́» ve Досто́евский",
    desc: "Со́ня ve yazar Илья́ gece yarısı Rus edebiyatındaki o tarif edilemez özlem duygusunu konuşuyor.",
    lines: [
      {
        speaker: "Со́ня",
        scenarioId: "white-nights-piter",
        ru: "Илья́, я вчера́ пыта́лась объясни́ть дру́гу из Ту́рции, что тако́е ру́сская «тоска́», и поняла́, что одно́го сло́ва про́сто не хвата́ет.",
        translit: "İlyá, ya fçerá pıtálas abyasnít drúgu iz Túrtsii, şto takóye rússkaya «taská», i panyalá, şto adnavó slóva prósta ne hvatáyet.",
        tr: "İlya, dün Türkiye'den bir arkadaşıma Rus 'toska'sının ne olduğunu anlatmaya çalıştım ve tek bir kelimenin buna yetmediğini fark ettim.",
      },
      {
        speaker: "Илья́",
        scenarioId: "moscow-kitchen",
        ru: "Набо́ков был прав: в «тоске́» переплета́ются и сму́тная печа́ль, и томи́тельное жела́ние чего́-то далёкого, и ностальги́я по тому́, чего́, возмо́жно, никогда́ и не́ было.",
        translit: "Nabókaf bıl praf: v «taské» perepletáyutsya i smútnaya peçál, i tamítelnaye jelániye çevó-ta dalyókava, i nastalgíya pa tamú, çevó, vazmójna, nikagdá i né bıla.",
        tr: "Nabokov haklıydı: 'toska'nın içinde belirsiz bir hüzün, uzak bir şeye duyulan yakıcı arzu ve belki de hiç var olmamış bir şeye duyulan nostalji iç içe geçer.",
      },
      {
        speaker: "Со́ня",
        scenarioId: "white-nights-piter",
        ru: "Заба́вно, что у ту́рок есть удиви́тельно бли́зкое чу́вство — «hüzün», о кото́ром писа́л Орха́н Паму́к. Выхо́дит, на́ши ду́ши во мно́гом созву́чны.",
        translit: "Zabávna, şto u túrak yest udivítelna blízkaye çúfstva — «hüzün», a katóram pisál Orhán Pamúk. Vıhódit, náşi dúşi va mnógam sazvúçnı.",
        tr: "Ne ilginçtir ki Türklerde de Orhan Pamuk'un yazdığı şaşırtıcı derecede yakın bir duygu var: 'hüzün'. Demek oluyor ki ruhlarımız pek çok açıdan aynı telden çalıyor (uyumlu).",
      },
    ],
    question: {
      prompt: "Со́ня, Rusçadaki «тоска́» duygusunu Türk kültüründeki hangi kavramla bağdaştırıyor?",
      options: [
        "Orhan Pamuk'un da anlattığı derin ve melankolik «Hüzün» kavramıyla",
        "Sadece fiziksel yorgunlukla",
        "Yaz tatili heyecanıyla",
      ],
      correct: 0,
    },
  },
];

export default function ImmersionPage() {
  const [tab, setTab] = useState<"cursive" | "shadow" | "podcast">("cursive");

  // Курсив state
  const [customCursive, setCustomCursive] = useState("Привет! Жду тебя тут в кафе. Купи молоко и лимон.");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Shadowing state
  const [clipIdx, setClipIdx] = useState(0);

  // Podcast state
  const [epIdx, setEpIdx] = useState(0);
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const [showTr, setShowTr] = useState(true);
  const [epAnswer, setEpAnswer] = useState<number | null>(null);

  const currentClip = SHADOW_CLIPS[clipIdx];
  const currentEp = PODCASTS[epIdx];

  async function playFullEpisode() {
    for (let i = 0; i < currentEp.lines.length; i++) {
      setPlayingLine(i);
      const ln = currentEp.lines[i];
      await speak(ln.ru, { scenarioId: ln.scenarioId });
    }
    setPlayingLine(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold">
            Gerçek Rusya Kültür & Medya Laboratuvarı
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-1">
            🇷🇺 Gerçek Rusya Stüdyosu (Курси́в • Shadowing • Podcast)
          </h1>
          <p className="text-sm text-white/70 mt-0.5">
            Sokaktaki Rus el yazısını oku, kült filmlerle vurgu taklidi (Shadowing) yap ve çift karakterli radyo
            hikayelerini dinle.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("cursive")}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold transition ${
              tab === "cursive"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                : "bg-white/10 text-white/75 hover:bg-white/15"
            }`}
          >
            ✍️ Rus El Yazısı (Курси́в)
          </button>
          <button
            type="button"
            onClick={() => setTab("shadow")}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold transition ${
              tab === "shadow"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                : "bg-white/10 text-white/75 hover:bg-white/15"
            }`}
          >
            🎬 Shadowing & Vurgu
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("podcast");
              setEpAnswer(null);
            }}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold transition ${
              tab === "podcast"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                : "bg-white/10 text-white/75 hover:bg-white/15"
            }`}
          >
            📻 У́тренний Ко́фе (Podcast)
          </button>
        </div>
      </div>

      {/* ────────────────── SEKME 1: RUS EL YAZISI (КУРСИВ) LABORATUVARI ────────────────── */}
      {tab === "cursive" && (
        <div className="space-y-6">
          {/* Canlı El Yazısı Simülatörü */}
          <div className="card p-6 space-y-4 border-sky-400/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  ✍️ Canlı Rus El Yazısı (Курси́в) Dönüştürücü
                </div>
                <p className="text-xs text-white/65 mt-0.5">
                  Rusya&apos;da kafe menüleri, sokak tabelaları ve el yazısı notlar italik/el yazısı formundadır. Aşağıya
                  istediğin Rusça metni yaz ve harflerin nasıl değiştiğini gör:
                </p>
              </div>
            </div>

            <input
              value={customCursive}
              onChange={(e) => setCustomCursive(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-400"
              placeholder="Rusça bir cümle yaz…"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-black/30 border border-white/10 p-4">
                <div className="text-[11px] uppercase tracking-wider text-white/45 mb-1">
                  1. Standart Kitap/Ekran Harfleri (Печа́тный)
                </div>
                <div className="text-xl md:text-2xl font-semibold text-white">{customCursive}</div>
              </div>
              <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4">
                <div className="text-[11px] uppercase tracking-wider text-amber-300 mb-1">
                  2. Rus El Yazısı & Sokak İtaliği (Курси́в)
                </div>
                <div
                  lang="ru"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                  className="text-2xl md:text-3xl text-amber-100 tracking-wide"
                >
                  {customCursive}
                </div>
              </div>
            </div>
          </div>

          {/* 6 Kritik El Yazısı Tuzağı */}
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold">⚠️ En Çok Şaşırtan 6 Rus El Yazısı Tuzağı</h2>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {CURSIVE_TRAPS.map((t, i) => (
                <div key={i} className="card p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-white/10 px-3 py-1 text-base font-bold text-white">
                      Basılı: {t.print}
                    </span>
                    <span
                      lang="ru"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                      className="rounded-lg bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-xl font-bold text-rose-200"
                    >
                      El yazısı: {t.print} (≈ {t.cursiveLook})
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div
                        lang="ru"
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                        className="text-xl text-amber-200"
                      >
                        {t.word}
                      </div>
                      <div className="text-xs text-sky-300">
                        {t.word} ({t.translit}) — {t.tr}
                      </div>
                    </div>
                    <SpeakButton text={t.word} size="sm" />
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* El Yazısı Okuma Testi */}
          <div className="card p-6 space-y-4">
            <h2 className="font-display text-lg font-bold">🕵️‍♂️ El Yazısı Notları Çözebilecek misin?</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {CURSIVE_QUIZ.map((q, qIdx) => {
                const picked = quizAnswers[qIdx];
                return (
                  <div key={qIdx} className="rounded-xl bg-black/30 border border-white/10 p-4 space-y-3">
                    <div
                      lang="ru"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                      className="text-2xl text-amber-200 border-b border-white/10 pb-2"
                    >
                      «{q.handwritten}»
                    </div>
                    <div className="text-[11px] text-white/50">💡 {q.hint}</div>
                    <div className="grid gap-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isPicked = picked === oIdx;
                        const isCorrect = oIdx === q.correct;
                        let cls = "border-white/10 bg-white/5 hover:bg-white/10 text-white/80";
                        if (picked !== undefined) {
                          if (isCorrect) cls = "border-emerald-400/50 bg-emerald-500/20 text-emerald-100";
                          else if (isPicked) cls = "border-rose-400/50 bg-rose-500/20 text-rose-100";
                        }
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              setQuizAnswers((a) => ({ ...a, [qIdx]: oIdx }));
                              if (isCorrect) speak(q.handwritten);
                            }}
                            className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${cls}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SEKME 2: SHADOWING & VURGU STÜDYOSU ────────────────── */}
      {tab === "shadow" && currentClip && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {SHADOW_CLIPS.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setClipIdx(idx)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  idx === clipIdx
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                {c.source} ({c.level})
              </button>
            ))}
          </div>

          <div className="card p-6 md:p-8 space-y-6 border-sky-400/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="rounded-full bg-sky-500/20 border border-sky-400/30 px-3 py-1 text-xs font-bold text-sky-200">
                {currentClip.source} • Seviye {currentClip.level}
              </span>
              <SpeakButton text={currentClip.ru} withSlow scenarioId={currentClip.scenarioId} showSpeakerBadge />
            </div>

            {/* Hece & Vurgu Haritası */}
            <div className="space-y-3 text-center py-3">
              <div className="text-xs text-white/55">
                <span className="text-amber-300 font-bold">Sarı BÜYÜK Heceler</span> = Güçlü Vurgu (Ударе́ние) •{" "}
                <span className="text-sky-300 font-semibold">Mavi Heceler</span> = Vurgusuz Ses Değişimi (о → а)
              </div>

              <div className="font-display text-2xl md:text-3xl font-bold leading-relaxed">
                {currentClip.syllables.map((s, i) => (
                  <span
                    key={i}
                    className={
                      s.stressed
                        ? "text-amber-300 underline decoration-amber-400 decoration-2 underline-offset-4"
                        : s.reduced
                          ? "text-sky-300"
                          : "text-white"
                    }
                  >
                    {s.text}
                  </span>
                ))}
              </div>

              <div className="text-base md:text-lg text-sky-200 font-medium">🗣️ {currentClip.translit}</div>
              <div className="text-lg md:text-xl font-semibold text-emerald-200">🇹🇷 {currentClip.tr}</div>
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4 text-xs md:text-sm text-amber-100">
              🎬 <b>Kültürel & Fonetik İpucu:</b> {currentClip.cultureNote}
            </div>

            {/* Canlı Shadowing (Karakteri Taklit Et) */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-300">
                🎙️ Gölgeleme (Shadowing) Antrenmanı — Önce Dinle, Sonra Aynı Vurguyla Tekrarla:
              </div>
              <PronunciationCheck target={currentClip.ru} />
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SEKME 3: УТРЕННИЙ КОФЕ (ÇİFT KARAKTERLİ MİNİ PODCAST) ────────────────── */}
      {tab === "podcast" && currentEp && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {PODCASTS.map((ep, idx) => (
              <button
                key={ep.id}
                type="button"
                onClick={() => {
                  setEpIdx(idx);
                  setPlayingLine(null);
                  setEpAnswer(null);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  idx === epIdx
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                📻 {ep.title} ({ep.level})
              </button>
            ))}
          </div>

          <div className="card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-sky-300 font-bold">Seviye {currentEp.level} • Çift Konuşmacılı Diyalog</div>
                <h2 className="font-display text-xl font-bold mt-0.5">{currentEp.title}</h2>
                <p className="text-xs text-white/65 mt-0.5">{currentEp.desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTr((v) => !v)}
                  className="btn-ghost text-xs"
                >
                  {showTr ? "🙈 Türkçeleri Gizle" : "👀 Türkçeleri Göster"}
                </button>
                <button
                  type="button"
                  onClick={playFullEpisode}
                  disabled={playingLine !== null}
                  className="btn-primary text-xs"
                >
                  {playingLine !== null ? "🔊 Radyo Çalıyor…" : "▶️ Tüm Bölümü Sırayla Dinle"}
                </button>
              </div>
            </div>

            {/* Diyalog Satırları */}
            <div className="space-y-3">
              {currentEp.lines.map((ln, idx) => {
                const active = playingLine === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 transition ${
                      active
                        ? "border-sky-400 bg-sky-500/15 shadow-lg shadow-sky-500/10"
                        : "border-white/10 bg-black/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-rose-300">{ln.speaker}:</span>
                        <div className="text-base md:text-lg font-semibold text-white">{ln.ru}</div>
                        <div className="text-xs text-sky-300">{ln.translit}</div>
                        {showTr && <div className="text-xs text-white/65 pt-0.5">🇹🇷 {ln.tr}</div>}
                      </div>
                      <SpeakButton text={ln.ru} size="sm" withSlow scenarioId={ln.scenarioId} showSpeakerBadge />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dinleme Anlama Sorusu */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                🎧 Dinlediğini Anlama Kontrolü
              </div>
              <div className="font-semibold text-sm md:text-base">{currentEp.question.prompt}</div>
              <div className="grid gap-2">
                {currentEp.question.options.map((opt, idx) => {
                  let cls = "border-white/10 bg-black/30 hover:border-white/30";
                  if (epAnswer !== null) {
                    if (idx === currentEp.question.correct)
                      cls = "border-emerald-400 bg-emerald-500/20 text-emerald-100";
                    else if (idx === epAnswer) cls = "border-rose-400 bg-rose-500/20 text-rose-100";
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEpAnswer(idx)}
                      className={`rounded-xl border p-3 text-left text-xs md:text-sm font-medium transition ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
