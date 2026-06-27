import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function SectionSwitcher({ tabs, active, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const activeTab = tabs.find((t) => (t.id ?? t) === active);
  const activeLabel = activeTab?.label ?? activeTab ?? active;

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, [open]);

  function select(id) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors active:scale-95"
      >
        <span>{activeLabel}</span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-card border border-border rounded-2xl shadow-lg overflow-hidden min-w-[160px]">
          {tabs.map((tab) => {
            const id = tab.id ?? tab;
            const label = tab.label ?? tab;
            const isActive = id === active;
            return (
              <button
                key={id}
                onClick={() => select(id)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
