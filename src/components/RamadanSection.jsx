import React from "react";
import { Moon, BookOpen } from "lucide-react";

function isRamadan() {
  // Check via Hijri date stored in localStorage from Today page
  const cached = localStorage.getItem("hijri_month");
  if (cached) return cached === "9";
  // Fallback: approximate Ramadan 2025 & 2026
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (y === 2025 && m === 3 && d >= 1 && d <= 30) return true;
  if ((y === 2026 && m === 2 && d >= 18) || (y === 2026 && m === 3 && d <= 19))
    return true;
  return false;
}

export function checkIsRamadan() {
  return isRamadan();
}

export default function RamadanSection({
  log,
  onToggleTaraweeh,
  onUpdateQuranPages,
  quranGoal = 2,
}) {
  if (!isRamadan()) return null;

  const taraweeh = !!log?.taraweeh;
  const quranPages = log?.quran_pages || 0;
  const progress = Math.min(100, Math.round((quranPages / quranGoal) * 100));

  return (
    <div className="bg-card border border-amber-300/40 dark:border-amber-700/40 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Moon size={16} className="text-amber-500" />
        <p className="text-sm font-bold text-foreground">Ramadan</p>
      </div>

      {/* Taraweeh */}
      <button
        onClick={onToggleTaraweeh}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.99] ${
          taraweeh
            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-400/60 text-amber-700 dark:text-amber-400"
            : "bg-secondary border-border text-muted-foreground"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Moon size={14} />
          <span className="text-sm font-medium">Taraweeh Prayed</span>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            taraweeh
              ? "bg-amber-500 border-amber-500"
              : "border-muted-foreground/40"
          }`}
        >
          {taraweeh && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Quran pages */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              Quran Today
            </span>
          </div>
          <span className="text-xs font-bold tabular-nums text-muted-foreground">
            {quranPages} / {quranGoal} pages
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onUpdateQuranPages(Math.max(0, quranPages - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground text-lg font-bold active:scale-90 transition-all"
          >
            −
          </button>
          <span className="text-base font-bold tabular-nums text-foreground w-8 text-center">
            {quranPages}
          </span>
          <button
            onClick={() => onUpdateQuranPages(quranPages + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold active:scale-90 transition-all"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
