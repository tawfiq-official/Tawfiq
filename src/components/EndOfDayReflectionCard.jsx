import React, { useState, useEffect } from "react";
import { PRAYERS, PRAYER_NAMES } from "@/lib/prayerUtils";

const STORAGE_KEY = "tawfiq_eod_reflections";

function getStoredReflections() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function getMessage(onTime, late, missed, completed) {
  if (completed === 5 && onTime === 5)
    return "Excellent consistency today. MashaAllah!";
  if (completed === 5)
    return "All prayers completed today. Keep building on this.";
  if (missed === 0 && late > 0)
    return "All prayers done — try to be earlier for a few tomorrow.";
  if (missed === 1)
    return "Only one prayer was missed today. Focus on recovery.";
  if (missed >= 2)
    return "A tough day — tomorrow is a new opportunity. Be kind to yourself.";
  return "Keep going. Every prayer counts.";
}

function getBestPrayer(log) {
  if (!log) return null;
  for (const p of PRAYERS) {
    if (log.prayers?.[p] === "on_time" && log.jamaah?.[p])
      return PRAYER_NAMES[p];
  }
  for (const p of PRAYERS) {
    if (log.prayers?.[p] === "on_time") return PRAYER_NAMES[p];
  }
  return null;
}

function getImprovePrayer(log) {
  if (!log) return null;
  const order = ["fajr", "isha", "asr", "dhuhr", "maghrib"];
  for (const p of order) {
    if (log.prayers?.[p] === "missed") return PRAYER_NAMES[p];
  }
  for (const p of order) {
    if (log.prayers?.[p] === "late") return PRAYER_NAMES[p];
  }
  return null;
}

export default function EndOfDayReflectionCard({ log, todayStr }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getStoredReflections();
    setText(stored[todayStr] || "");
    setSaved(!!stored[todayStr]);
  }, [todayStr]);

  if (!log) return null;

  const prayers = log.prayers || {};
  const onTime = Object.values(prayers).filter((v) => v === "on_time").length;
  const late = Object.values(prayers).filter((v) => v === "late").length;
  const missed = Object.values(prayers).filter((v) => v === "missed").length;
  const completed = onTime + late;
  const total = Object.values(prayers).filter((v) => v !== "none").length;

  if (total === 0) return null; // nothing logged yet

  const best = getBestPrayer(log);
  const improve = getImprovePrayer(log);
  const message = getMessage(onTime, late, missed, completed);

  function save() {
    const stored = getStoredReflections();
    stored[todayStr] = text.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setSaved(true);
  }

  function handleChange(e) {
    if (e.target.value.length <= 250) {
      setText(e.target.value);
      setSaved(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Today's Salah Summary
      </p>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-secondary rounded-xl px-3 py-2.5">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
            {completed} / 5
          </p>
        </div>
        <div className="bg-secondary rounded-xl px-3 py-2.5">
          <p className="text-xs text-muted-foreground">On Time</p>
          <p className="text-sm font-bold text-green-600 tabular-nums mt-0.5">
            {onTime}
          </p>
        </div>
        <div className="bg-secondary rounded-xl px-3 py-2.5">
          <p className="text-xs text-muted-foreground">Late</p>
          <p className="text-sm font-bold text-amber-500 tabular-nums mt-0.5">
            {late}
          </p>
        </div>
        <div className="bg-secondary rounded-xl px-3 py-2.5">
          <p className="text-xs text-muted-foreground">Missed</p>
          <p className="text-sm font-bold text-red-500 tabular-nums mt-0.5">
            {missed}
          </p>
        </div>
      </div>

      {(best || improve) && (
        <div className="flex gap-2 mb-4">
          {best && (
            <div className="flex-1 bg-green-50 dark:bg-green-950/30 rounded-xl px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Best Prayer</p>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mt-0.5">
                {best}
              </p>
            </div>
          )}
          {improve && (
            <div className="flex-1 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Area to Improve</p>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                {improve}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Today's Reflection
      </p>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="A short personal note… (optional)"
        rows={3}
        className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-muted-foreground">
          {text.length} / 250
        </span>
        <button
          onClick={save}
          disabled={saved || !text.trim()}
          className="text-xs font-semibold text-primary disabled:text-muted-foreground transition-colors"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}
