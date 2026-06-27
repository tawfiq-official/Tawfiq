import React, { useState } from "react";
import { format, subDays } from "date-fns";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

function jamaahCount(logs, days) {
  const cutoff = format(subDays(new Date(), days), "yyyy-MM-dd");
  return logs.filter(
    (l) =>
      l.date >= cutoff &&
      !l.is_exempt &&
      l.jamaah &&
      Object.values(l.jamaah).some(Boolean),
  ).length;
}

export default function MosqueHeatmap({ logs }) {
  const [days, setDays] = useState(30);

  const logMap = {};
  logs.forEach((l) => {
    logMap[l.date] = l;
  });

  const cells = Array(days)
    .fill(0)
    .map((_, i) => {
      const d = subDays(new Date(), days - 1 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const log = logMap[dateStr];
      const count = log?.jamaah
        ? Object.values(log.jamaah).filter(Boolean).length
        : 0;
      return { dateStr, count, d };
    });

  function cellBg(count) {
    if (count === 0) return "hsl(220 10% 88%)";
    if (count === 1) return "hsl(199 80% 80%)";
    if (count === 2) return "hsl(199 80% 65%)";
    if (count === 3) return "hsl(199 80% 50%)";
    return "hsl(199 80% 35%)";
  }

  const cols = days <= 30 ? 10 : 13;
  const total = cells.filter((c) => c.count > 0).length;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Mosque Attendance
        </p>
        <div className="flex gap-1">
          {[30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid gap-1.5 mb-3"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cells.map(({ dateStr, count, d }) => (
          <div
            key={dateStr}
            title={`${format(d, "MMM d")} — ${count} prayers in congregation`}
            className="aspect-square rounded-[4px] transition-colors"
            style={{ backgroundColor: cellBg(count) }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {total} days with Jama'ah in last {days} days
        </span>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-3 h-3 rounded-[3px]"
              style={{ backgroundColor: cellBg(n) }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
