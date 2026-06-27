import React, { useState, useEffect, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import SectionSwitcher from "@/components/SectionSwitcher";
import { fetchAllLogs } from "@/lib/useDailyLog";
import { getCachedLogs, cacheAllLogs } from "@/lib/prayerCache";
import { computeStreaks } from "@/lib/streakUtils";
import {
  calcHealthScore,
  strongestWeakest,
  salahAge,
  perfectDayStats,
  calcMomentum,
  calcRiskScore,
  futureSelf,
  generateGoal,
  whyImproving,
  endOfDayReflection,
  detectSeason,
} from "@/lib/intelligenceUtils";
import { useQaza } from "@/lib/useQaza";
import { format } from "date-fns";

// Phase 4 components
import IntelligenceCenter from "@/components/intelligence/IntelligenceCenter";
import CommandHub from "@/components/intelligence/CommandHub";
import SalahHealthCheck from "@/components/intelligence/SalahHealthCheck";
import FutureSelfSimulator from "@/components/intelligence/FutureSelfSimulator";
import SpiritualSeasons from "@/components/intelligence/SpiritualSeasons";
import PrayerRecoveryAssistant from "@/components/intelligence/PrayerRecoveryAssistant";
import SalahRiskEngine from "@/components/intelligence/SalahRiskEngine";
import DeepFajrAnalytics from "@/components/intelligence/DeepFajrAnalytics";
import WhyImprovingAnalytics from "@/components/intelligence/WhyImprovingAnalytics";
import SpiritualMomentumGraph from "@/components/intelligence/SpiritualMomentumGraph";
import DynamicGoalSystem from "@/components/intelligence/DynamicGoalSystem";
import EndOfDayReflection from "@/components/intelligence/EndOfDayReflection";
import PerfectDayEngine from "@/components/intelligence/PerfectDayEngine";
import SalahAgeCard from "@/components/intelligence/SalahAgeCard";
import SilentAccountability from "@/components/intelligence/SilentAccountability";

// Phase 5 components
import SalahReplay from "@/components/phase5/SalahReplay";
import FutureConsequences from "@/components/phase5/FutureConsequences";
import FajrBattleMap from "@/components/phase5/FajrBattleMap";
import SalahDNA from "@/components/phase5/SalahDNA";
import SpiritualCoach from "@/components/phase5/SpiritualCoach";
import LegacyMode from "@/components/phase5/LegacyMode";
import SalahSeasons from "@/components/phase5/SalahSeasons";
import QazaRecoverySimulator from "@/components/phase5/QazaRecoverySimulator";
import WhyEngine from "@/components/phase5/WhyEngine";
import SalahLifeScore from "@/components/phase5/SalahLifeScore";
import MosqueMemoryMap from "@/components/phase5/MosqueMemoryMap";
import AnnualBook from "@/components/phase5/AnnualBook";
import WuduTracker from "@/components/WuduTracker";
import DhikrCompanion from "@/components/DhikrCompanion";
import DuaCollection from "@/components/DuaCollection";
import SalahStory from "@/components/phase7/SalahStory";
import MissedOpportunity from "@/components/phase7/MissedOpportunity";
import LifetimeProjection from "@/components/phase7/LifetimeProjection";
import TawfiqMentor from "@/components/TawfiqMentor";
import { base44 } from "@/api/base44Client";

const TABS = [
  { id: "mentor", label: "✦ Mentor" },
  { id: "command", label: "Command" },
  { id: "health", label: "Health" },
  { id: "future", label: "Future" },
  { id: "fajr", label: "Fajr" },
  { id: "story", label: "Story" },
  { id: "coach", label: "Coach" },
  { id: "journal", label: "Journal" },
  { id: "spiritual", label: "Spiritual" },
];

export default function Intelligence() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("tawfiq_command_last_view") || "mentor",
  );
  const [currentUser, setCurrentUser] = useState(null);
  const { total: qazaTotal } = useQaza();

  useEffect(() => {
    base44.auth
      .me()
      .then(setCurrentUser)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cached = getCachedLogs();
    if (cached) {
      setLogs(cached);
      setLoading(false);
    }
    fetchAllLogs()
      .then((l) => {
        setLogs(l);
        cacheAllLogs(l);
        setLoading(false);
      })
      .catch(() => {
        if (!cached) setLoading(false);
      });
  }, []);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLog = useMemo(
    () => logs.find((l) => l.date === todayStr),
    [logs, todayStr],
  );
  const { current: streak, best: bestStreak } = useMemo(
    () => computeStreaks(logs),
    [logs],
  );
  const healthScore = useMemo(() => calcHealthScore(logs), [logs]);
  const { strongest, weakest } = useMemo(() => strongestWeakest(logs), [logs]);
  const age = useMemo(() => salahAge(logs), [logs]);
  const perfect = useMemo(() => perfectDayStats(logs), [logs]);
  const momentum = useMemo(() => calcMomentum(logs), [logs]);
  const risk = useMemo(() => calcRiskScore(logs), [logs]);
  const future = useMemo(() => futureSelf(logs), [logs]);
  const goal = useMemo(() => generateGoal(logs), [logs]);
  const why = useMemo(() => whyImproving(logs), [logs]);
  const eod = useMemo(() => endOfDayReflection(todayLog), [todayLog]);
  const hijriMonth = localStorage.getItem("hijri_month");
  const season = useMemo(() => detectSeason(hijriMonth, null), [hijriMonth]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3.5">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-bold text-foreground">
            Tawfiq Intelligence
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your spiritual journey, deeply understood
          </p>
        </div>
      </header>

      {/* Section switcher */}
      <div className="sticky top-[61px] z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 py-2.5">
          <SectionSwitcher
            tabs={TABS}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* MENTOR TAB */}
        {activeTab === "mentor" &&
          (loading ? (
            <div className="h-96 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <TawfiqMentor
              logs={logs}
              qazaTotal={qazaTotal}
              streak={streak}
              strongest={strongest}
              weakest={weakest}
              userName={currentUser?.full_name}
            />
          ))}

        {/* COMMAND CENTER — Intelligence Hub */}
        {activeTab === "command" &&
          (loading ? (
            <div className="h-96 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <IntelligenceCenter
                streak={streak}
                bestStreak={bestStreak}
                healthScore={healthScore}
                strongest={strongest}
                weakest={weakest}
                momentum={momentum}
                risk={risk}
                goal={goal}
                perfect={perfect}
                age={age}
              />
              <CommandHub
                logs={logs}
                qazaTotal={qazaTotal}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  localStorage.setItem("tawfiq_command_last_view", tab);
                }}
              />
              <DynamicGoalSystem logs={logs} goal={goal} />
              <SalahRiskEngine risk={risk} />
              <SpiritualSeasons season={season} logs={logs} />
              <SilentAccountability logs={logs} perfect={perfect} />
            </>
          ))}

        {/* HEALTH TAB */}
        {activeTab === "health" &&
          (loading ? (
            <div className="h-96 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <SalahLifeScore logs={logs} />
              <SalahHealthCheck
                logs={logs}
                healthScore={healthScore}
                strongest={strongest}
                weakest={weakest}
              />
              <PerfectDayEngine perfect={perfect} logs={logs} />
              <SalahAgeCard age={age} logs={logs} />
              <WhyImprovingAnalytics why={why} logs={logs} />
              <SpiritualMomentumGraph logs={logs} momentum={momentum} />
            </>
          ))}

        {/* FUTURE TAB */}
        {activeTab === "future" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <FutureSelfSimulator future={future} />
              <FutureConsequences logs={logs} />
              <QazaRecoverySimulator qazaTotal={qazaTotal} />
              <PrayerRecoveryAssistant todayLog={todayLog} logs={logs} />
              <EndOfDayReflection eod={eod} todayLog={todayLog} />
            </>
          ))}

        {/* FAJR TAB */}
        {activeTab === "fajr" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <FajrBattleMap logs={logs} />
              <DeepFajrAnalytics logs={logs} />
            </>
          ))}

        {/* STORY TAB — Phase 5 narrative features */}
        {activeTab === "story" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <SalahReplay logs={logs} />
              <AnnualBook logs={logs} />
              <SalahSeasons logs={logs} />
              <LegacyMode logs={logs} />
              <SalahDNA logs={logs} />
              <MosqueMemoryMap />
            </>
          ))}

        {/* COACH TAB — Phase 5 intelligence features */}
        {activeTab === "coach" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <SpiritualCoach logs={logs} />
              <WhyEngine logs={logs} />
            </>
          ))}

        {/* JOURNAL TAB */}
        {activeTab === "journal" && <JournalTab />}

        {/* SPIRITUAL TAB — Phase 7 */}
        {activeTab === "spiritual" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <WuduTracker />
              <DhikrCompanion />
              <SalahStory logs={logs} />
              <MissedOpportunity logs={logs} />
              <LifetimeProjection logs={logs} />
              <DuaCollection />
            </>
          ))}
      </div>

      <BottomNav />
    </div>
  );
}

// ─── Inline Journal ────────────────────────────────────────────────────────
const JOURNAL_KEY = "tawfiq_journal_entries";

function JournalTab() {
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");

  function save() {
    if (!text.trim()) return;
    const entry = { id: Date.now(), date: today, text: text.trim() };
    const next = [entry, ...entries];
    setEntries(next);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
    setText("");
  }

  function remove(id) {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
  }

  const filtered = search
    ? entries.filter(
        (e) =>
          e.text.toLowerCase().includes(search.toLowerCase()) ||
          e.date.includes(search),
      )
    : entries;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Personal Salah Journal
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Private. Only you can see this. Reflect on your spiritual journey.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Today's reflection… e.g. "Fajr felt difficult but I completed it."`}
          rows={3}
          className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <button
          onClick={save}
          disabled={!text.trim()}
          className="mt-2 w-full bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
        >
          Save Reflection
        </button>
      </div>

      {entries.length > 3 && (
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reflections…"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-10 text-sm text-muted-foreground">
          {search
            ? "No entries match your search."
            : "Your journal is empty. Write your first reflection above."}
        </div>
      )}

      {filtered.map((entry) => (
        <div
          key={entry.id}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-muted-foreground">{entry.date}</p>
            <button
              onClick={() => remove(entry.id)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            >
              Delete
            </button>
          </div>
          <p className="text-sm text-foreground mt-2 leading-relaxed">
            "{entry.text}"
          </p>
        </div>
      ))}
    </div>
  );
}
