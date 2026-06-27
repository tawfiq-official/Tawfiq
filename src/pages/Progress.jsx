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
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3.5">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-bold text-foreground">Progress</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your consistency, honestly
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
        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
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
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-950/40 flex items-center justify-center flex-shrink-0">
                  <Trophy size={20} className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {loading ? "—" : bestStreak}
                  </p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Heatmap
                </p>
                <div className="flex gap-1">
                  {HEATMAP_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setHeatmapDays(opt.days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        heatmapDays === opt.days
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-muted"
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

            <div className="bg-card border border-border rounded-2xl p-4">
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
                        className="w-full rounded-t-md transition-all duration-300"
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

            <div className="bg-card border border-border rounded-2xl p-4">
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
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
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
