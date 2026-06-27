import React, { useMemo } from "react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

function calcMissRate(logs, prayer, days = 28) {
  const recent = logs.filter((l) => !l.is_exempt).slice(0, days);
  const tracked = recent.filter(
    (l) => l.prayers?.[prayer] && l.prayers[prayer] !== "none",
  );
  const missed = tracked.filter((l) => l.prayers[prayer] === "missed").length;
  return {
    tracked: tracked.length,
    missed,
    perWeek:
      tracked.length > 0
        ? Math.round((missed / tracked.length) * 7 * 10) / 10
        : 0,
  };
}

function calcOnTimeRate(logs, prayer, days = 28) {
  const recent = logs.filter((l) => !l.is_exempt).slice(0, days);
  const tracked = recent.filter(
    (l) => l.prayers?.[prayer] && l.prayers[prayer] !== "none",
  );
  const onTime = tracked.filter((l) => l.prayers[prayer] === "on_time").length;
  return tracked.length > 0
    ? Math.round((onTime / tracked.length) * 100)
    : null;
}

const SCENARIOS = [
  { label: "30 Days", mult: 30 / 7 },
  { label: "90 Days", mult: 90 / 7 },
  { label: "1 Year", mult: 365 / 7 },
];

export default function FutureConsequences({ logs }) {
  const analyses = useMemo(() => {
    return PRAYERS.map((p) => {
      const { tracked, missed, perWeek } = calcMissRate(logs, p);
      const onTimePct = calcOnTimeRate(logs, p);
      if (tracked < 7) return null;
      const improved =
        onTimePct !== null
          ? Math.min(100, Math.round(onTimePct * 1.1 + 5))
          : null;
      return {
        prayer: p,
        name: PRAYER_NAMES[p],
        perWeek,
        missed,
        onTimePct,
        improved,
      };
    }).filter(Boolean);
  }, [logs]);

  const worstMissed = useMemo(
    () => [...analyses].sort((a, b) => b.perWeek - a.perWeek)[0],
    [analyses],
  );

  if (analyses.length === 0)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Log at least 7 days to see projections.
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      {worstMissed && worstMissed.perWeek > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            If Current Pattern Continues
          </p>
          <p className="text-sm font-semibold text-foreground mb-3">
            Missing {worstMissed.name}:{" "}
            <span className="text-red-500">{worstMissed.perWeek}×/week</span>
          </p>
          <div className="space-y-2">
            {SCENARIOS.map(({ label, mult }) => {
              const projected = Math.round(worstMissed.perWeek * mult);
              return (
                <div
                  key={label}
                  className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5"
                >
                  <span className="text-xs text-muted-foreground">
                    Missed {worstMissed.name} in {label}
                  </span>
                  <span className="text-sm font-bold text-red-500 tabular-nums">
                    {projected}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Positive Outcomes
        </p>
        <div className="space-y-3">
          {analyses
            .filter((a) => a.onTimePct !== null && a.onTimePct < 95)
            .map((a) => (
              <div
                key={a.prayer}
                className="bg-green-50 dark:bg-green-950/30 rounded-xl px-3 py-2.5"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  If {a.name} improves by 1 extra on-time/week
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">
                    Projected completion rate
                  </span>
                  <span className="text-sm font-bold text-green-700 dark:text-green-400 tabular-nums">
                    {a.improved}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
