import React, { useMemo } from "react";

const FRIDAY_NOTE =
  "Today is Friday — a blessed day. Prioritise Jumu'ah and increase Dhikr.";

function isFriday() {
  return new Date().getDay() === 5;
}

export default function SpiritualSeasons({ season, logs }) {
  const friday = isFriday();

  // Last ten nights of Ramadan check (days 21-30 of month 9)
  const hijriMonth = localStorage.getItem("hijri_month");

  if (!season && !friday) return null;

  return (
    <div className="space-y-3">
      {season && (
        <div className="bg-primary/10 border border-primary/25 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{season.icon}</span>
            <div>
              <p className="text-sm font-bold text-foreground">{season.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {season.desc}
              </p>
            </div>
          </div>
          {season.name === "Ramadan" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-background/60 rounded-xl px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Taraweeh activated
                </p>
                <p className="text-xs font-semibold text-primary mt-0.5">
                  Track nightly
                </p>
              </div>
              <div className="bg-background/60 rounded-xl px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">Tahajjud mode</p>
                <p className="text-xs font-semibold text-primary mt-0.5">
                  Last 10 nights
                </p>
              </div>
            </div>
          )}
          {season.name === "Dhul Hijjah" && (
            <div className="mt-3 bg-background/60 rounded-xl px-3 py-2">
              <p className="text-xs text-foreground font-medium">
                🕋 First 10 days — most beloved deeds to Allah. Increase
                worship, fasting, and Takbeer.
              </p>
            </div>
          )}
        </div>
      )}

      {friday && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌟</span>
            <div>
              <p className="text-sm font-bold text-foreground">
                Yawm al-Jumu'ah
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {FRIDAY_NOTE}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
