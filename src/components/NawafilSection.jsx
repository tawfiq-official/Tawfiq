import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const NAWAFIL = [
  { key: "tahajjud", label: "Tahajjud", desc: "Night prayer" },
  { key: "duha", label: "Duha", desc: "Forenoon prayer" },
  { key: "witr", label: "Witr", desc: "Odd-numbered prayer" },
  { key: "ishraq", label: "Ishraq", desc: "Post-sunrise prayer" },
  { key: "awwabin", label: "Awwabin", desc: "After Maghrib" },
];

export default function NawafilSection({ nawafil = {}, onToggle }) {
  const [open, setOpen] = useState(false);
  const count = NAWAFIL.filter((n) => nawafil[n.key]).length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            Voluntary Prayers
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {count > 0 ? `${count} logged today` : "Nawafil — tap to expand"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {count}
            </span>
          )}
          {open ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          {NAWAFIL.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-100 ${
                nawafil[key]
                  ? "bg-green-50 dark:bg-green-950/30"
                  : "hover:bg-muted/50"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors duration-150 flex-shrink-0 ${
                  nawafil[key]
                    ? "bg-green-600 border-green-600"
                    : "border-border"
                }`}
              >
                {nawafil[key] && (
                  <svg
                    className="w-3 h-3 text-white"
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
