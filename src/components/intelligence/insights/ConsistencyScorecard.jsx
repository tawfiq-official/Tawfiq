import React, { useState, useMemo } from "react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";
import { subDays, format } from "date-fns";

function calcGrade(pct) {
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 60) return "D";
  return "F";
}

function gradeColor(g) {
  if (g.startsWith("A")) return "text-green-600";
  if (g.startsWith("B")) return "text-blue-600";
  if (g.startsWith("C")) return "text-amber-500";
  return "text-red-500";
}

function prayerScore(logs, prayer) {
  const relevant = logs.filter(
    (l) => !l.is_exempt && l.prayers?.[prayer] && l.prayers[prayer] !== "none",
  );
  if (relevant.length === 0) return null;
  const onTime = relevant.filter((l) => l.prayers[prayer] === "on_time").length;
  const jamaah = relevant.filter((l) => l.jamaah?.[prayer]).length;
  const rate = Math.round(
    ((onTime * 1.0 + jamaah * 0.3) / (relevant.length * 1.3)) * 100,
  );
  return Math.min(100, rate);
}

const PERIODS = [
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
  { label: "Year", days: 365 },
];

export default function ConsistencyScorecard({ logs }) {
  const [period, setPeriod] = useState(30);

  const filtered = useMemo(() => {
    const cutoff = format(subDays(new Date(), period), "yyyy-MM-dd");
    return logs.filter((l) => l.date >= cutoff);
  }, [logs, period]);

  const rows = PRAYERS.map((p) => {
    const score = prayerScore(filtered, p);
    const grade = score !== null ? calcGrade(score) : "—";
    return { p, score, grade };
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Consistency Scorecard
        </p>
        <div className="flex gap-1">
          {PERIODS.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => setPeriod(days)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                period === days
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map(({ p, score, grade }) => (
          <div
            key={p}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <span className="text-sm font-medium text-foreground">
              {PRAYER_NAMES[p]}
            </span>
            <div className="flex items-center gap-3">
              {score !== null && (
                <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${score}%`,
                      backgroundColor:
                        score >= 80
                          ? "hsl(152 52% 28%)"
                          : score >= 60
                            ? "hsl(38 92% 50%)"
                            : "hsl(0 75% 55%)",
                    }}
                  />
                </div>
              )}
              <span
                className={`text-sm font-bold w-7 text-right ${gradeColor(grade)}`}
              >
                {grade}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
