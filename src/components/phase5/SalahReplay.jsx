import React, { useMemo, useState } from "react";
import {
  parseISO,
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import { PRAYERS } from "@/lib/prayerUtils";

function monthRate(logs, year, month) {
  const start = format(startOfMonth(new Date(year, month)), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd");
  const ml = logs.filter(
    (l) => !l.is_exempt && l.date >= start && l.date <= end,
  );
  if (ml.length === 0) return null;
  let onT = 0,
    tot = 0;
  ml.forEach((l) =>
    PRAYERS.forEach((p) => {
      const s = l.prayers?.[p];
      if (s && s !== "none") {
        tot++;
        if (s === "on_time") onT++;
      }
    }),
  );
  return tot > 0 ? Math.round((onT / tot) * 100) : null;
}

function jamaahRate(logs, year, month) {
  const start = format(startOfMonth(new Date(year, month)), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd");
  const ml = logs.filter(
    (l) => !l.is_exempt && l.date >= start && l.date <= end,
  );
  let j = 0,
    tot = 0;
  ml.forEach((l) =>
    PRAYERS.forEach((p) => {
      if (l.prayers?.[p] === "on_time") {
        tot++;
        if (l.jamaah?.[p]) j++;
      }
    }),
  );
  return tot > 0 ? Math.round((j / tot) * 100) : null;
}

const MILESTONES = [
  { pct: 50, label: "Halfway There" },
  { pct: 70, label: "Good Consistency" },
  { pct: 85, label: "Strong Month" },
  { pct: 95, label: "Excellent Month" },
  { pct: 100, label: "Perfect Month" },
];

export default function SalahReplay({ logs }) {
  const [view, setView] = useState("completion");

  const months = useMemo(() => {
    if (logs.length === 0) return [];
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const first = parseISO(sorted[0].date);
    const last = new Date();
    return eachMonthOfInterval({ start: first, end: last })
      .map((d) => {
        const y = d.getFullYear(),
          m = d.getMonth();
        const label = format(d, "MMM yyyy");
        const rate = monthRate(logs, y, m);
        const jRate = jamaahRate(logs, y, m);
        const milestone =
          rate !== null
            ? [...MILESTONES].reverse().find((ms) => rate >= ms.pct)
            : null;
        return { label, rate, jRate, milestone };
      })
      .filter((m) => m.rate !== null);
  }, [logs]);

  if (months.length < 2)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Log prayers across multiple months to see your journey.
        </p>
      </div>
    );

  const data =
    view === "completion"
      ? months.map((m) => ({ label: m.label, value: m.rate }))
      : months.map((m) => ({ label: m.label, value: m.jRate }));
  const max = Math.max(...data.map((d) => d.value || 0), 1);

  const colorFor = (v) => {
    if (v === null) return "bg-muted";
    if (v >= 90) return "bg-green-500";
    if (v >= 75) return "bg-green-400";
    if (v >= 60) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Salah Replay
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Your prayer journey over time
      </p>

      <div className="flex gap-2 mb-4">
        {[
          ["completion", "Completion"],
          ["jamaah", "Jama'ah"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {data.map(({ label, value }, i) => {
          const milestone = months[i]?.milestone;
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-muted-foreground w-20 flex-shrink-0">
                  {label}
                </span>
                <div className="flex-1 mx-2 bg-secondary rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${colorFor(value)}`}
                    style={{
                      width: value !== null ? `${(value / max) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums w-10 text-right text-foreground">
                  {value !== null ? `${value}%` : "—"}
                </span>
              </div>
              {milestone && (
                <p className="text-[10px] text-primary font-medium ml-20 pl-2">
                  ✦ {milestone.label}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
