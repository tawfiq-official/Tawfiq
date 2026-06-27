import React, { useState, useEffect } from "react";
import { format } from "date-fns";

const KEY = "tawfiq_dhikr";
const DHIKR_LIST = [
  { id: "subhanallah", label: "SubhanAllah", arabic: "سُبْحَانَ اللَّه" },
  { id: "alhamdulillah", label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّه" },
  { id: "allahuakbar", label: "Allahu Akbar", arabic: "اللَّهُ أَكْبَر" },
];
const TARGET = 33;

function getStored() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export default function DhikrCompanion() {
  const [data, setData] = useState(getStored);
  const [active, setActive] = useState("subhanallah");
  const today = format(new Date(), "yyyy-MM-dd");

  function increment() {
    const key = `${today}_${active}`;
    const next = { ...data, [key]: (data[key] || 0) + 1 };
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function reset() {
    const key = `${today}_${active}`;
    const next = { ...data, [key]: 0 };
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const count = data[`${today}_${active}`] || 0;
  const completed = count >= TARGET;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Dhikr Companion
      </p>

      <div className="flex gap-1.5 mb-4">
        {DHIKR_LIST.map((d) => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${active === d.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {d.label.split("A")[0]}…
          </button>
        ))}
      </div>

      {/* Active dhikr display */}
      {DHIKR_LIST.filter((d) => d.id === active).map((d) => (
        <div key={d.id} className="text-center mb-4">
          <p className="text-lg font-semibold text-foreground mb-0.5">
            {d.label}
          </p>
          <p
            className="text-2xl text-muted-foreground mb-3"
            style={{ fontFamily: "serif" }}
          >
            {d.arabic}
          </p>

          <button
            onClick={increment}
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mx-auto transition-all active:scale-95 ${
              completed
                ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                : "border-primary bg-primary/10"
            }`}
          >
            <span className="text-4xl font-bold text-foreground tabular-nums">
              {count}
            </span>
            <span className="text-xs text-muted-foreground">/ {TARGET}</span>
          </button>
        </div>
      ))}

      {completed && (
        <p className="text-center text-xs font-semibold text-green-600 mb-3">
          Completed ✓
        </p>
      )}

      <div className="flex justify-between items-center text-xs">
        <button
          onClick={reset}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
        <div className="flex gap-3">
          {DHIKR_LIST.map((d) => {
            const c = data[`${today}_${d.id}`] || 0;
            return c > 0 ? (
              <span key={d.id} className="text-muted-foreground">
                {d.label.split("A")[0]}: {c}
              </span>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
