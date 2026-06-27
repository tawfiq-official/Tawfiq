import React from "react";
import { format, subDays } from "date-fns";
import { getDayScore } from "@/lib/prayerUtils";

function cellColor(score, exempt) {
  if (exempt) return "#93C5FD"; // blue-300 exempt
  if (score === 5) return "hsl(152 52% 20%)";
  if (score === 4) return "hsl(152 50% 32%)";
  if (score === 3) return "hsl(152 46% 44%)";
  if (score === 2) return "hsl(152 42% 60%)";
  if (score === 1) return "hsl(152 38% 78%)";
  return "hsl(220 10% 88%)";
}

function darkCellColor(score, exempt) {
  if (exempt) return "#1e3a5f";
  if (score === 5) return "hsl(152 40% 42%)";
  if (score === 4) return "hsl(152 38% 34%)";
  if (score === 3) return "hsl(152 34% 26%)";
  if (score === 2) return "hsl(152 30% 20%)";
  if (score === 1) return "hsl(152 26% 16%)";
  return "hsl(220 14% 20%)";
}

export default function HeatmapGrid({ logs, days = 70 }) {
  const isDark = document.documentElement.classList.contains("dark");
  const logMap = {};
  logs.forEach((l) => {
    logMap[l.date] = l;
  });

  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const dateStr = format(d, "yyyy-MM-dd");
    const log = logMap[dateStr];
    const score = log ? getDayScore(log.prayers) : 0;
    const exempt = !!log?.is_exempt;
    cells.push({ dateStr, score, exempt, d });
  }

  const cols = days <= 30 ? 10 : days <= 90 ? 13 : 26;

  return (
    <div className="space-y-2">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cells.map(({ dateStr, score, exempt, d }) => (
          <div
            key={dateStr}
            title={`${format(d, "MMM d")} — ${exempt ? "Exempt" : `${score}/5 on time`}`}
            className="aspect-square rounded-[4px] transition-colors duration-150"
            style={{
              backgroundColor: isDark
                ? darkCellColor(score, exempt)
                : cellColor(score, exempt),
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 justify-end pt-1">
        <span className="text-xs text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className="w-3 h-3 rounded-[3px]"
            style={{
              backgroundColor: isDark
                ? darkCellColor(s, false)
                : cellColor(s, false),
            }}
          />
        ))}
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
}
