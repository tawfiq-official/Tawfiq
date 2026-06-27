import React, { useMemo, useState } from "react";
import {
  parseISO,
  format,
  startOfWeek,
  startOfMonth,
  getMonth,
} from "date-fns";

const SEASONS = ["Winter", "Spring", "Summer", "Autumn"];
function getSeason(month) {
  // 0-indexed
  if (month <= 1 || month === 11) return 0;
  if (month <= 4) return 1;
  if (month <= 7) return 2;
  return 3;
}

function calcBattle(logs) {
  const fajrLogs = logs.filter(
    (l) => !l.is_exempt && l.prayers?.fajr && l.prayers.fajr !== "none",
  );
  const won = fajrLogs.filter(
    (l) => l.prayers.fajr === "on_time" || l.prayers.fajr === "late",
  ).length;
  const lost = fajrLogs.filter((l) => l.prayers.fajr === "missed").length;
  const rate =
    fajrLogs.length > 0 ? Math.round((won / fajrLogs.length) * 100) : null;
  return { won, lost, rate, total: fajrLogs.length };
}

function weeklyBattle(logs) {
  const map = {};
  logs
    .filter((l) => !l.is_exempt && l.prayers?.fajr && l.prayers.fajr !== "none")
    .forEach((l) => {
      const d = parseISO(l.date);
      const wk = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
      if (!map[wk]) map[wk] = { won: 0, lost: 0 };
      if (l.prayers.fajr === "missed") map[wk].lost++;
      else map[wk].won++;
    });
  return Object.entries(map)
    .slice(-8)
    .map(([wk, v]) => ({ label: format(parseISO(wk), "MMM d"), ...v }));
}

function seasonalBattle(logs) {
  const map = {
    0: { won: 0, lost: 0 },
    1: { won: 0, lost: 0 },
    2: { won: 0, lost: 0 },
    3: { won: 0, lost: 0 },
  };
  logs
    .filter((l) => !l.is_exempt && l.prayers?.fajr && l.prayers.fajr !== "none")
    .forEach((l) => {
      const s = getSeason(getMonth(parseISO(l.date)));
      if (l.prayers.fajr === "missed") map[s].lost++;
      else map[s].won++;
    });
  return SEASONS.map((name, i) => ({
    name,
    ...map[i],
    rate:
      map[i].won + map[i].lost > 0
        ? Math.round((map[i].won / (map[i].won + map[i].lost)) * 100)
        : null,
  })).filter((s) => s.won + s.lost > 0);
}

export default function FajrBattleMap({ logs }) {
  const [view, setView] = useState("overall");
  const overall = useMemo(() => calcBattle(logs), [logs]);
  const weekly = useMemo(() => weeklyBattle(logs), [logs]);
  const seasonal = useMemo(() => seasonalBattle(logs), [logs]);

  if (overall.total < 3)
    return (
      <div className="bg-card border border-border rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Log Fajr for several days to build your battle map.
        </p>
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Fajr Battle Map
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Turn the hardest prayer into a measurable challenge
      </p>

      <div className="flex gap-2 mb-4">
        {[
          ["overall", "Overall"],
          ["weekly", "Weekly"],
          ["seasonal", "Seasonal"],
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

      {view === "overall" && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center bg-green-50 dark:bg-green-950/30 rounded-xl py-3">
              <p className="text-2xl font-bold text-green-600 tabular-nums">
                {overall.won}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Days Won</p>
            </div>
            <div className="text-center bg-red-50 dark:bg-red-950/30 rounded-xl py-3">
              <p className="text-2xl font-bold text-red-500 tabular-nums">
                {overall.lost}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Days Lost</p>
            </div>
            <div className="text-center bg-secondary rounded-xl py-3">
              <p
                className={`text-2xl font-bold tabular-nums ${overall.rate >= 80 ? "text-green-600" : overall.rate >= 60 ? "text-amber-500" : "text-red-500"}`}
              >
                {overall.rate !== null ? `${overall.rate}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Win Rate</p>
            </div>
          </div>
          <div className="bg-secondary rounded-xl px-3 py-2.5">
            <div className="h-2.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${overall.rate || 0}%` }}
              />
            </div>
          </div>
        </>
      )}

      {view === "weekly" && (
        <div className="space-y-2">
          {weekly.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Not enough weekly data yet.
            </p>
          ) : (
            weekly.map((w) => {
              const r =
                w.won + w.lost > 0
                  ? Math.round((w.won / (w.won + w.lost)) * 100)
                  : null;
              return (
                <div key={w.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-14 flex-shrink-0">
                    {w.label}
                  </span>
                  <div className="flex-1 bg-secondary rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r >= 80 ? "bg-green-500" : r >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${r || 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-10 text-right tabular-nums">
                    {r !== null ? `${r}%` : "—"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {view === "seasonal" && (
        <div className="space-y-2">
          {seasonal.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2.5"
            >
              <span className="text-sm font-medium text-foreground">
                {s.name}
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-600">{s.won}W</span>
                <span className="text-red-500">{s.lost}L</span>
                <span
                  className={`font-bold tabular-nums ${s.rate >= 80 ? "text-green-600" : s.rate >= 60 ? "text-amber-500" : "text-red-500"}`}
                >
                  {s.rate !== null ? `${s.rate}%` : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
