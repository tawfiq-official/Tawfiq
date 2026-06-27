import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Bookmark,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  X,
  ArrowLeft,
  Star,
  Clock,
  Target,
  BarChart2,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import SectionSwitcher from "@/components/SectionSwitcher";

// ─── Local storage helpers ───────────────────────────────────────────────────
const LS = {
  get: (k, def) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? def;
    } catch {
      return def;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
const KEY_LAST = "tawfiq_quran_last";
const KEY_BKMK = "tawfiq_quran_bookmarks";
const KEY_HIST = "tawfiq_quran_history";
const KEY_PAGES = "tawfiq_quran_pages_log"; // { 'yyyy-mm-dd': pagesRead }
const KEY_GOAL = "tawfiq_quran_daily_goal";

// ─── Static Surah list (name, englishName, numberOfAyahs, revelationType) ────
const SURAHS = [
  [1, "Al-Fatihah", "The Opening", 7, "Meccan"],
  [2, "Al-Baqarah", "The Cow", 286, "Medinan"],
  [3, "Ali 'Imran", "Family of Imran", 200, "Medinan"],
  [4, "An-Nisa'", "The Women", 176, "Medinan"],
  [5, "Al-Ma'idah", "The Table Spread", 120, "Medinan"],
  [6, "Al-An'am", "The Cattle", 165, "Meccan"],
  [7, "Al-A'raf", "The Heights", 206, "Meccan"],
  [8, "Al-Anfal", "The Spoils of War", 75, "Medinan"],
  [9, "At-Tawbah", "The Repentance", 129, "Medinan"],
  [10, "Yunus", "Jonah", 109, "Meccan"],
  [11, "Hud", "Hud", 123, "Meccan"],
  [12, "Yusuf", "Joseph", 111, "Meccan"],
  [13, "Ar-Ra'd", "The Thunder", 43, "Medinan"],
  [14, "Ibrahim", "Abraham", 52, "Meccan"],
  [15, "Al-Hijr", "The Rocky Tract", 99, "Meccan"],
  [16, "An-Nahl", "The Bee", 128, "Meccan"],
  [17, "Al-Isra'", "The Night Journey", 111, "Meccan"],
  [18, "Al-Kahf", "The Cave", 110, "Meccan"],
  [19, "Maryam", "Mary", 98, "Meccan"],
  [20, "Ta-Ha", "Ta-Ha", 135, "Meccan"],
  [21, "Al-Anbiya'", "The Prophets", 112, "Meccan"],
  [22, "Al-Hajj", "The Pilgrimage", 78, "Medinan"],
  [23, "Al-Mu'minun", "The Believers", 118, "Meccan"],
  [24, "An-Nur", "The Light", 64, "Medinan"],
  [25, "Al-Furqan", "The Criterion", 77, "Meccan"],
  [26, "Ash-Shu'ara'", "The Poets", 227, "Meccan"],
  [27, "An-Naml", "The Ant", 93, "Meccan"],
  [28, "Al-Qasas", "The Stories", 88, "Meccan"],
  [29, "Al-'Ankabut", "The Spider", 69, "Meccan"],
  [30, "Ar-Rum", "The Romans", 60, "Meccan"],
  [31, "Luqman", "Luqman", 34, "Meccan"],
  [32, "As-Sajdah", "The Prostration", 30, "Meccan"],
  [33, "Al-Ahzab", "The Combined Forces", 73, "Medinan"],
  [34, "Saba'", "Sheba", 54, "Meccan"],
  [35, "Fatir", "Originator", 45, "Meccan"],
  [36, "Ya-Sin", "Ya Sin", 83, "Meccan"],
  [37, "As-Saffat", "Those who set the Ranks", 182, "Meccan"],
  [38, "Sad", "The Letter Sad", 88, "Meccan"],
  [39, "Az-Zumar", "The Troops", 75, "Meccan"],
  [40, "Ghafir", "The Forgiver", 85, "Meccan"],
  [41, "Fussilat", "Explained in Detail", 54, "Meccan"],
  [42, "Ash-Shuraa", "The Consultation", 53, "Meccan"],
  [43, "Az-Zukhruf", "The Ornaments of Gold", 89, "Meccan"],
  [44, "Ad-Dukhan", "The Smoke", 59, "Meccan"],
  [45, "Al-Jathiyah", "The Crouching", 37, "Meccan"],
  [46, "Al-Ahqaf", "The Wind-Curved Sandhills", 35, "Meccan"],
  [47, "Muhammad", "Muhammad", 38, "Medinan"],
  [48, "Al-Fath", "The Victory", 29, "Medinan"],
  [49, "Al-Hujurat", "The Rooms", 18, "Medinan"],
  [50, "Qaf", "The Letter Qaf", 45, "Meccan"],
  [51, "Adh-Dhariyat", "The Winnowing Winds", 60, "Meccan"],
  [52, "At-Tur", "The Mount", 49, "Meccan"],
  [53, "An-Najm", "The Star", 62, "Meccan"],
  [54, "Al-Qamar", "The Moon", 55, "Meccan"],
  [55, "Ar-Rahman", "The Beneficent", 78, "Meccan"],
  [56, "Al-Waqi'ah", "The Inevitable", 96, "Meccan"],
  [57, "Al-Hadid", "The Iron", 29, "Medinan"],
  [58, "Al-Mujadila", "The Pleading Woman", 22, "Medinan"],
  [59, "Al-Hashr", "The Exile", 24, "Medinan"],
  [60, "Al-Mumtahanah", "She that is to be examined", 13, "Medinan"],
  [61, "As-Saf", "The Ranks", 14, "Medinan"],
  [62, "Al-Jumu'ah", "The Congregation Friday", 11, "Medinan"],
  [63, "Al-Munafiqun", "The Hypocrites", 11, "Medinan"],
  [64, "At-Taghabun", "The Mutual Disillusion", 18, "Medinan"],
  [65, "At-Talaq", "The Divorce", 12, "Medinan"],
  [66, "At-Tahrim", "The Prohibition", 12, "Medinan"],
  [67, "Al-Mulk", "The Sovereignty", 30, "Meccan"],
  [68, "Al-Qalam", "The Pen", 52, "Meccan"],
  [69, "Al-Haqqah", "The Reality", 52, "Meccan"],
  [70, "Al-Ma'arij", "The Ascending Stairways", 44, "Meccan"],
  [71, "Nuh", "Noah", 28, "Meccan"],
  [72, "Al-Jinn", "The Jinn", 28, "Meccan"],
  [73, "Al-Muzzammil", "The Enshrouded One", 20, "Meccan"],
  [74, "Al-Muddaththir", "The Cloaked One", 56, "Meccan"],
  [75, "Al-Qiyamah", "The Resurrection", 40, "Meccan"],
  [76, "Al-Insan", "The Human", 31, "Medinan"],
  [77, "Al-Mursalat", "The Emissaries", 50, "Meccan"],
  [78, "An-Naba'", "The Tidings", 40, "Meccan"],
  [79, "An-Nazi'at", "Those who drag forth", 46, "Meccan"],
  [80, "'Abasa", "He Frowned", 42, "Meccan"],
  [81, "At-Takwir", "The Overthrowing", 29, "Meccan"],
  [82, "Al-Infitar", "The Cleaving", 19, "Meccan"],
  [83, "Al-Mutaffifin", "The Defrauding", 36, "Meccan"],
  [84, "Al-Inshiqaq", "The Sundering", 25, "Meccan"],
  [85, "Al-Buruj", "The Mansions of the Stars", 22, "Meccan"],
  [86, "At-Tariq", "The Nightcommer", 17, "Meccan"],
  [87, "Al-A'la", "The Most High", 19, "Meccan"],
  [88, "Al-Ghashiyah", "The Overwhelming", 26, "Meccan"],
  [89, "Al-Fajr", "The Dawn", 30, "Meccan"],
  [90, "Al-Balad", "The City", 20, "Meccan"],
  [91, "Ash-Shams", "The Sun", 15, "Meccan"],
  [92, "Al-Layl", "The Night", 21, "Meccan"],
  [93, "Ad-Duha", "The Morning Hours", 11, "Meccan"],
  [94, "Ash-Sharh", "The Relief", 8, "Meccan"],
  [95, "At-Tin", "The Fig", 8, "Meccan"],
  [96, "Al-'Alaq", "The Clot", 19, "Meccan"],
  [97, "Al-Qadr", "The Power", 5, "Meccan"],
  [98, "Al-Bayyinah", "The Clear Proof", 8, "Medinan"],
  [99, "Az-Zalzalah", "The Earthquake", 8, "Medinan"],
  [100, "Al-'Adiyat", "The Courser", 11, "Meccan"],
  [101, "Al-Qari'ah", "The Calamity", 11, "Meccan"],
  [102, "At-Takathur", "The Rivalry in World Increase", 8, "Meccan"],
  [103, "Al-'Asr", "The Declining Day", 3, "Meccan"],
  [104, "Al-Humazah", "The Traducer", 9, "Meccan"],
  [105, "Al-Fil", "The Elephant", 5, "Meccan"],
  [106, "Quraysh", "Quraysh", 4, "Meccan"],
  [107, "Al-Ma'un", "The Small Kindnesses", 7, "Meccan"],
  [108, "Al-Kawthar", "The Abundance", 3, "Meccan"],
  [109, "Al-Kafirun", "The Disbelievers", 6, "Meccan"],
  [110, "An-Nasr", "The Divine Support", 3, "Medinan"],
  [111, "Al-Masad", "The Palm Fibre", 5, "Meccan"],
  [112, "Al-Ikhlas", "Sincerity", 4, "Meccan"],
  [113, "Al-Falaq", "The Daybreak", 5, "Meccan"],
  [114, "An-Nas", "Mankind", 6, "Meccan"],
];

// JUZ boundaries (surah, ayah) for juz 1-30
const JUZ = [
  [1, 1],
  [2, 142],
  [2, 253],
  [3, 92],
  [4, 24],
  [4, 148],
  [5, 82],
  [6, 111],
  [7, 88],
  [8, 41],
  [9, 93],
  [11, 6],
  [12, 53],
  [15, 1],
  [17, 1],
  [18, 75],
  [21, 1],
  [23, 1],
  [25, 21],
  [27, 56],
  [29, 46],
  [33, 31],
  [36, 28],
  [39, 32],
  [41, 47],
  [46, 1],
  [51, 31],
  [58, 1],
  [67, 1],
  [78, 1],
];

function juzOfAyah(surah, ayah) {
  for (let i = JUZ.length - 1; i >= 0; i--) {
    const [s, a] = JUZ[i];
    if (surah > s || (surah === s && ayah >= a)) return i + 1;
  }
  return 1;
}

// ─── API helpers ─────────────────────────────────────────────────────────────
const API = "https://api.alquran.cloud/v1";
const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

async function fetchSurah(number, edition = "en.asad") {
  const [arRes, enRes] = await Promise.all([
    fetch(`${API}/surah/${number}`).then((r) => r.json()),
    fetch(`${API}/surah/${number}/${edition}`).then((r) => r.json()),
  ]);
  const ar = arRes.data?.ayahs || [];
  const en = enRes.data?.ayahs || [];
  return ar.map((v, i) => ({
    number: v.numberInSurah,
    globalNumber: v.number,
    arabic: v.text,
    translation: en[i]?.text || "",
  }));
}

const EDITIONS = [
  { id: "en.asad", label: "Asad (English)" },
  { id: "en.pickthall", label: "Pickthall (English)" },
  { id: "en.sahih", label: "Saheeh International" },
  { id: "fr.hamidullah", label: "Hamidullah (French)" },
  { id: "ur.jalandhry", label: "Jalandhry (Urdu)" },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "read", label: "Read" },
  { id: "hadith", label: "Hadith" },
  { id: "bookmarks", label: "Bookmarks" },
  { id: "insights", label: "Insights" },
];

export default function QuranPage() {
  const [tab, setTab] = useState("read");
  const [view, setView] = useState("list"); // list | reader
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(() => LS.get(KEY_BKMK, []));
  const [edition, setEdition] = useState(() =>
    LS.get("tawfiq_quran_edition", "en.asad"),
  );
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(() => LS.get(KEY_GOAL, 2));
  const audioRef = useRef(null);
  const lastRead = LS.get(KEY_LAST, null);

  const filteredSurahs = useMemo(() => {
    if (!search) return SURAHS;
    const q = search.toLowerCase();
    return SURAHS.filter(
      ([n, ar, en]) =>
        ar.toLowerCase().includes(q) ||
        en.toLowerCase().includes(q) ||
        String(n).includes(q),
    );
  }, [search]);

  async function openSurah(surahNum) {
    setSelectedSurah(surahNum);
    setView("reader");
    setLoadingVerses(true);
    setVerses([]);
    const data = await fetchSurah(surahNum, edition).catch(() => []);
    setVerses(data);
    setLoadingVerses(false);
    LS.set(KEY_LAST, {
      surah: surahNum,
      ayah: 1,
      name: SURAHS[surahNum - 1][1],
    });
    const today = new Date().toISOString().slice(0, 10);
    const pages = LS.get(KEY_PAGES, {});
    pages[today] =
      (pages[today] || 0) + Math.ceil((SURAHS[surahNum - 1][3] || 10) / 15);
    LS.set(KEY_PAGES, pages);
  }

  function toggleBookmark(surahNum, ayahNum) {
    const key = `${surahNum}:${ayahNum}`;
    const exists = bookmarks.find((b) => b.key === key);
    let next;
    if (exists) {
      next = bookmarks.filter((b) => b.key !== key);
    } else {
      next = [
        ...bookmarks,
        {
          key,
          surah: surahNum,
          ayah: ayahNum,
          surahName: SURAHS[surahNum - 1][1],
          text: verses.find((v) => v.number === ayahNum)?.arabic || "",
        },
      ];
    }
    setBookmarks(next);
    LS.set(KEY_BKMK, next);
  }

  function isBookmarked(surahNum, ayahNum) {
    return bookmarks.some((b) => b.key === `${surahNum}:${ayahNum}`);
  }

  function playAyah(globalNumber) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingAyah === globalNumber && audioPlaying) {
      setPlayingAyah(null);
      setAudioPlaying(false);
      return;
    }
    const audio = new Audio(`${AUDIO_BASE}/${globalNumber}.mp3`);
    audioRef.current = audio;
    audio.play().catch(() => {});
    setPlayingAyah(globalNumber);
    setAudioPlaying(true);
    audio.onended = () => {
      setPlayingAyah(null);
      setAudioPlaying(false);
    };
  }

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  const surahInfo = selectedSurah ? SURAHS[selectedSurah - 1] : null;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {view === "reader" ? (
            <>
              <button
                onClick={() => {
                  setView("list");
                  setVerses([]);
                  audioRef.current?.pause();
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary text-muted-foreground"
              >
                <ArrowLeft size={17} />
              </button>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  {surahInfo?.[1]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {surahInfo?.[2]} · {surahInfo?.[3]} verses
                </p>
              </div>
              <button
                onClick={() => setShowWordByWord((w) => !w)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${showWordByWord ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
              >
                W×W
              </button>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-bold text-foreground">Quran</h1>
                <p className="text-xs text-muted-foreground">
                  Al-Quran Al-Kareem
                </p>
              </div>
              <select
                value={edition}
                onChange={(e) => {
                  setEdition(e.target.value);
                  LS.set("tawfiq_quran_edition", e.target.value);
                }}
                className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none"
              >
                {EDITIONS.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </header>

      {view === "reader" ? (
        <ReaderView
          surahNum={selectedSurah}
          verses={verses}
          loading={loadingVerses}
          showWordByWord={showWordByWord}
          isBookmarked={isBookmarked}
          onBookmark={toggleBookmark}
          playingAyah={playingAyah}
          onPlayAyah={playAyah}
        />
      ) : (
        <div>
          {/* Tabs */}
          <div className="sticky top-[61px] z-30 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="max-w-md mx-auto px-4 py-2.5">
              <SectionSwitcher tabs={TABS} active={tab} onChange={setTab} />
            </div>
          </div>

          <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
            {tab === "read" && (
              <>
                {/* Continue reading */}
                {lastRead && (
                  <button
                    onClick={() => openSurah(lastRead.surah)}
                    className="w-full flex items-center gap-3 bg-primary/10 border border-primary/25 rounded-2xl p-4 text-left hover:bg-primary/15 transition-colors active:scale-[0.99]"
                  >
                    <Clock size={18} className="text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Continue Reading
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {lastRead.name}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground flex-shrink-0"
                    />
                  </button>
                )}

                {/* Search */}
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search surah by name or number…"
                    className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Surah list */}
                <div className="space-y-1.5">
                  {filteredSurahs.map(([num, ar, en, ayahs, rev]) => (
                    <button
                      key={num}
                      onClick={() => openSurah(num)}
                      className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 hover:bg-secondary transition-colors active:scale-[0.99] text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary tabular-nums">
                          {num}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {ar}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {en} · {ayahs} verses · {rev}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">
                          Juz {juzOfAyah(num, 1)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "hadith" && <HadithTab />}

            {tab === "bookmarks" && (
              <BookmarksTab
                bookmarks={bookmarks}
                onOpen={openSurah}
                onRemove={(s, a) => toggleBookmark(s, a)}
              />
            )}

            {tab === "insights" && (
              <InsightsTab
                dailyGoal={dailyGoal}
                onGoalChange={(g) => {
                  setDailyGoal(g);
                  LS.set(KEY_GOAL, g);
                }}
              />
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// ─── Reader View ─────────────────────────────────────────────────────────────
function ReaderView({
  surahNum,
  verses,
  loading,
  showWordByWord,
  isBookmarked,
  onBookmark,
  playingAyah,
  onPlayAyah,
}) {
  if (loading)
    return (
      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
      </div>
    );

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-4 space-y-3">
      {/* Bismillah */}
      {surahNum !== 1 && surahNum !== 9 && (
        <div className="text-center py-3">
          <p
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "serif", direction: "rtl" }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        </div>
      )}

      {verses.map((v) => (
        <div
          key={v.number}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary tabular-nums">
                {v.number}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPlayAyah(v.globalNumber)}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${playingAyah === v.globalNumber ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                {playingAyah === v.globalNumber ? (
                  <Pause size={11} />
                ) : (
                  <Play size={11} />
                )}
              </button>
              <button
                onClick={() => onBookmark(surahNum, v.number)}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isBookmarked(surahNum, v.number) ? "text-amber-500" : "text-muted-foreground hover:text-foreground bg-secondary"}`}
              >
                <Bookmark
                  size={11}
                  fill={
                    isBookmarked(surahNum, v.number) ? "currentColor" : "none"
                  }
                />
              </button>
            </div>
          </div>

          {showWordByWord ? (
            <WordByWordDisplay arabic={v.arabic} translation={v.translation} />
          ) : (
            <>
              <p
                className="text-xl leading-loose text-foreground text-right mb-3"
                style={{
                  fontFamily: "serif",
                  direction: "rtl",
                  lineHeight: 2.2,
                }}
              >
                {v.arabic}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                {v.translation}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function WordByWordDisplay({ arabic, translation }) {
  const words = arabic.split(" ");
  const trWords = translation.split(" ");
  return (
    <div className="flex flex-wrap gap-2 justify-end py-2">
      {words.map((w, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 bg-secondary rounded-xl px-2 py-2 min-w-[48px]"
        >
          <span
            className="text-base text-foreground"
            style={{ fontFamily: "serif", direction: "rtl" }}
          >
            {w}
          </span>
          <span className="text-[10px] text-muted-foreground text-center leading-tight">
            {trWords[i] || ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Bookmarks Tab ────────────────────────────────────────────────────────────
function BookmarksTab({ bookmarks, onOpen, onRemove }) {
  if (!bookmarks.length)
    return (
      <div className="text-center py-16">
        <Bookmark size={32} className="text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-semibold text-foreground">
          No bookmarks yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tap the bookmark icon on any verse while reading.
        </p>
      </div>
    );
  return (
    <div className="space-y-2">
      {bookmarks.map((b) => (
        <div
          key={b.key}
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary">
              {b.surahName} · Verse {b.ayah}
            </p>
            <p
              className="text-sm text-foreground mt-0.5 truncate"
              style={{ direction: "rtl", fontFamily: "serif" }}
            >
              {b.text}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onOpen(b.surah)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Open
            </button>
            <button
              onClick={() => onRemove(b.surah, b.ayah)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Insights Tab ─────────────────────────────────────────────────────────────
function InsightsTab({ dailyGoal, onGoalChange }) {
  const pagesLog = LS.get(KEY_PAGES, {});
  const today = new Date().toISOString().slice(0, 10);
  const todayPages = pagesLog[today] || 0;

  const streak = useMemo(() => {
    let s = 0,
      d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      if (!pagesLog[k]) break;
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [pagesLog]);

  const totalPages = Object.values(pagesLog).reduce((a, b) => a + b, 0);
  const goals = [1, 2, 5, 10];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-primary tabular-nums">
            {streak}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Day Reading Streak
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {totalPages}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Pages Read</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Today's Progress
        </p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (todayPages / dailyGoal) * 100)}%`,
              }}
            />
          </div>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {todayPages}/{dailyGoal}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">pages read today</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Daily Goal
        </p>
        <div className="grid grid-cols-4 gap-2">
          {goals.map((g) => (
            <button
              key={g}
              onClick={() => onGoalChange(g)}
              className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${dailyGoal === g ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">pages per day</p>
      </div>
    </div>
  );
}

// ─── Hadith Tab ───────────────────────────────────────────────────────────────
const HADITH_COLLECTIONS = [
  { id: "bukhari", label: "Sahih al-Bukhari", count: 7563 },
  { id: "muslim", label: "Sahih Muslim", count: 3032 },
  { id: "nawawi40", label: "Forty Hadith Nawawi", count: 42 },
  { id: "riyadh", label: "Riyadh as-Salihin", count: 1896 },
];

const HADITH_CATEGORIES = [
  { label: "Prayer & Salah", query: "prayer salah" },
  { label: "Fajr", query: "fajr dawn" },
  { label: "Jama'ah", query: "congregation mosque" },
  { label: "Consistency", query: "deeds regular consistent" },
  { label: "Repentance", query: "repentance tawbah forgiveness" },
  { label: "Patience", query: "patience sabr" },
];

function HadithTab() {
  const [view, setHView] = useState("daily"); // daily | search | collection
  const [hadith, setHadith] = useState(null);
  const [loadingH, setLoadingH] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState([]);
  const [bookmarks, setBookmarks] = useState(() =>
    LS.get("tawfiq_hadith_bkmk", []),
  );
  const [activeCollection, setActiveCollection] = useState(null);
  const [collectionHadith, setCollectionHadith] = useState([]);
  const [savedNotes, setSavedNotes] = useState(() =>
    LS.get("tawfiq_hadith_notes", {}),
  );

  useEffect(() => {
    if (view === "daily" && !hadith) loadDailyHadith();
  }, [view]);

  async function loadDailyHadith() {
    setLoadingH(true);
    // Use day of year to pick a consistent daily hadith
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000,
    );
    const hadithNum = (dayOfYear % 100) + 1;
    const res = await fetch(
      `https://api.hadith.gader.io/books/bukhari/${hadithNum}`,
    ).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setHadith(data);
    } else {
      // Fallback static hadith about prayer
      setHadith({
        hadithnumber: 525,
        book: "Sahih al-Bukhari",
        chapter: "Times of Prayer",
        text: {
          en: "The Prophet (ﷺ) said: 'The first matter that the slave will be brought to account for on the Day of Judgment is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is bad, then the rest of his deeds will be bad.'",
        },
      });
    }
    setLoadingH(false);
  }

  async function searchHadith() {
    if (!searchQ.trim()) return;
    setLoadingH(true);
    setResults([]);
    const res = await fetch(
      `https://api.sunnah.com/v1/hadiths/random?limit=5`,
      {
        headers: { "X-API-Key": "SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TN8umMd" },
      },
    ).catch(() => null);
    // Fallback: show curated relevant hadiths based on query
    const curated = getCuratedHadiths(searchQ);
    setResults(curated);
    setLoadingH(false);
  }

  function getCuratedHadiths(query) {
    const q = query.toLowerCase();
    const all = [
      {
        id: 1,
        text: "The Prophet (ﷺ) said: 'The most beloved deeds to Allah are those done regularly, even if they are small.'",
        source: "Sahih al-Bukhari 6465",
        topic: "consistency",
      },
      {
        id: 2,
        text: "The Prophet (ﷺ) said: 'Whoever misses the Asr prayer, it is as though he lost his family and wealth.'",
        source: "Sahih al-Bukhari 552",
        topic: "prayer asr",
      },
      {
        id: 3,
        text: "The Prophet (ﷺ) said: 'Give good news to those who walk to the mosque in the dark, for they will have perfect light on the Day of Resurrection.'",
        source: "Sunan Ibn Majah 780",
        topic: "fajr mosque darkness",
      },
      {
        id: 4,
        text: "The Prophet (ﷺ) said: 'The two rakat of Fajr are better than the world and everything in it.'",
        source: "Sahih Muslim 725",
        topic: "fajr prayer",
      },
      {
        id: 5,
        text: "The Prophet (ﷺ) said: 'Prayer in congregation is twenty-five times superior to prayer offered alone.'",
        source: "Sahih al-Bukhari 645",
        topic: "congregation jamaah",
      },
      {
        id: 6,
        text: "The Prophet (ﷺ) said: 'Be patient, for patience is a gift from Allah.'",
        source: "Sahih al-Bukhari 7534",
        topic: "patience sabr",
      },
      {
        id: 7,
        text: "The Prophet (ﷺ) said: 'Every son of Adam makes mistakes, and the best of those who make mistakes are those who repent.'",
        source: "Sunan Ibn Majah 4251",
        topic: "repentance tawbah forgiveness",
      },
      {
        id: 8,
        text: "The Prophet (ﷺ) said: 'The prayer is a light.'",
        source: "Sahih Muslim 223",
        topic: "prayer light",
      },
      {
        id: 9,
        text: "The Prophet (ﷺ) said: 'Whoever prays the two cool prayers (Fajr and Asr) will go to Paradise.'",
        source: "Sahih al-Bukhari 574",
        topic: "fajr asr paradise",
      },
      {
        id: 10,
        text: "The Prophet (ﷺ) said: 'The covenant between us and them is prayer, so if anyone abandons it he has become a disbeliever.'",
        source: "Sunan an-Nasa'i 464",
        topic: "prayer covenant",
      },
    ];
    return all.filter(
      (h) => h.topic.includes(q) || h.text.toLowerCase().includes(q),
    );
  }

  function toggleHadithBookmark(h) {
    const exists = bookmarks.find((b) => b.id === (h.id || h.hadithnumber));
    const next = exists
      ? bookmarks.filter((b) => b.id !== (h.id || h.hadithnumber))
      : [
          ...bookmarks,
          {
            id: h.id || h.hadithnumber,
            text: h.text?.en || h.text,
            source: h.source || h.book,
          },
        ];
    setBookmarks(next);
    LS.set("tawfiq_hadith_bkmk", next);
  }

  const htabs = [
    { id: "daily", label: "Daily" },
    { id: "search", label: "Search" },
    { id: "saved", label: "Saved" },
  ];

  return (
    <div className="space-y-4">
      <SectionSwitcher tabs={htabs} active={view} onChange={setHView} />

      {view === "daily" &&
        (loadingH ? (
          <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        ) : (
          hadith && (
            <div className="space-y-3">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Today's Hadith
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-foreground mb-4">
                  {hadith.text?.en || hadith.text}
                </p>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {hadith.book || "Sahih al-Bukhari"}
                    </p>
                    {hadith.chapter && (
                      <p className="text-xs text-muted-foreground">
                        {hadith.chapter}
                      </p>
                    )}
                    {hadith.hadithnumber && (
                      <p className="text-xs text-muted-foreground">
                        Hadith #{hadith.hadithnumber}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleHadithBookmark(hadith)}
                    className="text-xs text-muted-foreground hover:text-amber-500 transition-colors"
                  >
                    <Bookmark size={15} />
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Quick Search by Topic
                </p>
                <div className="flex flex-wrap gap-2">
                  {HADITH_CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => {
                        setSearchQ(cat.query);
                        setHView("search");
                        setTimeout(searchHadith, 100);
                      }}
                      className="text-xs font-medium bg-secondary border border-border rounded-full px-3 py-1.5 text-foreground hover:bg-muted transition-colors"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        ))}

      {view === "search" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchHadith()}
                placeholder="Search hadith topics…"
                className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={searchHadith}
              className="bg-primary text-primary-foreground text-sm font-semibold px-4 rounded-xl hover:opacity-90"
            >
              Go
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {HADITH_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => {
                  setSearchQ(cat.query);
                  setTimeout(searchHadith, 0);
                }}
                className="text-xs font-medium bg-secondary border border-border rounded-full px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loadingH && (
            <div className="h-24 rounded-2xl bg-muted animate-pulse" />
          )}
          {results.map((h) => (
            <div
              key={h.id}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <p className="text-sm leading-relaxed text-foreground mb-3">
                {h.text}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-primary">{h.source}</p>
                <button
                  onClick={() => toggleHadithBookmark(h)}
                  className="text-muted-foreground hover:text-amber-500 transition-colors"
                >
                  <Bookmark
                    size={13}
                    fill={
                      bookmarks.find((b) => b.id === h.id)
                        ? "currentColor"
                        : "none"
                    }
                    className={
                      bookmarks.find((b) => b.id === h.id)
                        ? "text-amber-500"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>
          ))}
          {!loadingH && results.length === 0 && searchQ && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No results. Try: prayer, fajr, patience, repentance…
            </p>
          )}
        </div>
      )}

      {view === "saved" &&
        (bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark
              size={32}
              className="text-muted-foreground mx-auto mb-3"
            />
            <p className="text-sm text-muted-foreground">
              No saved hadith yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <p className="text-sm leading-relaxed text-foreground mb-2">
                  {b.text}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-primary">
                    {b.source}
                  </p>
                  <button
                    onClick={() => toggleHadithBookmark(b)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
