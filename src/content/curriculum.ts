import type { Level, Lesson, LevelId, Unit } from "./types";

/**
 * TAM KAPSAMLI RUSÇA MÜFREDATI (A1 → C2)
 * Herhangi bir dar kalıba (sadece iş/okul/CV) sıkışmadan; günlük hayattan samimi arkadaşlığa,
 * aşktan aile sofrasına, sokak mizahından edebiyata kadar Rusçayı her yönüyle öğreten evrensel sistem.
 */
export const CURRICULUM: Level[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // A1 — TEMEL RUSÇA & GÜNLÜK İLETİŞİM (5 Ünite, 23 Ders)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "A1",
    trki: "A1 • Temel Başlangıç",
    title: "Temel İskelet & Günlük İletişim",
    description:
      "Joker kalıplarla ilk günden cümle kurmaya başla; tanış, aileni ve evini anlat, şehirde, kafede ve alışverişte rahatça konuş.",
    canDo: [
      "Fiil çekimi ezberlemeden joker kalıplarla yüzlerce doğal cümle kurabilirsin",
      "Kendini, aileni, hobilerini ve yaşadığın yeri anlatabilirsin",
      "Kafe, restoran, market ve şehir içi ulaşımda tüm işlerini halledebilirsin",
      "Şimdiki zamanda günlük rutinini ve neler yaptığını konuşabilirsin",
    ],
    units: [
      {
        id: "a1-u1",
        title: "Joker Kalıplar: Çekimsiz Hızlı Başlangıç",
        description: "Arkasına yalın fiil (-ть) eklenen 5 süper kalıpla ilk günden konuşmaya başla.",
        lessons: [
          {
            id: "a1-u1-l1",
            title: "Я хочу́ — İstiyorum",
            goal: "İsteklerini söyleyebilecek, birine bir şey isteyip istemediğini sorabileceksin.",
            topics: ["хотеть kalıbı", "не ile olumsuzluk", "tonlamayla soru"],
            scenarioId: "cafe-order",
            content: {
              intro: `## Joker Kalıp Sırrı: Çekimsiz Konuşma

Rusçada normalde her fiil şahsa göre değişir. **Ama** cümlenin başına bir **Joker Kalıp** koyduğunda, arkasından gelen fiil **hiç değişmez** — sözlükteki yalın (**-ть**) hâliyle olduğu gibi kalır!

İlk altın kalıbımız: **Я хочу́** (*Ya haçú*) = **İstiyorum**

| Joker Kalıp | + Yalın Fiil / İsim | Doğal Rusça Cümle |
|---|---|---|
| **Я хочу́** | спать *(uyumak)* | **Я хочу́ спать.** *(Uykum var / Uyumak istiyorum.)* |
| **Я хочу́** | ко́фе *(kahve)* | **Я хочу́ ко́фе.** *(Kahve istiyorum.)* |

## Olumsuz Yapmak: Sadece **не**

Kalıbın hemen önüne **не** (*ni*) koyman yeterli:
- **Я хочу́** *(İstiyorum)* → **Я не хочу́** (*Ya ni haçú* — *İstemiyorum*)

## Soru Sormak: Ek Yok, Ses Tonu Var

Rusçada "mı/mi" soru eki yoktur! Düz cümleyi söylerken asıl sorduğun kelimede sesini **yükseltirsen** soru olur:
- **Ты хо́чешь чай.** *(Çay istiyorsun.)*
- **Ты хо́чешь чай?** ↗ *(Çay ister misin?)*

> 💡 **Moskova Telaffuz Kuralı (Аканье):** Kelimedeki vurgu işareti (**́**) çok önemlidir. Vurgusuz **о** harfleri her zaman **"a"** gibi okunur: *хочу́* → **haçú**.`,
              phrases: [
                { ru: "Я хочу́…", translit: "Ya haçú…", tr: "…istiyorum", note: "Arkasına doğrudan yalın fiil (-ть) veya isim gelir." },
                { ru: "Я не хочу́.", translit: "Ya ni haçú.", tr: "İstemiyorum." },
                { ru: "Ты хо́чешь…?", translit: "Tı hóçeş…?", tr: "…ister misin?", note: "Samimi ortamda. Ses tonu 'хочешь' üzerinde yükselir." },
                { ru: "Я хочу́ есть.", translit: "Ya haçú yest'.", tr: "Acıktım. (Yemek yemek istiyorum.)", note: "Ruslar 'açım' yerine bu kalıbı kullanır." },
                { ru: "Я хочу́ пить.", translit: "Ya haçú pit'.", tr: "Susadım. (Su/bir şey içmek istiyorum.)" },
                { ru: "Я хочу́ спать.", translit: "Ya haçú spat'.", tr: "Uykum var. (Uyumak istiyorum.)" },
                { ru: "Я хочу́ ко́фе.", translit: "Ya haçú kófe.", tr: "Kahve istiyorum." },
                { ru: "Ты хо́чешь чай?", translit: "Tı hóçeş çay?", tr: "Çay ister misin?" },
                { ru: "Я хочу́ говори́ть по-ру́сски.", translit: "Ya haçú gavarít' pa-rúski.", tr: "Rusça konuşmak istiyorum." },
                { ru: "Да, коне́чно! / Нет, спаси́бо.", translit: "Da, kanyéşna! / Nyet, spasíba.", tr: "Evet, tabii! / Hayır, teşekkürler." },
              ],
              exercises: [
                { id: "e1", type: "choice", prompt: "\"Uykum var\" Rusçada doğal olarak nasıl söylenir?", options: ["Я хочу́ есть.", "Я хочу́ спать.", "Я хочу́ пить."], correctIndex: 1, explanation: "спать = uyumak. Ruslar 'uykum var' demek için 'Я хочу́ спать' der." },
                { id: "e2", type: "translate", prompt: "Susadım.", answer: "Я хочу пить.", hint: "пить = içmek" },
                { id: "e3", type: "translate", prompt: "Kahve istemiyorum.", answer: "Я не хочу кофе.", hint: "не kalıbın önüne gelir" },
                { id: "e4", type: "respond", prompt: "Arkadaşın soruyor: «Ты хо́чешь чай?» — Hayır de ve kahve istediğini söyle.", answer: "Нет, я хочу кофе." },
                { id: "e5", type: "translate", prompt: "Rusça konuşmak istiyorum.", answer: "Я хочу говорить по-русски." },
                { id: "e6", type: "speak", prompt: "Sesli söyle:", answer: "Я хочу́ говори́ть по-ру́сски.", translit: "Ya haçú gavarít' pa-rúski." },
              ],
              tips: [
                "Ruslar tek başına kuru bir «Да» veya «Нет» yerine «Да, дава́й!» (Evet, hadi!) veya «Нет, спаси́бо» (Hayır, teşekkürler) demeyi tercih eder.",
                "«Коне́чно» (Tabii) kelimesi yazıldığı gibi 'koneçno' değil, her zaman 'kanyéşna' diye okunur.",
              ],
            },
          },
          {
            id: "a1-u1-l2",
            title: "Мне на́до & Я могу́ — Lazım / Yapabilirim",
            goal: "İhtiyaçlarını, yapabildiklerini ve müsaitlik durumunu doğal biçimde ifade edebileceksin.",
            topics: ["мне надо", "я могу / не могу", "ты можешь?"],
            scenarioId: "sasha-cafe",
            content: {
              intro: `## İhtiyaç ve Müsaitlik Jokerleri

Günlük hayatta en sık kullanacağın iki yapı:

1. **Мне на́до…** (*Mne náda*) = **Bana lazım / …mam gerek**
   - Dikkat: «Я на́до» **denmez**! Rusça mantığı *"Bana gerekli"* şeklindedir (**Мне** = bana).
2. **Я могу́…** (*Ya magú*) = **…abilirim / Yapabilirim / Müsaitim**

| Kalıp | + Yalın Fiil | Anlamı |
|---|---|---|
| **Мне на́до** | идти́ | Gitmem lazım. *(Sohbetten kalkarken)* |
| **Мне на́до** | отдохну́ть | Dinlenmem lazım. |
| **Я могу́** | помо́чь | Yardım edebilirim. |
| **Я не могу́** | — | Yapamam / Gelemem / Müsait değilim. |

## Hayat Kurtaran Cümle

Bir Rus çok hızlı konuştuğunda panik yapma, şu cümleyi söyle:
**Мо́жешь повтори́ть ме́дленнее?** (*Mójeş paftarít' myédlinniye?*) — *Daha yavaş tekrar edebilir misin?*`,
              phrases: [
                { ru: "Мне на́до…", translit: "Mne náda…", tr: "…mam lazım / bana gerek", note: "Günlük konuşmada 'ну́жно' yerine 'на́до' çok daha yaygındır." },
                { ru: "Мне не на́до.", translit: "Mne ni náda.", tr: "Gerek yok. / İhtiyacım yok." },
                { ru: "Я могу́…", translit: "Ya magú…", tr: "…abilirim / müsaitim" },
                { ru: "Я не могу́.", translit: "Ya ni magú.", tr: "Yapamam. / Gelemem." },
                { ru: "Ты мо́жешь…?", translit: "Tı mójeş…?", tr: "…abilir misin?" },
                { ru: "Мне на́до рабо́тать.", translit: "Mne náda rabótat'.", tr: "Çalışmam lazım." },
                { ru: "Мне на́до идти́.", translit: "Mne náda ittí.", tr: "Gitmem lazım.", note: "Sohbeti kibarca bitirmenin en doğal yoludur." },
                { ru: "Я могу́ помо́чь.", translit: "Ya magú pamóç.", tr: "Yardım edebilirim." },
                { ru: "Сего́дня я не могу́.", translit: "Sivódnya ya ni magú.", tr: "Bugün olmaz / gelemem.", note: "сего́дня kelimesinde 'г' harfi 'v' okunur!" },
                { ru: "Мо́жешь повтори́ть ме́дленнее?", translit: "Mójeş paftarít' myédlinniye?", tr: "Daha yavaş tekrar edebilir misin?" },
              ],
              exercises: [
                { id: "e1", type: "choice", prompt: "\"Gitmem lazım\" Rusçada nasıl söylenir?", options: ["Я на́до идти́.", "Мне на́до идти́.", "Я могу́ на́до идти́."], correctIndex: 1, explanation: "на́до her zaman 'bana' anlamına gelen «Мне» ile kullanılır." },
                { id: "e2", type: "translate", prompt: "Çalışmam lazım.", answer: "Мне надо работать." },
                { id: "e3", type: "translate", prompt: "Bugün gelemem.", answer: "Сегодня я не могу." },
                { id: "e4", type: "respond", prompt: "Bir Rus çok hızlı konuşuyor. Ondan daha yavaş tekrar etmesini iste.", answer: "Можешь повторить медленнее?" },
                { id: "e5", type: "translate", prompt: "Yardım edebilirim.", answer: "Я могу помочь." },
                { id: "e6", type: "speak", prompt: "Sesli söyle:", answer: "Мо́жешь повтори́ть ме́дленнее?", translit: "Mójeş paftarít' myédlinniye?" },
              ],
              tips: [
                "Bir teklifi reddederken sadece «Нет» demek soğuk algılanabilir; «Сего́дня не могу́, мне на́до…» gibi kısa bir sebep eklemek çok daha samimidir.",
              ],
            },
          },
          {
            id: "a1-u1-l3",
            title: "Мо́жно…? — Rica, İzin, Sipariş",
            goal: "Rica edebilecek, izin isteyebilecek ve kibarlık ifadelerini doğal kullanabileceksin.",
            topics: ["можно", "пожалуйста/спасибо", "извините", "нельзя"],
            scenarioId: "cafe-order",
            content: {
              intro: `## Her Kapıyı Açan Anahtar: **Мо́жно?**

**Мо́жно** (*Mójna*) = "Mümkün mü? / …abilir miyim? / Alabilir miyim?"

İster kafede kahve iste, ister içeri girerken izin iste, ister bir soru sor — hepsinde tek kelime yeterlidir!

| Kalıp | Anlamı |
|---|---|
| **Мо́жно ко́фе?** | Kahve alabilir miyim? |
| **Мо́жно счёт?** | Hesabı alabilir miyim? |
| **Мо́жно спроси́ть?** | Bir şey sorabilir miyim? |
| **Нельзя́!** | Olmaz! / Yasak! *(Мо́жно'nun tam tersi)* |

## Üç Sihirli Nezaket Kelimesi

- **Спаси́бо** (*Spasíba*) — Teşekkürler
- **Пожа́луйста** (*Pajálusta*) — Hem **"Lütfen"** hem **"Rica ederim"**
- **Извини́те** (*Izviníti*) — Afedersiniz *(Birine seslenirken veya özür dilerken)*`,
              phrases: [
                { ru: "Мо́жно?", translit: "Mójna?", tr: "Olur mu? / Girebilir miyim? / Alabilir miyim?" },
                { ru: "Мо́жно ко́фе, пожа́луйста?", translit: "Mójna kófe, pajálusta?", tr: "Bir kahve alabilir miyim, lütfen?" },
                { ru: "Мо́жно спроси́ть?", translit: "Mójna sprasít'?", tr: "Bir şey sorabilir miyim?" },
                { ru: "Мо́жно сюда́?", translit: "Mójna syudá?", tr: "Buraya oturabilir miyim / geçebilir miyim?" },
                { ru: "Мо́жно счёт?", translit: "Mójna şot?", tr: "Hesabı alabilir miyim?", note: "счёт kelimesinde 'сч' birleşimi 'ş' okunur." },
                { ru: "Нельзя́.", translit: "Nil'zyá.", tr: "Olmaz. / Yasak." },
                { ru: "Спаси́бо большо́е!", translit: "Spasíba bal'şóye!", tr: "Çok teşekkürler!" },
                { ru: "Пожа́луйста.", translit: "Pajálusta.", tr: "Lütfen. / Rica ederim." },
                { ru: "Извини́те!", translit: "Izviníti!", tr: "Afedersiniz!" },
                { ru: "Коне́чно, мо́жно!", translit: "Kanyéşna, mójna!", tr: "Tabii ki olur!" },
              ],
              exercises: [
                { id: "e1", type: "choice", prompt: "Garsondan hesabı nasıl istersin?", options: ["Мо́жно счёт?", "Мо́жно сюда́?", "Нельзя́ счёт."], correctIndex: 0 },
                { id: "e2", type: "translate", prompt: "Bir kahve alabilir miyim, lütfen?", answer: "Можно кофе, пожалуйста?" },
                { id: "e3", type: "respond", prompt: "Kafede bir masada boş sandalye var. Yanındaki kişiye kibarca oturup oturamayacağını sor.", answer: "Извините, можно сюда?" },
                { id: "e4", type: "choice", prompt: "Biri sana «Спаси́бо!» dedi. Ne cevap verirsin?", options: ["Пожа́луйста!", "Нельзя́!", "Мо́жно!"], correctIndex: 0, explanation: "Пожа́луйста hem lütfen hem de rica ederim demektir." },
                { id: "e5", type: "translate", prompt: "Afedersiniz, bir şey sorabilir miyim?", answer: "Извините, можно спросить?" },
                { id: "e6", type: "speak", prompt: "Sesli söyle:", answer: "Извини́те, мо́жно счёт?", translit: "Izviníti, mójna şot?" },
              ],
            },
          },
          {
            id: "a1-u1-l4",
            title: "У меня́ есть / нет — Var / Yok",
            goal: "Neye sahip olduğunu ve olmadığını söyleyebilecek; iletişim bilgisi isteyebileceksin.",
            topics: ["у меня есть", "у меня нет", "у тебя есть?"],
            scenarioId: "sasha-cafe",
            content: {
              intro: `## Sahiplik Kalıbı: **У меня́ есть…**

Rusçada İngilizcedeki *I have* gibi bir fiil kullanılmaz; tıpkı Türkçedeki *"Bende … var"* mantığı kullanılır:

| Kalıp | Okunuşu | Anlamı |
|---|---|---|
| **У меня́ есть…** | *U minyá yest'…* | Bende … var / …m var |
| **У тебя́ есть…?** | *U tibyá yest'…?* | Sende … var mı? |
| **У меня́ нет…** | *U minyá nyet…* | Bende … yok / …m yok |

## Hazır Yokluk Blokları (Gramer Düşünmeden!)

Rusçada «нет» kelimesinden sonra ismin son harfi değişir. Kuralını ezberlemek yerine en sık kullanılan 3 hazır bloğu kalıp olarak cebine koy:
- **У меня́ нет вре́мени.** *(Vaktim yok.)*
- **У меня́ нет де́нег.** *(Param yok.)*
- **Нет пробле́м!** *(Sorun yok!)*`,
              phrases: [
                { ru: "У меня́ есть…", translit: "U minyá yest'…", tr: "Bende … var / …m var" },
                { ru: "У меня́ нет…", translit: "U minyá nyet…", tr: "…m yok" },
                { ru: "У тебя́ есть…?", translit: "U tibyá yest'…?", tr: "Sende … var mı?" },
                { ru: "У меня́ есть вопро́с.", translit: "U minyá yest' vaprós.", tr: "Bir sorum var." },
                { ru: "У меня́ есть вре́мя.", translit: "U minyá yest' vrémya.", tr: "Vaktim var." },
                { ru: "У меня́ нет вре́мени.", translit: "U minyá nyet vrémini.", tr: "Vaktim yok." },
                { ru: "Нет пробле́м!", translit: "Nyet prablyém!", tr: "Sorun yok!" },
                { ru: "У тебя́ есть Telegram?", translit: "U tibyá yest' Tilegrám?", tr: "Telegram'ın var mı?", note: "Ruslarla iletişim kurarken en sık kullanılan uygulama Telegram'dır." },
                { ru: "У меня́ нет де́нег.", translit: "U minyá nyet dyénik.", tr: "Param yok." },
                { ru: "У меня́ есть иде́я!", translit: "U minyá yest' idyéya!", tr: "Bir fikrim var!" },
              ],
              exercises: [
                { id: "e1", type: "choice", prompt: "\"Vaktim yok\" nasıl denir?", options: ["У меня́ нет вре́мени.", "У меня́ есть вре́мя.", "Мне на́до вре́мя."], correctIndex: 0 },
                { id: "e2", type: "translate", prompt: "Bir sorum var.", answer: "У меня есть вопрос." },
                { id: "e3", type: "respond", prompt: "Yeni tanıştığın Rus arkadaşınla iletişimde kalmak istiyorsun. Telegram'ı olup olmadığını sor.", answer: "У тебя есть Telegram?" },
                { id: "e4", type: "translate", prompt: "Sorun yok!", answer: "Нет проблем!" },
                { id: "e5", type: "translate", prompt: "Bugün vaktim var.", answer: "Сегодня у меня есть время." },
                { id: "e6", type: "speak", prompt: "Sesli söyle:", answer: "У меня́ нет вре́мени.", translit: "U minyá nyet vrémini." },
              ],
            },
          },
          {
            id: "a1-u1-l5",
            title: "Bağla ve Uzat: и, но, потому́ что, дава́й",
            goal: "İki fikri bağlayıp sebep belirterek ve doğal dolgu kelimeleri kullanarak akıcı cümleler kurabileceksin.",
            topics: ["и/но/потому что/поэтому", "zaman kelimeleri", "ну/короче dolgu kelimeleri", "давай"],
            scenarioId: "sasha-cafe",
            content: {
              intro: `## Tek Kelimeden Akıcı Konuşmaya Geçiş

İki Joker Kalıbı bir bağlaçla birleştirdiğin an Rusçan bir anda **akıcı** duyulmaya başlar:

| Bağlaç | Okunuşu | Anlamı |
|---|---|---|
| **и** | *i* | ve |
| **но** | *no* | ama |
| **потому́ что** | *patamú şta* | çünkü |
| **поэ́тому** | *paétamu* | bu yüzden |

## Sokak Doğallığı: **Ну**, **Коро́че** ve **Дава́й!**

Ruslar düşünürken veya cümleye girerken şu kelimeleri sürekli kullanır:
- **Ну…** (*Nu*) — *"Şey… / Yani…"* (Cümleye başlarken düşünme süresi kazandırır)
- **Коро́че…** (*Karóçe*) — *"Kısacası / Uzun lafın kısası…"*
- **Дава́й!** (*Daváy!*) — *"Hadi! / Olur, yapalım! / Görüşürüz!"*`,
              phrases: [
                { ru: "и / но", translit: "i / no", tr: "ve / ama" },
                { ru: "потому́ что", translit: "patamú şta", tr: "çünkü", note: "что kelimesi her zaman 'şta' okunur." },
                { ru: "поэ́тому", translit: "paétamu", tr: "bu yüzden" },
                { ru: "сейча́с / сего́дня / за́втра", translit: "siyçás / sivódnya / záftra", tr: "şimdi / bugün / yarın" },
                { ru: "Ну…", translit: "Nu…", tr: "Şey… / Yani…" },
                { ru: "Коро́че…", translit: "Karóçe…", tr: "Kısacası…" },
                { ru: "Дава́й!", translit: "Daváy!", tr: "Hadi! / Olur, yapalım!" },
                { ru: "Я хочу́ спать, но мне на́до рабо́тать.", translit: "Ya haçú spat', no mne náda rabótat'.", tr: "Uyumak istiyorum ama çalışmam lazım." },
                { ru: "Я не могу́, потому́ что у меня́ нет вре́мени.", translit: "Ya ni magú, patamú şta u minyá nyet vrémini.", tr: "Yapamam çünkü vaktim yok." },
                { ru: "Пойдём в кафе́ за́втра?", translit: "Paydyóm f kafé záftra?", tr: "Yarın kafeye gidelim mi?" },
              ],
              exercises: [
                { id: "e1", type: "translate", prompt: "Uyumak istiyorum ama çalışmam lazım.", answer: "Я хочу спать, но мне надо работать." },
                { id: "e2", type: "translate", prompt: "Gelemem çünkü vaktim yok.", answer: "Я не могу, потому что у меня нет времени." },
                { id: "e3", type: "respond", prompt: "Saşa: «Пойдём в кафе́ за́втра?» (Yarın kafeye gidelim mi?) — Kabul et ve yarın vaktin olduğunu söyle.", answer: "Давай! Завтра у меня есть время." },
                { id: "e4", type: "choice", prompt: "«потому́ что» ne demek?", options: ["bu yüzden", "çünkü", "ama"], correctIndex: 1 },
                { id: "e5", type: "translate", prompt: "Şey, bugün dinlenmek istiyorum.", answer: "Ну, сегодня я хочу отдыхать.", hint: "отдыха́ть = dinlenmek" },
                { id: "e6", type: "speak", prompt: "Sesli söyle:", answer: "Ну, я хочу́, но сего́дня я не могу́.", translit: "Nu, ya haçú, no sivódnya ya ni magú." },
              ],
              tips: ["Telefonu kapatırken veya arkadaşından ayrılırken «Дава́й, пока́!» demek en doğal Rusça vedalaşmadır."],
            },
          },
        ],
      },
      {
        id: "a1-u2",
        title: "Tanışma, İnsanlar ve Doğal Tepkiler",
        description: "Selamlaş, kendini tanıt, hobilerini anlat ve bir Rus gibi doğal tepkiler ver.",
        lessons: [
          {
            id: "a1-u2-l1",
            title: "Приве́т! Selamlaşma ve Tanışma",
            goal: "Resmi ve samimi selamlaşabilecek, kendini tanıtıp karşındakinin adını sorabileceksin.",
            topics: ["привет/здравствуйте", "меня зовут", "как дела", "ты/вы farkı"],
            scenarioId: "party",
            content: {
              intro: `## Samimi (**ты**) mi, Resmi (**Вы**) mi?

Rusçada Türkçedeki gibi "sen" ve "siz" ayrımı çok nettir:
- **ты** (*tı*) — yaşıtların, arkadaşların, samimi ortamlar
- **Вы** (*vı*) — tanımadığın yetişkinler, yaşça büyükler, resmi ortamlar

| Durum | Samimi (Arkadaş) | Resmi (Saygılı) |
|---|---|---|
| Merhaba | **Приве́т!** *(Privyét)* | **Здра́вствуйте!** *(Zdrástvuyti)* |
| Adın ne? | **Как тебя́ зову́т?** | **Как Вас зову́т?** |
| Görüşürüz | **Пока́!** *(Paká)* | **До свида́ния!** *(Da svidániya)* |

## Adını Söyleme Kalıbı

**Меня́ зову́т…** (*Minyá zavút…*) — *"Benim adım…"* (Kelimesi kelimesine: *"Beni … diye çağırırlar"*).`,
              phrases: [
                { ru: "Приве́т!", translit: "Privyét!", tr: "Selam!" },
                { ru: "Здра́вствуйте!", translit: "Zdrástvuyti!", tr: "Merhaba! (resmi)", note: "İlk 'в' harfi okunmaz." },
                { ru: "Как тебя́ зову́т?", translit: "Kak tibyá zavút?", tr: "Adın ne?" },
                { ru: "Меня́ зову́т…", translit: "Minyá zavút…", tr: "Benim adım…" },
                { ru: "О́чень прия́тно!", translit: "Óçin' priyátna!", tr: "Tanıştığımıza memnun oldum!" },
                { ru: "Как дела́?", translit: "Kak dilá?", tr: "Nasılsın? / Ne var ne yok?" },
                { ru: "Хорошо́, а у тебя́?", translit: "Haraşó, a u tibyá?", tr: "İyi, ya sende?" },
                { ru: "Норма́льно.", translit: "Narmál'na.", tr: "İdare eder / Fena değil.", note: "Rusların 'Как дела?' sorusuna en sık verdiği gerçekçi cevaptır." },
                { ru: "Пока́!", translit: "Paká!", tr: "Görüşürüz! (samimi)" },
                { ru: "До свида́ния!", translit: "Da svidániya!", tr: "Hoşça kalın! (resmi)" },
              ],
              exercises: [
                { id: "e1", type: "choice", prompt: "Resmi bir ortamda nasıl selam verirsin?", options: ["Приве́т!", "Здра́вствуйте!", "Пока́!"], correctIndex: 1 },
                { id: "e2", type: "translate", prompt: "Adın ne?", answer: "Как тебя зовут?" },
                { id: "e3", type: "respond", prompt: "Yeni arkadaşın: «Приве́т! Как дела́?» — İdare eder de ve ona da nasıl olduğunu sor.", answer: "Нормально, а у тебя?" },
                { id: "e4", type: "translate", prompt: "Memnun oldum!", answer: "Очень приятно!" },
                { id: "e5", type: "choice", prompt: "Arkadaşın giderken «Пока́!» dedi. En doğal cevap?", options: ["Здра́вствуйте!", "Пока́!", "О́чень прия́тно!"], correctIndex: 1 },
                { id: "e6", type: "speak", prompt: "Sesli söyle:", answer: "Приве́т! Как дела́? О́чень прия́тно!", translit: "Privyét! Kak dilá? Óçin' priyátna!" },
              ],
            },
          },
          {
            id: "a1-u2-l2",
            title: "Отку́да ты? Nerelisin, Nerede Yaşıyorsun?",
            goal: "Nereli olduğunu, nerede yaşadığını, hangi dilleri konuştuğunu anlatabilecek ve sorabileceksin.",
            topics: ["откуда ты", "я из Турции", "где ты живёшь", "мне нравится"],
            scenarioId: "party",
            content: {
              intro: `## Tanışmanın 3 Temel Sorusu

Bir Rusla tanıştığında ilk 2 dakika içinde şu 3 soru mutlaka gelir:

1. **Отку́да ты?** (*Atkúda tı?*) — Nerelisin? → **Я из Ту́рции.** *(Türkiye'denim.)*
2. **Где ты живёшь?** (*Gdye tı jivyóş?*) — Nerede yaşıyorsun? → **Я живу́ в Стамбу́ле / в Москве́.**
3. **Чем ты занима́ешься?** (*Çem tı zanimáyeşsya?*) — Neler yapıyorsun / Ne işle meşgulsün?

## Beğeni Kalıbı: **Мне нра́вится…**

Bir şehri, yemeği, müziği veya ortamı beğendiğini söylemek için:
**Мне нра́вится Москва́.** (*Mne nrávitsa Maskvá*) — *Moskova hoşuma gidiyor / Moskova'yı seviyorum.*`,
              phrases: [
                { ru: "Отку́да ты?", translit: "Atkúda tı?", tr: "Nerelisin?" },
                { ru: "Я из Ту́рции.", translit: "Ya iz Túrtsii.", tr: "Türkiye'denim." },
                { ru: "Где ты живёшь?", translit: "Gdye tı jivyóş?", tr: "Nerede yaşıyorsun?" },
                { ru: "Я живу́ в Стамбу́ле.", translit: "Ya jivú f Stambúli.", tr: "İstanbul'da yaşıyorum." },
                { ru: "Я учу́ ру́сский язы́к.", translit: "Ya uçú rúskiy yazık.", tr: "Rusça öğreniyorum." },
                { ru: "Я немно́го говорю́ по-ру́сски.", translit: "Ya nimnóga gavaryú pa-rúski.", tr: "Biraz Rusça konuşuyorum." },
                { ru: "Чем ты занима́ешься?", translit: "Çem tı zanimáyeşsya?", tr: "Ne işle meşgulsün / Ne yapıyorsun?" },
                { ru: "Мне о́чень нра́вится ру́сская культу́ра.", translit: "Mne óçin' nrávitsa rúskaya kul'túra.", tr: "Rus kültürü çok hoşuma gidiyor." },
                { ru: "А ты?", translit: "A tı?", tr: "Peki ya sen?" },
              ],
              exercises: [
                { id: "e1", type: "respond", prompt: "Yeni tanıştığın biri soruyor: «Отку́да ты?»", answer: "Я из Турции. А ты?" },
                { id: "e2", type: "translate", prompt: "Biraz Rusça konuşuyorum.", answer: "Я немного говорю по-русски." },
                { id: "e3", type: "choice", prompt: "«Где ты живёшь?» ne demek?", options: ["Nerelisin?", "Nerede yaşıyorsun?", "Ne yapıyorsun?"], correctIndex: 1 },
                { id: "e4", type: "translate", prompt: "Rusça öğreniyorum.", answer: "Я учу русский язык." },
                { id: "e5", type: "speak", prompt: "Sesli söyle:", answer: "Я из Ту́рции. Я немно́го говорю́ по-ру́сски.", translit: "Ya iz Túrtsii. Ya nimnóga gavaryú pa-rúski." },
              ],
            },
          },
          {
            id: "a1-u2-l3",
            title: "Doğal Tepkiler: Кру́то! Да ла́дно! Серьёзно?",
            goal: "Sohbette robot gibi durmak yerine bir Rus gibi canlı tepkiler verebileceksin.",
            topics: ["круто", "да ладно", "понятно", "серьёзно?", "класс", "ничего себе"],
            scenarioId: "party",
            content: {
              intro: `## Sohbeti Canlandıran Tepki Kelimeleri

Akıcı görünmenin sırrı sadece uzun cümle kurmak değil, karşı taraf konuşurken **doğal Rusça tepkiler** vermektir!

| Rusça Tepki | Okunuşu | Ne Zaman Kullanılır? |
|---|---|---|
| **Кру́то! / Кла́ссно!** | *Krúta! / Klásna!* | "Harika! / Süper! / Çok havalı!" |
| **Да ла́дно?!** | *Da ládna?!* | "Hadi canım?! / Yapma ya?!" *(Şaşkınlık)* |
| **Серьёзно?** | *Siryózna?* | "Ciddi misin?" |
| **Поня́тно / Я́сно.** | *Panyátna / Yásna.* | "Anlaşıldı / Ha, tamam." |
| **Ничего́ себе́!** | *Niçivó sibyé!* | "Vay be! / Yok artık!" |`,
              phrases: [
                { ru: "Кру́то!", translit: "Krúta!", tr: "Süper! / Çok iyi!" },
                { ru: "Кла́ссно!", translit: "Klásna!", tr: "Harika!" },
                { ru: "Да ла́дно?!", translit: "Da ládna?!", tr: "Hadi canım?! / Gerçekten mi?!" },
                { ru: "Серьёзно?", translit: "Siryózna?", tr: "Ciddi misin?" },
                { ru: "Поня́тно.", translit: "Panyátna.", tr: "Anladım / Anlaşıldı." },
                { ru: "Ничего́ себе́!", translit: "Niçivó sibyé!", tr: "Vay canına! / Yok artık!", note: "ничего kelimesinde 'г' harfi 'v' okunur." },
                { ru: "То́чно!", translit: "Tóçna!", tr: "Kesinlikle! / Aynen öyle!" },
                { ru: "Я не зна́ю.", translit: "Ya ni znáyu.", tr: "Bilmiyorum." },
                { ru: "Мо́жет быть.", translit: "Mójıt bıt'.", tr: "Olabilir / Belki." },
                { ru: "Без пробле́м!", translit: "Bis prablyém!", tr: "Hiç sorun değil!" },
              ],
              exercises: [
                { id: "e1", type: "choice", prompt: "Arkadaşın sana inanılmaz bir haber verdi. Şaşkınlıkla nasıl tepki verirsin?", options: ["Да ла́дно?!", "Мо́жет быть.", "Я не зна́ю."], correctIndex: 0 },
                { id: "e2", type: "translate", prompt: "Ciddi misin?", answer: "Серьёзно?" },
                { id: "e3", type: "translate", prompt: "Bilmiyorum, belki.", answer: "Я не знаю, может быть." },
                { id: "e4", type: "respond", prompt: "Saşa: «За́втра конце́рт, у меня́ есть биле́ты!» (Yarın konser var, bende bilet var!) — Coşkulu bir tepki ver!", answer: "Круто!" },
                { id: "e5", type: "translate", prompt: "Kesinlikle!", answer: "Точно!" },
                { id: "e6", type: "speak", prompt: "Sesli söyle:", answer: "Да ла́дно?! Ничего́ себе́!", translit: "Da ládna?! Niçivó sibyé!" },
              ],
            },
          },
          meta("a1-u2-l4", "Sayılar 0–100 ve Yaş Söyleme", "Sayıları kullanıp yaşını söyleyebilecek ve telefon/adres paylaşabileceksin.", ["0-100 sayıları", "мне ... лет/года (hazır blok)", "сколько тебе лет?", "telefon numarası söyleme"], "party"),
          meta("a1-u2-l5", "Hobiler ve Zevkler: Я люблю́…", "Neleri sevdiğini, boş zamanında ne yaptığını anlatıp sorabileceksin.", ["я люблю + fiil/isim", "мне нравится", "музыка/фильмы/спорт/путешествия", "а что ты любишь?", "в свободное время"], "first-date-park"),
        ],
      },
      {
        id: "a1-u3",
        title: "Aile, Ev, Eşyalar ve Hava Durumu",
        description: "Aileni tanıt, evini ve çevrendeki nesneleri sıfatlarla betimle, havadan sudan konuş.",
        lessons: [
          {
            id: "a1-u3-l0",
            title: "Моя́ семья́ — Ailem ve Sevdiklerim",
            goal: "Aile üyelerini, kardeşlerini ve yakınlarını tanıtıp onlar hakkında konuşabileceksin.",
            topics: ["семья", "мама/папа/брат/сестра", "родители", "друг/подруга", "мой/моя/мои"],
            scenarioId: "russian-family-dinner",
            content: {
              intro: `## Ailem ve Yakınlarım (**Моя́ семья́**)

Rusçada "benim" kelimesi arkasından gelen kelimenin cinsiyetine göre 3 şekle girer:
- **мой** (*moy*) — Erkek kelimeler için: **мой па́па** *(babam)*, **мой брат** *(erkek kardeşim)*, **мой друг** *(erkek arkadaşım/dostum)*
- **моя́** (*mayá*) — Kadın kelimeler için: **моя́ ма́ма** *(annem)*, **моя́ сестра́** *(kız kardeşim)*, **моя́ семья́** *(ailem)*
- **мои́** (*maí*) — Çoğul kelimeler için: **мои́ роди́тели** *(anne-babam / ebeveynlerim)*, **мои́ друзья́** *(arkadaşlarım)*

## Büyük / Küçük Kardeş
Ruslar kardeşten bahsederken genelde büyük veya küçük olduğunu belirtir:
- **ста́рший брат / ста́ршая сестра́** *(abi / abla)*
- **мла́дший брат / мла́дшая сестра́** *(küçük erkek / kız kardeş)*`,
              phrases: [
                { ru: "Э́то моя́ семья́.", translit: "Éta mayá sim'yá.", tr: "Bu benim ailem." },
                { ru: "Ма́ма и па́па — мои́ роди́тели.", translit: "Máma i pápa — maí radítili.", tr: "Annem ve babam — benim ebeveynlerim." },
                { ru: "У меня́ есть ста́рший брат.", translit: "U minyá yest' stárşıy brat.", tr: "Bir abim var." },
                { ru: "У меня́ есть мла́дшая сестра́.", translit: "U minyá yest' mlátşaya sistrá.", tr: "Bir küçük kız kardeşim var." },
                { ru: "Мой лу́чший друг / Моя́ лу́чшая подру́га", translit: "Moy lúçşıy druk / Mayá lúçşaya padrúga", tr: "En yakın (erkek / kız) arkadaşım" },
                { ru: "Ба́бушка и де́душка", translit: "Bábuşka i dyéduşka", tr: "Büyükanne (anneanne/babaanne) ve büyükbaba (dede)" },
                { ru: "У нас больша́я и дру́жная семья́.", translit: "U nas bal'şáya i drújnaya sim'yá.", tr: "Büyük ve birbirine bağlı bir ailemiz var." },
                { ru: "Я о́чень люблю́ свою́ семью́.", translit: "Ya óçin' lüblǘ svayú sim'yú.", tr: "Ailemi çok seviyorum." },
              ],
              exercises: [
                { id: "e1", type: "choice", prompt: "\"Annem\" Rusçada nasıl söylenir?", options: ["мой ма́ма", "моя́ ма́ма", "мои́ ма́ма"], correctIndex: 1, explanation: "ма́ма dişil olduğu için моя́ kullanılır." },
                { id: "e2", type: "translate", prompt: "Bu benim ailem.", answer: "Это моя семья." },
                { id: "e3", type: "translate", prompt: "Bir abim var.", answer: "У меня есть старший брат." },
                { id: "e4", type: "respond", prompt: "Наталья Ивановна soruyor: «У тебя́ есть брат и́ли сестра́?» — Kendine göre cevap ver.", answer: "Да, у меня есть брат и сестра." },
                { id: "e5", type: "speak", prompt: "Sesli söyle:", answer: "У нас больша́я и дру́жная семья́.", translit: "U nas bal'şáya i drújnaya sim'yá." },
              ],
            },
          },
          meta("a1-u3-l0b", "Evim, Odalar ve Eşyalar", "Evini, odalarını ve günlük eşyaların nerede olduğunu anlatabileceksin.", ["дом/квартира/комната", "кухня/спальня/окно", "стол/телефон/ключи", "где мои ключи?", "тут/там/здесь"], "flat-rent"),
          meta("a1-u3-l0c", "Sıfatlar ve Renkler: Nasıl Bir Şey?", "İnsanları, şehirleri ve nesneleri temel sıfatlar ve renklerle betimleyebileceksin.", ["большой/маленький", "хороший/плохой", "красивый/новый/старый", "интересный/вкусный", "renkler: белый/чёрный/красный/синий"], "first-date-park"),
          meta("a1-u3-l0d", "Hava Durumu ve Mevsimler", "Havadan sudan sohbet başlatıp mevsimleri anlatabileceksin.", ["какая сегодня погода?", "холодно/тепло/жарко", "идёт дождь/снег", "солнечно", "зима/весна/лето/осень"], "first-date-park"),
        ],
      },
      {
        id: "a1-u4b",
        title: "Şehirde Yaşam: Kafe, Alışveriş ve Ulaşım",
        description: "Kafede sipariş ver, markette alışveriş yap, şehirde yol bul ve seyahat et.",
        lessons: [
          {
            id: "a1-u3-l1",
            title: "Kafede ve Restoranda: Я бу́ду…",
            goal: "Rusların kullandığı doğal 'Я буду' kalıbıyla sipariş verip ödeme yapabileceksin.",
            topics: ["я буду ... (sipariş kalıbı)", "можно меню", "с собой / здесь", "картой / наличными", "сколько стоит"],
            scenarioId: "cafe-order",
            content: {
              intro: `## Ruslar Kafede Nasıl Sipariş Verir?

Ders kitapları «Я хочу́…» öğretir ama gerçek hayatta Ruslar garsona sipariş verirken **«Я бу́ду…»** (*Ben … alacağım*) veya **«Мне, пожа́луйста…»** (*Bana lütfen…*) der!

| Garsonun Sorusu | Anlamı | Senin Cevabın |
|---|---|---|
| **Что Вы бу́дете?** | Ne alırsınız? | **Я бу́ду капучи́но.** *(Kapuçino alacağım.)* |
| **Здесь и́ли с собо́й?** | Burada mı, paket mi? | **С собо́й, пожа́луйста.** *(Paket/Al-götür lütfen.)* |
| **Ка́ртой и́ли нали́чными?** | Kartla mı, nakit mi? | **Ка́ртой.** *(Kartla.)* |`,
              phrases: [
                { ru: "Я бу́ду…", translit: "Ya búdu…", tr: "…alacağım (sipariş verirken)", note: "Sipariş vermenin en doğal Rusça yoludur." },
                { ru: "Мне, пожа́луйста, америка́но.", translit: "Mne, pajálusta, amirikána.", tr: "Bana bir Americano lütfen." },
                { ru: "Здесь и́ли с собо́й?", translit: "Zdyes' íli s sabóy?", tr: "Burada mı yoksa paket (yanınıza) mı?" },
                { ru: "С собо́й, пожа́луйста.", translit: "S sabóy, pajálusta.", tr: "Paket (al-götür) olsun lütfen." },
                { ru: "Ско́лько сто́ит?", translit: "Skól'ka stóit?", tr: "Ne kadar tutuyor / Fiyatı ne?" },
                { ru: "Ка́ртой и́ли нали́чными?", translit: "Kártay íli nalíçnımi?", tr: "Kartla mı nakit mi?" },
                { ru: "Я бу́ду плати́ть ка́ртой.", translit: "Ya búdu platít' kártay.", tr: "Kartla ödeyeceğim." },
                { ru: "Мо́жно меню́?", translit: "Mójna minyú?", tr: "Menüyü alabilir miyim?" },
              ],
              exercises: [
                { id: "e1", type: "choice", prompt: "Barista «Здесь и́ли с собо́й?» diye sordu. Kahveni alıp yürüyeceksen ne dersin?", options: ["С собо́й, пожа́луйста.", "Мо́жно меню́?", "Нали́чными."], correctIndex: 0 },
                { id: "e2", type: "translate", prompt: "Ne kadar tutuyor?", answer: "Сколько стоит?" },
                { id: "e3", type: "respond", prompt: "Barista soruyor: «Здра́вствуйте! Что Вы бу́дете?» — Kapuçino alacağını söyle.", answer: "Я буду капучино, пожалуйста." },
                { id: "e4", type: "translate", prompt: "Kartla ödeyeceğim.", answer: "Я буду платить картой." },
                { id: "e5", type: "speak", prompt: "Sesli söyle:", answer: "Мне, пожа́луйста, ко́фе с собо́й.", translit: "Mne, pajálusta, kófe s sabóy." },
              ],
            },
          },
          meta("a1-u3-l2", "Market, Fiyatlar ve Alışveriş", "Fiyatları anlayıp sorabilecek ve markette/mağazada alışveriş yapabileceksin.", ["100-1000 sayıları", "сколько стоит?", "рубль/рубля/рублей", "пакет нужен?", "дорого/дёшево"], "market"),
          meta("a1-u3-l3", "Şehirde Yön Bulma ve Metro", "Metroda ve sokakta yol sorup tarifi anlayabileceksin.", ["где находится...?", "как дойти/доехать до...?", "направо/налево/прямо", "станция", "далеко/близко"], "metro"),
          meta("a1-u3-l4", "Taksi, Otel ve Yolculuk", "Taksi çağırıp şoförle ve otel resepsiyonuyla iletişim kurabileceksin.", ["мне нужно в/на ...", "остановите здесь", "бронь", "номер в отеле", "во сколько завтрак?"], "metro"),
          meta("a1-u3-l5", "Beklenmedik Durumlar ve Yardım İsteme", "Kaybolduğunda, bir şeyini unuttuğunda veya rahatsızlandığında yardım isteyebileceksin.", ["помогите", "я потерялся", "я забыл...", "мне плохо", "где аптека", "я не понимаю"], "free"),
        ],
      },
      {
        id: "a1-u4",
        title: "Şimdiki Zaman ve Günlük Rutin",
        description: "Joker kalıplardan sonra fiilleri kendin çekimlemeye başlıyorsun — en doğal yoldan.",
        lessons: [
          meta("a1-u4-l1", "Fiil Çekimi 1: -ю / -ешь Grubu", "1. grup fiilleri (работать, делать, знать, понимать, гулять, читать) şimdiki zamanda çekimleyebileceksin.", ["я делаю/ты делаешь/он делает", "знать", "понимать", "гулять", "что ты делаешь?"], "free"),
          meta("a1-u4-l2", "Fiil Çekimi 2: -ю / -ишь Grubu", "2. grup fiilleri (говорить, смотреть, любить, готовить, звонить) çekimleyebileceksin.", ["говорю/говоришь", "смотрю", "люблю", "готовлю", "звонить"], "free"),
          meta("a1-u4-l3", "Saatler ve Günün Bölümleri", "Saati sorup söyleyebilecek, buluşma saati ayarlayabileceksin.", ["который час?", "в два часа", "утром/днём/вечером/ночью", "во сколько?"], "sasha-cafe"),
          meta("a1-u4-l4", "Haftanın Günleri ve Günlük Rutin", "Bir gününü ve alışkanlıklarını baştan sona anlatabileceksin.", ["понедельник...воскресенье", "в понедельник", "встаю/завтракаю/отдыхаю", "обычно/всегда/иногда/никогда"], "telegram-late-night"),
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A2 — AKICI GÜNLÜK SOHBET, DUYGULAR & SOSYAL HAYAT (6 Ünite, 21 Ders)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "A2",
    trki: "A2 • Günlük Sohbet & Sosyal Hayat",
    title: "Sohbet, Duygular, İlişkiler ve Yaşam",
    description:
      "Geçmişi ve geleceği anlat, 6 ismin hâlini tablosuz doğal kalıplarla oturt; arkadaşlık, flört, yemek ve seyahatlerde rahatça konuş.",
    canDo: [
      "Başına gelenleri, anılarını ve gelecek planlarını akıcı anlatabilirsin",
      "6 ismin hâlini gramer tablosu düşünmeden doğal kalıplarla kullanabilirsin",
      "Arkadaş ortamında, buluşmada (свидание) ve Rus aile sofrasında samimi sohbet kurabilirsin",
    ],
    units: [
      unit("a2-u1", "Geçmiş Zaman ve Anılar", "Geçmiş zamanın en kolay hâli: -л / -ла / -ли.", [
        meta("a2-u1-l1", "Geçmiş Zaman: -л, -ла, -ли", "Herhangi bir fiili geçmiş zamanda kullanabileceksin.", ["я делал/делала", "что ты делал вчера?", "вчера/недавно", "был/была/было"], "sasha-cafe"),
        meta("a2-u1-l2", "Hafta Sonumu ve Tatilimi Anlatıyorum", "Hafta sonunu sırayla ve detaylı anlatabileceksin.", ["в выходные", "сначала/потом/в конце", "гулял/смотрел/встречался", "было весело/скучно"], "party"),
        meta("a2-u1-l3", "Был / Была / Были: Hayat Deneyimleri", "Daha önce bulunduğun yerleri ve deneyimlerini anlatabileceksin.", ["я был в ...", "ты когда-нибудь пробовал...?", "ещё не", "уже"], "friends-roadtrip"),
      ]),
      unit("a2-u2", "Gelecek Zaman, Planlar ve Davetler", "Buluşma ayarla, plan yap, davet et ve mesajlaş.", [
        meta("a2-u2-l1", "Бу́ду + Fiil: Gelecek Planları", "Gelecek planlarını ve hedeflerini anlatabileceksin.", ["я буду отдыхать", "завтра/на следующей неделе/летом", "что ты будешь делать?"], "sasha-cafe"),
        meta("a2-u2-l2", "Buluşma Ayarlamak ve Davet Etmek", "Arkadaşınla yer, gün ve saat ayarlayabileceksin.", ["давай встретимся", "ты свободен?", "где встретимся?", "договорились", "опаздываю"], "first-date-park"),
        meta("a2-u2-l3", "Telegram & Günlük Mesajlaşma Rusçası", "Mesajlaşırken Rusların kullandığı doğal kısaltmaları ve ifadeleri kullanabileceksin.", ["ок/норм/спс/пж", "ща", "))) gülme işareti", "голосовое (кружочек)", "скинь мне"], "telegram-late-night"),
      ]),
      unit("a2-u3", "6 İsmin Hâli — Tablosuz, Doğal Kalıplarla", "Zaten kullandığın kalıplardaki ek değişimlerinin mantığını oturt.", [
        meta("a2-u3-l1", "Nerede? в/на + -е (Предложный)", "Bir şeyin/kişinin nerede olduğunu doğru eklerle söyleyebileceksin.", ["в Москве", "в парке", "на улице", "на море", "о чём ты думаешь?"], "metro"),
        meta("a2-u3-l2", "Neyi/Kimi & Nereye? (Винительный)", "Nesne alan ve yön belirten cümlelerde doğru ekleri kullanabileceksin.", ["я хочу воду", "люблю музыку", "иду в парк / на концерт", "kadın isimlerinde -а → -у"], "cafe-order"),
        meta("a2-u3-l3", "Yokluk, Miktar ve Aidiyet (Родительный)", "нет, много, мало, из, без, для kalıplarını doğru kullanabileceksin.", ["нет времени/воды", "много друзей", "чай без сахара", "подарок для тебя"], "market"),
        meta("a2-u3-l4", "Kime? (Дательный) & Kiminle/Neyle? (Творительный)", "Kime bir şey söylediğini ve kiminle/neyle vakit geçirdiğini anlatabileceksin.", ["мне/тебе/ему/ей", "позвонить другу", "кофе с молоком", "мы с тобой"], "sasha-cafe"),
      ]),
      unit("a2-u4", "Arkadaşlık, Flört, Aşk ve Duygular", "İltifat et, hislerini aç, insan karakterlerini anlat.", [
        meta("a2-u4-l1", "Karakter ve İnsanları Tanımlama", "Bir insanın kişiliğini ve dış görünüşünü anlatabileceksin.", ["добрый/умный/весёлый", "честный/открытый", "чувство юмора", "похож на..."], "party"),
        meta("a2-u4-l2", "Flört, İltifat ve Buluşma (Свида́ние)", "Hoşlandığın kişiye doğal iltifatlar edip romantik sohbet kurabileceksin.", ["ты прекрасно выглядишь", "мне с тобой легко", "у тебя красивая улыбка", "пригласить на свидание"], "first-date-park"),
        meta("a2-u4-l3", "Duygular ve Ruh Hâli", "Mutluluk, özlem, heyecan, öfke ve yorgunluğu doğal ifadelerle anlatabileceksin.", ["я рад/рада", "я скучаю по тебе", "мне грустно/весело", "я устал", "переживать"], "telegram-late-night"),
      ]),
      unit("a2-u5", "Yemek Kültürü, Misafirlik ve Tatil", "Rus sofrası, misafirlik adabı, daça ve seyahat.", [
        meta("a2-u5-l1", "Misafirlik ve Rus Sofra Kültürü", "Bir Rus evinde misafirlikte doğal konuşup kadeh kaldırabileceksin.", ["приятного аппетита", "очень вкусно", "передайте, пожалуйста", "тост: за встречу / за дружбу", "к чаю"], "russian-family-dinner"),
        meta("a2-u5-l2", "Doğa, Да́ча ve Şaşlık Hafta Sonu", "Kır evi, piknik ve doğa aktiviteleri hakkında konuşabileceksin.", ["поехать на дачу", "жарить шашлыки", "свежий воздух", "лес/озеро", "отдыхать на природе"], "dacha-weekend"),
        meta("a2-u5-l3", "Seyahat, Uçak, Tren ve Otel", "Yeni bir şehre seyahat ederken tüm süreçleri yönetebileceksin.", ["билет туда и обратно", "чемодан", "вокзал/аэропорт", "экскурсия", "достопримечательности"], "friends-roadtrip"),
      ]),
      unit("a2-u6", "Sağlık, Spor ve Yaşam Tarzı", "Vücut, sağlık, spor ve giyim.", [
        meta("a2-u6-l1", "Nasıl Hissediyorsun? Vücut ve Sağlık", "Rahatsızlıklarını ve sağlık durumunu anlatabileceksin.", ["у меня болит голова/горло", "простудился", "лекарство", "выздоравливай!"], "doctor"),
        meta("a2-u6-l2", "Spor, Alışkanlıklar ve Giyim", "Spor rutinini ve giyim tarzını anlatabileceksin.", ["ходить в зал", "бегать", "держать себя в форме", "одежда: куртка/кроссовки", "тебе идёт!"], "party"),
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // B1 — BAĞIMSIZ KONUŞMACI: HİKÂYELER, FİKİRLER & CANLI RUSÇA (6 Ünite, 18 Ders)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "B1",
    trki: "B1 • Bağımsız Akıcılık",
    title: "Hikâye Anlatımı, Fikirler ve Sokak Rusçası",
    description:
      "Rusçanın kalbi olan fiil görünüşlerini (НСВ/СВ) ve hareket fiillerini oturt; başından geçenleri anlat, tartış, şakalaş ve günlük sorunları çöz.",
    canDo: [
      "Başından geçen bir olayı tüm detayları ve doğru zaman/aspekt nüanslarıyla anlatabilirsin",
      "Herhangi bir konuda fikrini gerekçeleriyle savunup tartışabilirsin",
      "Rusların günlük hayatta kullandığı dolgu kelimelerini, mizahı ve deyimleri anlayıp kullanabilirsin",
    ],
    units: [
      unit("b1-u1", "Fiilin Görünüşü (Вид глагола: НСВ / СВ)", "Rusçanın kalbi: делать / сделать farkını pratikle oturt.", [
        meta("b1-u1-l1", "Süreç mi Sonuç mu? НСВ vs СВ Mantığı", "Tamamlanmış ve süregelen eylemleri doğru fiil çiftiyle anlatabileceksin.", ["делать/сделать", "читать/прочитать", "писать/написать", "süreç vs sonuç"], "free"),
        meta("b1-u1-l2", "Aspektlerle Hikâye ve Anı Anlatma", "Geçmişte yaşadığın bir olayı aspektleri doğru kullanarak anlatabileceksin.", ["когда я шёл, я увидел", "вдруг", "в итоге", "оказалось, что"], "friends-roadtrip"),
        meta("b1-u1-l3", "Gelecekte ve Ricada Aspekt Nüansları", "Gelecek zamanda ve emir/rica cümlelerinde doğru aspekti seçebileceksin.", ["буду делать vs сделаю", "посмотри vs смотри", "не опаздывай vs не опоздай"], "relationship-talk"),
      ]),
      unit("b1-u2", "Hareket Fiilleri (Глаголы движения)", "идти́/ходи́ть, е́хать/е́здить ve ön ekler.", [
        meta("b1-u2-l1", "Идти́ / Ходи́ть, Е́хать / Е́здить", "Tek yönlü ve çok yönlü hareketleri ayırt edebileceksin.", ["идти/ходить", "ехать/ездить", "пешком/на машине", "я иду / я хожу"], "metro"),
        meta("b1-u2-l2", "Ön Ekli Hareket Fiilleri (при-, у-, вы-, за-, пере-, до-)", "Ön ekli hareket fiillerini günlük hayatta kullanabileceksin.", ["прийти/уйти", "выйти/зайти за тобой", "перейти", "доехать"], "sasha-cafe"),
        meta("b1-u2-l3", "Mecazi Hareket İfadeleri", "Hareket fiillerinin deyimsel kullanımlarını konuşmana katabileceksin.", ["время идёт", "тебе идёт эта куртка", "о чём идёт речь?", "найти общий язык"], "party"),
      ]),
      unit("b1-u3", "Fikirler, Tartışma ve Koşul Kipi (бы)", "Katıl, karşı çık, hayal kur ve gerekçelendir.", [
        meta("b1-u3-l1", "Fikrimi Savunuyorum ve Tartışıyorum", "Kibarca fikrini söyleyip gerekçelendirebileceksin.", ["по-моему", "я считаю, что", "мне кажется", "с одной стороны... с другой стороны"], "career-dilemma"),
        meta("b1-u3-l2", "Если бы… (Koşul, Hayaller ve Tavsiye)", "Varsayımları, hayalleri ve tavsiyeleri 'бы' ile kurabileceksin.", ["если бы я знал", "я бы хотел", "на твоём месте я бы...", "жаль, что"], "career-dilemma"),
        meta("b1-u3-l3", "Что́бы… (Amaç ve İstek Cümleleri)", "Bir şeyin olması için ne gerektiğini ve birinden ne beklediğini anlatabileceksin.", ["чтобы + mastar", "я хочу, чтобы ты...", "для того чтобы"], "relationship-talk"),
      ]),
      unit("b1-u4", "Canlı Sokak Dili, Mizah ve Tepkiler", "Kitaplarda yazmayan ama her Rus'un her gün kullandığı ifadeler.", [
        meta("b1-u4-l1", "Doğal Geçişler: ти́па, вообще́, кста́ти, в при́нципе", "Konuşmana doğal geçişler ve dolgu kelimeleri ekleyebileceksin.", ["типа", "вообще", "кстати", "как бы", "в принципе", "честно говоря"], "party"),
        meta("b1-u4-l2", "Günlük Konuşma Deyimleri ve Sitem/Şaka", "Arkadaş ortamında şakalaşıp duygusal tepki verebileceksin.", ["блин", "офигеть", "бесит", "забей!", "не парься", "держать в курсе"], "banya-tradition"),
        meta("b1-u4-l3", "İlişkilerde Yanlış Anlaşılma ve Gönül Alma", "Kırgınlıkları çözüp duygusal konuşma (разговор по душам) yapabileceksin.", ["обижаться", "не хотел тебя обидеть", "давай поговорим", "ты мне дорог/дорога", "помириться"], "relationship-talk"),
      ]),
      unit("b1-u5", "Kültür, Sinema, Müzik ve Medya", "İzlediğin filmi, dinlediğin müziği ve okuduğun kitabı anlat.", [
        meta("b1-u5-l1", "Film, Dizi ve Kitap Anlatma", "Bir filmin/kitabın konusunu ve sende bıraktığı etkiyi anlatabileceksin.", ["сюжет", "главный герой", "стоит посмотреть", "произвести впечатление", "концовка"], "friends-roadtrip"),
        meta("b1-u5-l2", "Rus Müziği, Gelenekler ve Ба́ня Kültürü", "Rus yaşam kültürünün önemli parçaları hakkında sohbet edebileceksin.", ["с лёгким паром!", "русский рок / поп / инди", "традиции", "гостеприимство"], "banya-tradition"),
        meta("b1-u5-l3", "Güncel Olaylar, Teknoloji ve Sosyal Medya", "İnternet, yapay zeka ve modern yaşam hakkında fikir yürütebileceksin.", ["соцсети", "привычка", "влиять на...", "современный мир"], "free"),
      ]),
      unit("b1-u6", "Günlük Yaşamda Sorun Çözme", "Ev, komşuluk, banka ve hizmetler.", [
        meta("b1-u6-l1", "Ev Kiralama, Komşular ve Ev İşleri (Быт)", "Evle ilgili sorunları ve anlaşmaları konuşabileceksin.", ["снимать квартиру", "хозяин/хозяйка", "коммуналка", "сломалось", "договориться"], "flat-rent"),
        meta("b1-u6-l2", "Banka, Teslimat ve Hizmetler", "Banka, kargo ve müşteri hizmetleriyle iletişim kurabileceksin.", ["перевод по СБП", "доставка", "курьер", "возврат", "поддержка"], "bank-registration"),
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // B2 — İLERİ AKICILIK: DERİN İFADE, NÜANS & ZENGİN SÖZDİZİMİ (5 Ünite, 14 Ders)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "B2",
    trki: "B2 • İleri Akıcılık",
    title: "Derin İlişkiler, Zengin Sözdizimi ve Rus Zihniyeti",
    description:
      "Karmaşık duyguları, psikolojiyi ve soyut konuları tartış; sıfat-fiiller (причастия) ve zarf-fiillerle (деепричастия) cümlelerini zenginleştir.",
    canDo: [
      "Derin duygusal, psikolojik ve toplumsal konularda akıcı ve ikna edici konuşabilirsin",
      "Rus aile ortamında, ciddi ilişkilerde ve kriz anlarında doğal empati ve uzlaşma dili kurabilirsin",
      "Filmleri, haberleri, podcastleri ve edebiyat metinlerini zorlanmadan anlayabilirsin",
    ],
    units: [
      unit("b2-u1", "Derin İnsan İlişkileri, Empati ve Psikoloji", "Duygusal zeka, ilişki dinamikleri ve teselli.", [
        meta("b2-u1-l1", "Empati, Teselli ve Duygusal Destek", "Zor bir dönemden geçen dostuna derin ve samimi destek verebileceksin.", ["держись", "я всегда рядом", "всё наладится", "принять ситуацию", "выговориться"], "friend-crisis-support"),
        meta("b2-u1-l2", "Ortak Yaşam, Sınırlar ve Uzlaşma", "İlişkilerde beklentileri, kişisel alanı ve ortak kararları olgunlukla konuşabileceksin.", ["личные границы", "компромисс", "быт", "договориться на берегу", "взаимопонимание"], "couple-moving-in"),
        meta("b2-u1-l3", "Aile Büyükleriyle Tanışma ve Saygı Dili", "Farklı kuşaklarla hem saygılı (Имя-Отчество) hem sıcak iletişim kurabileceksin.", ["произвести впечатление", "уважение", "семейные ценности", "общий язык с родителями"], "meet-the-parents"),
      ]),
      unit("b2-u2", "Zengin Cümle Mimarisi (Причастия & Деепричастия)", "Üst düzey yazılı ve sözlü Rusçanın anahtarı.", [
        meta("b2-u2-l1", "Прича́стия (Sıfat-Fiiller: -щий, -вший, -нный)", "Karmaşık cümleleri rahatça anlayıp kurabileceksin.", ["человек, изменивший...", "книга, написанная...", "который → причастие dönüşümü"], "free"),
        meta("b2-u2-l2", "Дееприча́стия (Zarf-Fiiller: делая / сделав)", "Eylemleri zarif ve akıcı biçimde birbirine bağlayabileceksin.", ["улыбаясь", "подумав", "несмотря на то, что", "благодаря тому, что"], "white-nights-piter"),
        meta("b2-u2-l3", "Edilgen Yapılar ve Soyut Bağlaçlar", "Sebep-sonuç, zıtlık ve taviz cümlelerini ustaca kurabileceksin.", ["тем не менее", "в результате чего", "как следствие", "при условии, что"], "free"),
      ]),
      unit("b2-u3", "Hikâye Anlatıcılığı (Сторителлинг) ve İkna", "Etkileyici anlatım, mizah ve münazara.", [
        meta("b2-u3-l1", "Merak Uyandırarak Hikâye Anlatma", "Bir olayı dinleyenleri içine çekecek tonlama ve geçişlerle anlatabileceksin.", ["представь себе!", "короче говоря", "кульминация", "самое смешное в том, что"], "party"),
        meta("b2-u3-l2", "Münazara, İkna ve Kibarca Çürütme", "Bir tartışmada karşı argümanı kibarca çürütüp kendi tezini savunabileceksin.", ["не могу полностью согласиться", "весомый аргумент", "с другой точки зрения", "очевидно, что"], "career-dilemma"),
        meta("b2-u3-l3", "Profesyonel ve Resmi İletişim İncelikleri", "Gerektiğinde resmi, kurumsal veya diplomatik bir tonda konuşup yazabileceksin.", ["деловой этикет", "обращаться к...", "формулировать мысль", "с уважением"], "job-interview"),
      ]),
      unit("b2-u4", "Rus Zihniyeti (Менталите́т), Tarih ve Gelenekler", "Rusları gerçekten anlamak için kültürel derinlik.", [
        meta("b2-u4-l1", "Rus Ruhu (Широ́кая душа́), До́ля ve Аво́сь", "Rus kültürünün temel psikolojik kavramlarını anlayıp tartışabileceksin.", ["широкая душа", "надеяться на авось", "гостеприимство", "разговоры по душам"], "moscow-kitchen"),
        meta("b2-u4-l2", "Bayramlar, Batıl İnançlar (Приме́ты) ve Ritüeller", "Yeni Yıl (Новый год), Масленица ve Rusların günlük batıl inançlarını bileceksin.", ["посидеть на дорожку", "не свисти — денег не будет", "постучать по дереву", "Новый год"], "russian-family-dinner"),
      ]),
      unit("b2-u5", "Kelime Türetme Sanatı ve İnce Nüanslar", "Tek bir kökten 20 kelime anlama gücü.", [
        meta("b2-u5-l1", "Ön Eklerin Gücü (пере-, раз-, вы-, под-, от-, за-)", "Fiil ön eklerinin kattığı anlamları çözerek kelime hazineni katlayacaksın.", ["говорить/уговорить/отговорить/договориться", "писать/переписать/записать/подписать"], "free"),
        meta("b2-u5-l2", "Yakın Anlamlı Kelimeler Arasındaki Ton Farkları", "Benzer kelimelerden bağlama en uygun olanını seçebileceksin.", ["слышать vs слушать", "знать vs уметь", "ошибка vs заблуждение", "странный vs необычный"], "free"),
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // C1 — ÜST DÜZEY HAKİMİYET: ÜSLUP, KÜLTÜREL KOD & MİZAH (4 Ünite, 10 Ders)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "C1",
    trki: "C1 • Üst Düzey Hakimiyet",
    title: "Üslup Katmanları, Kültürel Şifreler ve İnce Mizah",
    description:
      "Sokak argosundan entelektüel söyleme kadar tüm üslup katmanlarında geçiş yap; her Rus'un bildiği film/edebiyat göndermelerini ve deyimleri yakala.",
    canDo: [
      "Her Rus'un günlük sohbette gönderme yaptığı kült film repliklerini ve deyimleri anında yakalayıp kullanabilirsin",
      "Modern Rus mizahı, öz-ironi (самоирония) ve entelektüel tartışmalarda tam akıcılıkla yer alabilirsin",
      "Duygusal, felsefi ve estetik konuları zengin mecazlarla ifade edebilirsin",
    ],
    units: [
      unit("c1-u1", "Üslup Katmanları (Регистры речи)", "Aynı düşünceyi 4 farklı Rusça katmanında ifade etme.", [
        meta("c1-u1-l1", "Samimi Sokak Dili vs Edebi/Entelektüel Üslup", "Bulunduğun ortama göre kelimelerini ve cümle yapını anında uyarlayabileceksin.", ["разговорный регистр", "книжный стиль", "уместность", "эвфемизмы"], "irony-and-memes"),
        meta("c1-u1-l2", "Medya, Podcast ve Analitik Söylem", "Karmaşık toplumsal ve kültürel konuları analitik bir dille tartışabileceksin.", ["точка зрения", "общественный резонанс", "парадокс заключается в том", "закономерность"], "academic-defense"),
      ]),
      unit("c1-u2", "Rus Kültürel Kodu (Прецедентные феномены)", "Her Rus'un bildiği ortak kültürel hafıza.", [
        meta("c1-u2-l1", "Sovyet ve Rus Sinemasından Günlük Dile Giren Replikler", "Rusların sohbette sürekli kullandığı kült film repliklerini doğru bağlamda kullanabileceksin.", ["Надо, Федя, надо!", "Шеф, всё пропало!", "Какая гадость эта ваша заливная рыба", "Семен Семеныч!"], "moscow-kitchen"),
        meta("c1-u2-l2", "Kült Şarkılar, Masallar ve Ortak Hafıza", "Rusların çocukluktan bildiği masal, çizgi film ve müzik göndermelerini anlayacaksın.", ["Чебурашка / Винни-Пух цитаты", "Виктор Цой — Перемен", "сказочные архетипы"], "white-nights-piter"),
      ]),
      unit("c1-u3", "Zengin Deyimler (Фразеологизмы) ve Mecazlar", "Rusçayı renkli ve canlı kılan deyim hazinesi.", [
        meta("c1-u3-l1", "Günlük Hayatta En Sık Kullanılan 30 Фразеологизм", "Deyimleri yapay durmadan doğal akışta kullanabileceksin.", ["кот наплакал", "бить баклуши", "водить за нос", "выходить сухим из воды", "душа нараспашку"], "moscow-kitchen"),
        meta("c1-u3-l2", "Atasözleri (Посло́вицы) ve Bilgece İfadeler", "Durumu tek cümleyle özetleyen Rus atasözlerini kullanabileceksin.", ["терпение и труд всё перетрут", "лучше синица в руках", "не всё то золото, что блестит"], "family-generations-debate"),
      ]),
      unit("c1-u4", "Modern Rus Mizahı, Сленг ve Öz-İroni", "Çağdaş Moskova ve Petersburg gençlik/kültür dili.", [
        meta("c1-u4-l1", "Самоиро́ния, Сарказм ve Modern Slang", "Modern Rus konuşma dilindeki güncel ifadeleri ve mizah tonunu yakalayabileceksin.", ["душнила", "слиться", "выгорание", "заморачиваться", "обесценивать", "токсичный"], "irony-and-memes"),
        meta("c1-u4-l2", "Şiirsel Anlatım, Nostalji ve Светлая Грусть", "Derin dost ve aşk sohbetlerinde duygusal incelikleri ifade edebileceksin.", ["светлая грусть", "ностальгия", "откровение", "полутона"], "white-nights-piter"),
      ]),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // C2 — ANA DİLİ SEVİYESİ (УРОВЕНЬ НОСИТЕЛЯ ЯЗЫКА) (4 Ünite, 9 Ders)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "C2",
    trki: "C2 • Ana Dili Seviyesi (Носитель)",
    title: "Alt Metin, İroni, Edebiyat ve Ruhdaşlık",
    description:
      "Eğitimli bir Rus (носитель языка) seviyesinde ince ironi, modal edatlar (же, ведь, мол), kelime oyunları ve felsefi/edebi derinlik.",
    canDo: [
      "Söylenen cümlenin arkasındaki gizli ironiyi, tonlamayı (ИК-1..7) ve alt metni (подтекст) anında sezebilirsin",
      "Küçük edatlar (же, ведь, уж, мол, дескать) ve küçültme/sevgi ekleriyle duygusal tonu ustaca bükebilirsin",
      "Rus edebiyatı, felsefe ve insan ruhu üzerine sabaha kadar 'по душам' sohbet edebilirsin",
    ],
    units: [
      unit("c2-u1", "Alt Metin (Подте́кст) ve Modal Edatlar (Части́цы)", "Söylenen ile kastedilen arasındaki ince Rus sanatı.", [
        meta("c2-u1-l1", "Части́цы: же, ведь, уж, -то, мол, де́скать, вряд ли", "Küçük edatlarla cümlenin bütün duygusunu ve imasını değiştirebileceksin.", ["ты же понимаешь", "ведь", "мол / дескать", "вряд ли / едва ли", "ну да, конечно (ironik)"], "soulmate-confession"),
        meta("c2-u1-l2", "Суффиксы Субъективной Оценки (-очк-, -еньк-, -ишк-, -ищ-)", "Kelimelere sevgi, şefkat, küçümseme veya ironi katan ekleri ana dili gibi kullanabileceksin.", ["минуточка", "чаёк", "делишки", "голосище", "умница"], "family-generations-debate"),
      ]),
      unit("c2-u2", "Kelime Oyunları, Tonlama ve Bireysel Üslup", "Ritim, devrik cümle ve ses tonuyla anlam yaratma.", [
        meta("c2-u2-l1", "Интонацио́нные Констру́кции (ИК-1..ИК-7) ve Слове́сная Игра́", "Kelime sırasını (инверсия) ve tonlamayı değiştirerek vurguyu istediğin yere çekebileceksin.", ["инверсия", "каламбур", "ироническая интонация ИК-6/7", "недосказанность"], "moscow-kitchen"),
        meta("c2-u2-l2", "Родна́я Душа́: En Derin Samimiyet Dili", "Yüzeysel kalıpların ötesinde, bir insanla en derin duygusal ve varoluşsal bağı kurabileceksin.", ["родная душа", "понимать с полуслова", "молчание вдвоём", "уязвимость и близость"], "soulmate-confession"),
      ]),
      unit("c2-u3", "Rus Edebiyatı, Felsefe ve Çevrilemez Kavramlar", "Puşkin, Dostoyevski, Çehov ve Bulgakov'un dünyası.", [
        meta("c2-u3-l1", "Çevrilemez Rus Kavramları: Тоска́, Во́ля, По́шлость, Надры́в", "Rus kültürünün ve edebiyatının en derin kavramlarını tartışabileceksin.", ["тоска vs грусть", "воля vs свобода", "пошлость (Набоков)", "надрыв (Достоевский)"], "moscow-kitchen"),
        meta("c2-u3-l2", "Bulgakov, Çehov ve Dostoyevski Metin Analizi", "Klasik ve çağdaş Rus edebiyatı metinlerindeki üslup ve felsefeyi çözümleyebileceksin.", ["Рукописи не горят", "чеховская ирония", "нравственный выбор", "авторская метафора"], "moscow-kitchen"),
      ]),
      unit("c2-u4", "Tam Doğaçlama ve Kusursuz Hakimiyet", "Ana dili düzeyinde yaratıcı ifade.", [
        meta("c2-u4-l1", "Kuşaklar, Tarih ve Değişen Zaman Üzerine Söylem", "Farklı kuşakların dilini ve bakış açısını harmanlayarak derin tartışmalar yürütebileceksin.", ["связь поколений", "дух времени", "мудрость", "самобытность"], "family-generations-debate"),
        meta("c2-u4-l2", "C2 Ustalık: Serbest Felsefi & Edebi Doğaçlama", "Herhangi bir soyut konuda kusursuz, zengin ve doğal Rusçayla konuşup yazabileceksin.", ["эссеистика", "риторика", "стилистическое совершенство"], "moscow-kitchen"),
      ]),
    ],
  },
];

// ───────── yardımcılar ─────────
function meta(
  id: string,
  title: string,
  goal: string,
  topics: string[],
  scenarioId?: string,
): Lesson {
  return { id, title, goal, topics, scenarioId };
}

function unit(id: string, title: string, description: string, lessons: Lesson[]): Unit {
  return { id, title, description, lessons };
}

export const LEVEL_ORDER: LevelId[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Sıralı tüm dersler */
export function allLessons() {
  const list: { lesson: Lesson; unit: Unit; level: Level }[] = [];
  for (const level of CURRICULUM)
    for (const u of level.units)
      for (const lesson of u.lessons) list.push({ lesson, unit: u, level });
  return list;
}

export function findLesson(id: string) {
  return allLessons().find((x) => x.lesson.id === id);
}

export function nextLessonId(id: string) {
  const list = allLessons();
  const i = list.findIndex((x) => x.lesson.id === id);
  return i >= 0 && i < list.length - 1 ? list[i + 1].lesson.id : null;
}
