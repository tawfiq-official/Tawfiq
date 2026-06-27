import React, { useMemo } from "react";
import { PRAYERS, getDayScore } from "@/lib/prayerUtils";
import { format, subDays } from "date-fns";

export default function HabitScore({ logs }) {
  const score = useMemo(() => {
    const recent = logs.filter((l) => {
      const cutoff = format(subDays(new Date(), 30), "yyyy-MM-dd");
      return l.date >= cutoff && !l.is_exempt;
    });
    if (recent.length === 0) return null;

    // Completion rate (0-100)
    let total = 0,
      onTime = 0,
      jamaahCount = 0;
    recent.forEach((l) => {
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (!s || s === "none") return;
        total++;
        if (s === "on_time") onTime++;
        if (l.jamaah?.[p]) jamaahCount++;
      });
    });
    const completionRate = total > 0 ? onTime / total : 0;
    const jamaahRate = onTime > 0 ? jamaahCount / onTime : 0;

    // Streak stability (perfect days / total days)
    const perfectDays = recent.filter(
      (l) => getDayScore(l.prayers) === 5,
    ).length;
    const streakStability = perfectDays / recent.length;

    const rawScore =
      (completionRate * 0.5 + jamaahRate * 0.2 + streakStability * 0.3) * 100;
    return Math.round(rawScore);
  }, [logs]);

  if (score === null) return null;

  const color =
    score >= 80
      ? "text-green-600"
      : score >= 60
        ? "text-amber-500"
        : "text-red-500";
  const radius = 40,
    stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Overall Habit Score
      </p>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg width="96" height="96" className="rotate-[-90deg]">
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="hsl(220 10% 88%)"
              strokeWidth={stroke}
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke={
                score >= 80
                  ? "hsl(152 52% 28%)"
                  : score >= 60
                    ? "hsl(38 92% 50%)"
                    : "hsl(0 75% 55%)"
              }
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold tabular-nums ${color}`}>
              {score}
            </span>
          </div>
        </div>
        <div>
          <p className={`text-3xl font-bold ${color}`}>{score}/100</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Based on on-time rate, Jama'ah, and streak stability over 30 days.
          </p>
        </div>
      </div>
    </div>
  );
}
