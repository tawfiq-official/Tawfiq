import React, { useMemo } from "react";
import { PRAYERS } from "@/lib/prayerUtils";
import { computeStreaks } from "@/lib/streakUtils";

function calcLifeScore(logs) {
  const nonExempt = logs.filter((l) => !l.is_exempt);
  if (nonExempt.length < 14) return null;

  // 1. Completion rate (30d) — weight 25
  const r30 = nonExempt.slice(0, 30);
  let tot = 0,
    comp = 0;
  r30.forEach((l) =>
    PRAYERS.forEach((p) => {
      const s = l.prayers?.[p];
      if (s && s !== "none") {
        tot++;
        if (s !== "missed") comp++;
      }
    }),
  );
  const completionScore = tot > 0 ? (comp / tot) * 25 : 0;

  // 2. On-time rate (30d) — weight 25
  let onT = 0;
  r30.forEach((l) =>
    PRAYERS.forEach((p) => {
      if (l.prayers?.[p] === "on_time") onT++;
    }),
  );
  const onTimeScore = tot > 0 ? (onT / tot) * 25 : 0;

  // 3. Jama'ah rate (30d) — weight 10
  let j = 0,
    jTot = 0;
  r30.forEach((l) =>
    PRAYERS.forEach((p) => {
      if (l.prayers?.[p] === "on_time") {
        jTot++;
        if (l.jamaah?.[p]) j++;
      }
    }),
  );
  const jamaahScore = jTot > 0 ? (j / jTot) * 10 : 0;

  // 4. Long-term consistency (90d) — weight 20
  const r90 = nonExempt.slice(0, 90);
  let t90 = 0,
    o90 = 0;
  r90.forEach((l) =>
    PRAYERS.forEach((p) => {
      const s = l.prayers?.[p];
      if (s && s !== "none") {
        t90++;
        if (s !== "missed") o90++;
      }
    }),
  );
  const longTermScore = t90 > 0 ? (o90 / t90) * 20 : 0;

  // 5. Stability: std-dev-like penalty for inconsistency (weight 10)
  const dailyRates = r30
    .map((l) => {
      let dt = 0,
        do_ = 0;
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (s && s !== "none") {
          dt++;
          if (s !== "missed") do_++;
        }
      });
      return dt > 0 ? do_ / dt : null;
    })
    .filter((v) => v !== null);
  const mean =
    dailyRates.length > 0
      ? dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length
      : 0;
  const variance =
    dailyRates.length > 1
      ? dailyRates.reduce((a, b) => a + (b - mean) ** 2, 0) / dailyRates.length
      : 0;
  const stability = Math.max(0, 1 - Math.sqrt(variance));
  const stabilityScore = stability * 10;

  // 6. Qaza reduction proxy (weight 10) — fewer missed = higher
  const missedRecent = r30.filter((l) =>
    PRAYERS.some((p) => l.prayers?.[p] === "missed"),
  ).length;
  const qazaScore = Math.max(0, 10 - (missedRecent / r30.length) * 10);

  const total = Math.round(
    completionScore +
      onTimeScore +
      jamaahScore +
      longTermScore +
      stabilityScore +
      qazaScore,
  );
  const clamped = Math.min(100, Math.max(0, total));

  let label = "Developing";
  if (clamped >= 90) label = "Excellent";
  else if (clamped >= 75) label = "Strong";
  else if (clamped >= 60) label = "Good";
  else if (clamped >= 45) label = "Developing";
  else label = "Needs Focus";

  return {
    score: clamped,
    label,
    breakdown: {
      completionScore,
      onTimeScore,
      jamaahScore,
      longTermScore,
      stabilityScore,
      qazaScore,
    },
  };
}

export default function SalahLifeScore({ logs }) {
  const result = useMemo(() => calcLifeScore(logs), [logs]);

  if (!result)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Salah Life Score
        </p>
        <p className="text-sm text-muted-foreground">
          Log at least 14 days to generate your long-term score.
        </p>
      </div>
    );

  const { score, label } = result;
  const color =
    score >= 75
      ? "text-green-600"
      : score >= 55
        ? "text-amber-500"
        : "text-red-500";
  const circumference = 2 * Math.PI * 40;
  const dash = (score / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Salah Life Score
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Long-term spiritual performance — changes slowly
      </p>

      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={
                score >= 75 ? "#16a34a" : score >= 55 ? "#f59e0b" : "#ef4444"
              }
              strokeWidth="8"
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold tabular-nums ${color}`}>
              {score}
            </span>
            <span className="text-[9px] text-muted-foreground">/100</span>
          </div>
        </div>

        <div>
          <p className={`text-xl font-bold ${color}`}>{label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[180px]">
            Based on completion, on-time rate, Jama'ah, long-term consistency,
            stability, and Qaza reduction.
          </p>
        </div>
      </div>
    </div>
  );
}
