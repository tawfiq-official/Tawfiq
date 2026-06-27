import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Minus } from "lucide-react";

const TOTAL_PAGES = 604;
const TOTAL_JUZ = 30;

export default function QuranCompanion() {
  const [pagesRead, setPagesRead] = useState(0);
  const [juzDone, setJuzDone] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2);

  useEffect(() => {
    const saved = localStorage.getItem("tawfiq_quran");
    if (saved) {
      const d = JSON.parse(saved);
      setPagesRead(d.pagesRead || 0);
      setJuzDone(d.juzDone || 0);
      setDailyGoal(d.dailyGoal || 2);
    }
  }, []);

  function persist(updates) {
    const next = { pagesRead, juzDone, dailyGoal, ...updates };
    localStorage.setItem("tawfiq_quran", JSON.stringify(next));
    if ("pagesRead" in updates) setPagesRead(updates.pagesRead);
    if ("juzDone" in updates) setJuzDone(updates.juzDone);
    if ("dailyGoal" in updates) setDailyGoal(updates.dailyGoal);
  }

  const pct = Math.min(100, Math.round((pagesRead / TOTAL_PAGES) * 100));
  const pagesLeft = TOTAL_PAGES - pagesRead;
  const daysLeft = dailyGoal > 0 ? Math.ceil(pagesLeft / dailyGoal) : null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={14} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quran Progress
        </p>
      </div>

      {/* Overall progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-foreground">
            Pages read
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {pagesRead} / {TOTAL_PAGES}
          </span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{pct}% complete</span>
          {daysLeft && (
            <span>
              ~{daysLeft} days at {dailyGoal} pages/day
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-secondary rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-2">Pages today</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => persist({ pagesRead: Math.max(0, pagesRead - 1) })}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-90 transition-all"
            >
              <Minus size={12} />
            </button>
            <span className="text-base font-bold tabular-nums text-foreground">
              {pagesRead}
            </span>
            <button
              onClick={() =>
                persist({ pagesRead: Math.min(TOTAL_PAGES, pagesRead + 1) })
              }
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-90 transition-all"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-2">Juz completed</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => persist({ juzDone: Math.max(0, juzDone - 1) })}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-90 transition-all"
            >
              <Minus size={12} />
            </button>
            <span className="text-base font-bold tabular-nums text-foreground">
              {juzDone}/{TOTAL_JUZ}
            </span>
            <button
              onClick={() =>
                persist({ juzDone: Math.min(TOTAL_JUZ, juzDone + 1) })
              }
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-90 transition-all"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Daily goal */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Daily goal</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 5, 10].map((g) => (
            <button
              key={g}
              onClick={() => persist({ dailyGoal: g })}
              className={`w-7 h-7 text-xs font-bold rounded-full transition-all ${
                dailyGoal === g
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {g}
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-1">pages</span>
        </div>
      </div>
    </div>
  );
}
