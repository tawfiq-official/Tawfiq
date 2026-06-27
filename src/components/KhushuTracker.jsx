import React, { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";

const KEY = "tawfiq_khushu";
const LEVELS = [
  { id: 3, label: "Very Focused", emoji: "✦" },
  { id: 2, label: "Focused", emoji: "◆" },
  { id: 1, label: "Distracted", emoji: "◇" },
];

function getStored() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export default function KhushuTracker({ prayer }) {
  const [data, setData] = useState(getStored);
  const today = format(new Date(), "yyyy-MM-dd");

  function rate(level) {
    const next = { ...data, [`${today}_${prayer}`]: level };
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const todayRating = data[`${today}_${prayer}`] || null;

  const trend = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) =>
      format(subDays(new Date(), i), "yyyy-MM-dd"),
    );
    const vals = days
      .map((d) => {
        const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
        const dayVals = prayers.map((p) => data[`${d}_${p}`]).filter(Boolean);
        return dayVals.length > 0
          ? dayVals.reduce((a, b) => a + b, 0) / dayVals.length
          : null;
      })
      .filter((v) => v !== null);
    if (vals.length < 3) return null;
    const recent = vals.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const older =
      vals.slice(3).reduce((a, b) => a + b, 0) /
      Math.max(1, vals.slice(3).length);
    if (recent > older + 0.2) return "Improving";
    if (recent < older - 0.2) return "Needs Focus";
    return "Stable";
  }, [data]);

  return (
    <div className="mt-2 border-t border-border/50 pt-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Khushu Rating
      </p>
      <div className="flex gap-1.5">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => rate(l.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              todayRating === l.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-muted"
            }`}
          >
            {l.emoji} {l.label}
          </button>
        ))}
      </div>
      {trend && (
        <p className="text-[10px] text-muted-foreground mt-1.5">
          7-day trend: {trend}
        </p>
      )}
    </div>
  );
}
