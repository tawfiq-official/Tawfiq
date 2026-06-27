import React, { useMemo } from "react";
import { parseISO, getMonth } from "date-fns";
import { PRAYERS } from "@/lib/prayerUtils";

function calcSeasonStats(logs) {
  const groups = {
    ramadan: [],
    dhulHijjah: [],
    travel: [],
    home: [],
    regular: [],
  };

  logs
    .filter((l) => !l.is_exempt)
    .forEach((l) => {
      if (l.travel_mode) {
        groups.travel.push(l);
        return;
      }
      // We use the stored hijri month approximation via log dates
      // Approximate: if logs are tagged with taraweeh = ramadan proxy
      if (l.taraweeh) {
        groups.ramadan.push(l);
        return;
      }
      groups.regular.push(l);
      groups.home.push(l);
    });

  function rate(arr) {
    let onT = 0,
      tot = 0,
      miss = 0,
      j = 0;
    arr.forEach((l) =>
      PRAYERS.forEach((p) => {
        const s = l.prayers?.[p];
        if (!s || s === "none") return;
        tot++;
        if (s === "on_time") {
          onT++;
          if (l.jamaah?.[p]) j++;
        }
        if (s === "missed") miss++;
      }),
    );
    return {
      onTimePct: tot > 0 ? Math.round((onT / tot) * 100) : null,
      missedPct: tot > 0 ? Math.round((miss / tot) * 100) : null,
      jamaahPct: onT > 0 ? Math.round((j / onT) * 100) : null,
      days: arr.length,
    };
  }

  return {
    ramadan: rate(groups.ramadan),
    travel: rate(groups.travel),
    home: rate(groups.home),
    regular: rate(groups.regular),
  };
}

const SEASON_META = [
  { key: "ramadan", label: "Ramadan", icon: "🌙" },
  { key: "travel", label: "Travel", icon: "✈️" },
  { key: "home", label: "At Home", icon: "🏠" },
  { key: "regular", label: "Regular", icon: "📅" },
];

export default function SalahSeasons({ logs }) {
  const seasons = useMemo(() => calcSeasonStats(logs), [logs]);

  const active = SEASON_META.filter((s) => seasons[s.key]?.days > 0);
  if (active.length < 2)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Log across different periods (travel, Ramadan) to see seasonal
          comparisons.
        </p>
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Salah Seasons
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        How Islamic seasons affect your worship
      </p>
      <div className="space-y-3">
        {active.map(({ key, label, icon }) => {
          const s = seasons[key];
          return (
            <div key={key} className="border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>{icon}</span>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <span className="text-xs text-muted-foreground ml-auto">
                  {s.days} days
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { l: "On Time", v: s.onTimePct, color: "text-green-600" },
                  {
                    l: "Jama'ah",
                    v: s.jamaahPct,
                    color: "text-blue-600 dark:text-blue-400",
                  },
                  { l: "Missed", v: s.missedPct, color: "text-red-500" },
                ].map(({ l, v, color }) => (
                  <div
                    key={l}
                    className="text-center bg-secondary rounded-lg py-2"
                  >
                    <p
                      className={`text-sm font-bold tabular-nums ${v !== null ? color : "text-muted-foreground"}`}
                    >
                      {v !== null ? `${v}%` : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
