import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const NAWAFIL = [
  { key: "tahajjud", label: "Tahajjud", desc: "Night prayer" },
  { key: "duha", label: "Duha", desc: "Forenoon prayer" },
  { key: "witr", label: "Witr", desc: "Odd-numbered prayer" },
  { key: "ishraq", label: "Ishraq", desc: "Post-sunrise prayer" },
  { key: "awwabin", label: "Awwabin", desc: "After Maghrib" },
];

export default function NawafilSection({
  nawafil = {},
  onToggle,
  isFriday = false,
}) {
  const [open, setOpen] = useState(false);
  const count = NAWAFIL.filter((n) => nawafil[n.key]).length;

  const accent = isFriday
    ? {
        card: "from-amber-50 to-white dark:from-amber-950/20 dark:to-card border-amber-200 dark:border-amber-800",
        chevron: "text-amber-700 dark:text-amber-400",
        badge:
          "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
        divider: "border-amber-100 dark:border-amber-800",
        itemActive:
          "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700",
        itemInactive:
          "bg-white dark:bg-card border-amber-100 dark:border-amber-800 hover:border-amber-300",
        check: "bg-amber-600 border-amber-600",
      }
    : {
        card: "from-green-50 to-white dark:from-green-950/20 dark:to-card border-green-200 dark:border-green-800",
        chevron: "text-green-700 dark:text-green-400",
        badge:
          "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
        divider: "border-green-100 dark:border-green-800",
        itemActive:
          "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700",
        itemInactive:
          "bg-white dark:bg-card border-green-100 dark:border-green-800 hover:border-green-300",
        check: "bg-green-600 border-green-600",
      };

  return (
    <div
      className={`bg-gradient-to-br border rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${accent.card}`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-lg font-bold text-foreground">Voluntary Prayers</p>
          <p className="text-sm text-muted-foreground mt-1">
            {count > 0 ? `${count} logged today` : "Nawafil — tap to expand"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${accent.badge}`}
            >
              {count}
            </span>
          )}
          {open ? (
            <ChevronUp size={16} className={accent.chevron} />
          ) : (
            <ChevronDown size={16} className={accent.chevron} />
          )}
        </div>
      </button>

      {open && (
        <div className={`border-t p-4 space-y-3 ${accent.divider}`}>
          {NAWAFIL.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`w-full flex items-center justify-between rounded-2xl px-4 py-4 text-left border transition-all duration-300 ${
                nawafil[key]
                  ? `${accent.itemActive} shadow-sm`
                  : `${accent.itemInactive} hover:shadow-sm`
              }`}
            >
              <div>
                <p className="text-base font-semibold text-foreground">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <div
                className={`w-7 h-7 rounded-full shadow-sm flex items-center justify-center border-2 transition-colors duration-150 flex-shrink-0 ${
                  nawafil[key] ? accent.check : "border-border"
                }`}
              >
                {nawafil[key] && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 12 12"
                  >
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
          ))}
        </div>
      )}
    </div>
  );
}
