import React, { useMemo } from "react";
import { Trophy } from "lucide-react";
import { PRAYERS, PRAYER_NAMES, getDayScore } from "@/lib/prayerUtils";

export default function PersonalRecords({ logs }) {
  const records = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

    // Longest perfect day streak
    let longestPerfect = 0,
      run = 0;
    sorted.forEach((l) => {
      if (!l.is_exempt && getDayScore(l.prayers) === 5) {
        run++;
        longestPerfect = Math.max(longestPerfect, run);
      } else run = 0;
    });

    // Per-prayer on-time streak
    const prayerBests = {};
    PRAYERS.forEach((p) => {
      let best = 0,
        streak = 0;
      sorted.forEach((l) => {
        if (!l.is_exempt && l.prayers?.[p] === "on_time") {
          streak++;
          best = Math.max(best, streak);
        } else streak = 0;
      });
      prayerBests[p] = best;
    });

    // Longest Jama'ah streak (any prayer in congregation)
    let jBest = 0,
      jRun = 0;
    sorted.forEach((l) => {
      const hasJamaah = l.jamaah && Object.values(l.jamaah).some(Boolean);
      if (!l.is_exempt && hasJamaah) {
        jRun++;
        jBest = Math.max(jBest, jRun);
      } else jRun = 0;
    });

    return { longestPerfect, prayerBests, jBest };
  }, [logs]);

  const rows = [
    {
      label: "Longest Perfect Day Streak",
      value: records.longestPerfect,
      suffix: "days",
    },
    { label: "Longest Jama'ah Streak", value: records.jBest, suffix: "days" },
    ...PRAYERS.map((p) => ({
      label: `Longest ${PRAYER_NAMES[p]} On-Time Streak`,
      value: records.prayerBests[p],
      suffix: "days",
    })),
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} className="text-yellow-500" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Personal Records
        </p>
      </div>
      <div className="space-y-2">
        {rows.map(({ label, value, suffix }) => (
          <div
            key={label}
            className="flex justify-between items-center py-1.5 border-b border-border last:border-0"
          >
            <span className="text-sm text-foreground">{label}</span>
            <span className="text-sm font-bold tabular-nums text-primary ml-3 flex-shrink-0">
              {value > 0 ? `${value} ${suffix}` : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
