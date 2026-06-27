import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDayScore } from "@/lib/prayerUtils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
} from "date-fns";

function DayCell({ log, day, isCurrentMonth }) {
  if (!isCurrentMonth) return <div className="aspect-square" />;

  const score = log ? getDayScore(log.prayers) : -1;
  const isExempt = log?.is_exempt;
  const isFuture = day > new Date();
  const hasData = log && !isFuture;

  let bg = "bg-transparent";
  if (!isFuture && hasData) {
    if (isExempt) bg = "bg-blue-200 dark:bg-blue-900/40";
    else if (score === 5) bg = "bg-green-600";
    else if (score >= 3) bg = "bg-amber-400";
    else if (score > 0) bg = "bg-orange-400";
    else if (score === 0) bg = "bg-red-400";
  }

  const textColor =
    !isFuture && hasData && score >= 0 && !isExempt
      ? "text-white"
      : "text-foreground";

  return (
    <div
      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${bg} ${textColor} ${isFuture ? "opacity-30" : ""}`}
    >
      {format(day, "d")}
    </div>
  );
}

export default function SalahCalendar({ logs }) {
  const [viewDate, setViewDate] = useState(new Date());

  const logMap = {};
  logs.forEach((l) => {
    logMap[l.date] = l;
  });

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start (Mon = 0)
  const startPad = (getDay(monthStart) + 6) % 7;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground active:scale-90 transition-all"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="text-sm font-bold text-foreground">
          {format(viewDate, "MMMM yyyy")}
        </p>
        <button
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          disabled={addMonths(viewDate, 1) > new Date()}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground active:scale-90 transition-all disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array(startPad)
          .fill(null)
          .map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          return (
            <DayCell
              key={dateStr}
              day={day}
              log={logMap[dateStr]}
              isCurrentMonth={true}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
        {[
          { color: "bg-green-600", label: "Perfect" },
          { color: "bg-amber-400", label: "Late" },
          { color: "bg-red-400", label: "Missed" },
          { color: "bg-blue-200 dark:bg-blue-900/40", label: "Exempt" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-[3px] ${color}`} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
