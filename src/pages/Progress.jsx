import React, { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { format } from "date-fns";
import HeatmapGrid from "@/components/HeatmapGrid";
import InsightsPanel from "@/components/InsightsPanel";
import BottomNav from "@/components/BottomNav";
import ReadinessScore from "@/components/intelligence/insights/ReadinessScore";
import PerformanceScore from "@/components/intelligence/insights/PerformanceScore";
import FajrRescue from "@/components/intelligence/insights/FajrRescue";
import PersonalRecords from "@/components/intelligence/insights/PersonalRecords";
import SmartForecast from "@/components/intelligence/insights/SmartForecast";
import CoachingEngine from "@/components/intelligence/insights/CoachingEngine";
import AnnualReview from "@/components/intelligence/insights/AnnualReview";
import MosqueHeatmap from "@/components/intelligence/insights/MosqueHeatmap";
import AccountabilityGoals from "@/components/intelligence/insights/AccountabilityGoals";
import QuranCompanion from "@/components/intelligence/insights/QuranCompanion";
import MilestonesTimeline from "@/components/intelligence/insights/MilestonesTimeline";
import ConsistencyScorecard from "@/components/intelligence/insights/ConsistencyScorecard";
import MomentumIndicator from "@/components/intelligence/insights/MomentumIndicator";
import WeeklyReview from "@/components/intelligence/insights/WeeklyReview";
import SalahCalendar from "@/components/intelligence/insights/SalahCalendar";
import LifetimeStats from "@/components/intelligence/insights/LifetimeStats";
import CompletionForecast from "@/components/intelligence/insights/CompletionForecast";
import HabitScore from "@/components/intelligence/insights/HabitScore";
import { fetchAllLogs } from "@/lib/useDailyLog";
import { computeStreaks } from "@/lib/streakUtils";
import { PRAYERS, PRAYER_NAMES, getDayScore } from "@/lib/prayerUtils";
import SectionSwitcher from "@/components/SectionSwitcher";

const HEATMAP_OPTIONS = [
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "365d", days: 365 },
];

const TABS = ["Overview", "Insights", "Records", "Calendar", "Stats", "Tools"];

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heatmapDays, setHeatmapDays] = useState(70);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    fetchAllLogs().then((l) => {
      setLogs(l);
      setLoading(false);
    });
  }, []);

  const { current: currentStreak, best: bestStreak } = computeStreaks(logs);

  const prayerStats = PRAYERS.map((p) => {
    const total = logs.filter((l) => !l.is_exempt).length;
    const onTime = logs.filter(
      (l) => !l.is_exempt && l.prayers?.[p] === "on_time",
    ).length;
    const pct = total > 0 ? Math.round((onTime / total) * 100) : 0;
    return { prayer: p, pct };
  });

  const last7 = Array(7)
    .fill(0)
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === dateStr);
      return {
        day: d.toLocaleDateString("en", { weekday: "short" }),
        score: log ? getDayScore(log.prayers) : 0,
      };
    });

  const todayLog = logs.find(
    (l) => l.date === format(new Date(), "yyyy-MM-dd"),
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header - Upgraded typography & sticky classes removed */}
      <header className="bg-background border-b border-border px-6 py-5">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Progress
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your Salah journey and build lasting consistency
          </p>
        </div>
      </header>

      {/* Section switcher - Sticky to top-0 so it catches when the header scrolls away */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-md mx-auto px-4 py-2.5">
          <SectionSwitcher
            tabs={TABS}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shadow-sm dark:bg-orange-950/40 flex-shrink-0">
                  <Flame size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {loading ? "—" : currentStreak}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current Streak
                  </p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shadow-sm dark:bg-yellow-950/40 flex-shrink-0">
                  <Trophy size={20} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-4xl font-black tabular-nums text-foreground leading-none">
                    {loading ? "—" : bestStreak}
                  </p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-green-400">
                  Heatmap
                </p>
                <div className="flex gap-1">
                  {HEATMAP_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setHeatmapDays(opt.days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        heatmapDays === opt.days
                          ? "bg-green-700 text-white shadow-md"
                          : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 transition-all duration-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className="h-32 rounded-xl bg-muted animate-pulse" />
              ) : (
                <HeatmapGrid logs={logs} days={heatmapDays} />
              )}
            </div>

            <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Last 7 Days
              </p>
              <div className="flex items-end gap-2 h-20">
                {last7.map(({ day, score }) => (
                  <div
                    key={day}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-full flex flex-col justify-end"
                      style={{ height: "64px" }}
                    >
                      <div
                        className="w-full rounded-full transition-all duration-300"
                        style={{
                          height: `${(score / 5) * 64}px`,
                          minHeight: score > 0 ? "4px" : "0",
                          backgroundColor:
                            score === 5
                              ? "hsl(152 52% 20%)"
                              : score > 0
                                ? "hsl(152 42% 55%)"
                                : "hsl(220 10% 88%)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                On-Time Rate
              </p>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-8 my-2 rounded-lg bg-muted animate-pulse"
                    />
                  ))
              ) : (
                <div className="space-y-3">
                  {prayerStats.map(({ prayer, pct }) => (
                    <div key={prayer}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-foreground">
                          {PRAYER_NAMES[prayer]}
                        </span>
                        <span className="text-xs font-bold tabular-nums text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-3 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              pct >= 80
                                ? "hsl(152 52% 28%)"
                                : pct >= 50
                                  ? "hsl(38 92% 50%)"
                                  : "hsl(0 75% 55%)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loading && <MosqueHeatmap logs={logs} />}
          </>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === "Insights" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <MomentumIndicator logs={logs} />
              <WeeklyReview logs={logs} />
              <InsightsPanel logs={logs} />
              <PerformanceScore logs={logs} />
              <ReadinessScore logs={logs} todayLog={todayLog} />
              <CompletionForecast logs={logs} />
              <SmartForecast logs={logs} />
              <FajrRescue logs={logs} />
              <CoachingEngine logs={logs} />
            </>
          ))}

        {/* RECORDS TAB */}
        {activeTab === "Records" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <PersonalRecords logs={logs} />
              <AnnualReview logs={logs} />
            </>
          ))}

        {/* CALENDAR TAB */}
        {activeTab === "Calendar" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <SalahCalendar logs={logs} />
          ))}

        {/* STATS TAB */}
        {activeTab === "Stats" &&
          (loading ? (
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          ) : (
            <>
              <HabitScore logs={logs} />
              <LifetimeStats logs={logs} />
              <MilestonesTimeline logs={logs} />
              <ConsistencyScorecard logs={logs} />
            </>
          ))}

        {/* TOOLS TAB */}
        {activeTab === "Tools" && (
          <>
            <AccountabilityGoals logs={logs} />
            <QuranCompanion />
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
