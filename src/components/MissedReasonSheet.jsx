import React, { useState } from "react";
import {
  Moon,
  Briefcase,
  GraduationCap,
  Plane,
  Thermometer,
  Brain,
  MoreHorizontal,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PRAYER_NAMES } from "@/lib/prayerUtils";

const REASONS = [
  { label: "Overslept", icon: Moon },
  { label: "Work", icon: Briefcase },
  { label: "School", icon: GraduationCap },
  { label: "Travel", icon: Plane },
  { label: "Illness", icon: Thermometer },
  { label: "Forgot", icon: Brain },
];

export default function MissedReasonSheet({
  open,
  onClose,
  prayer,
  currentReason,
  onSave,
}) {
  const [selected, setSelected] = useState(currentReason || "");

  function handleSelect(r) {
    const next = selected === r ? "" : r;
    setSelected(next);
    onSave(next);
    setTimeout(onClose, 180);
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] max-w-md mx-auto pb-8 px-5 pt-3 [&>button]:hidden"
      >
        <div className="w-9 h-1 rounded-full bg-border mx-auto mb-5" />

        <SheetHeader className="mb-5">
          <div className="flex items-start justify-between">
            <div className="text-left">
              <SheetTitle className="text-lg font-semibold tracking-tight">
                Why was {PRAYER_NAMES[prayer]} missed?
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Optional — helps identify patterns
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-1 flex-shrink-0"
            >
              Skip
            </button>
          </div>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-2.5">
          {REASONS.map(({ label, icon: Icon }, i) => {
            const isSelected = selected === label;
            return (
              <button
                key={label}
                onClick={() => handleSelect(label)}
                style={{ animationDelay: `${i * 30}ms` }}
                className={`animate-in fade-in zoom-in-95 duration-300 fill-mode-both relative flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border transition-all duration-150 active:scale-[0.96] ${
                  isSelected
                    ? "border-primary bg-primary/[0.06]"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check
                      size={9}
                      strokeWidth={3.5}
                      className="text-primary-foreground"
                    />
                  </span>
                )}
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150 ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon size={17} strokeWidth={2} />
                </span>
                <span
                  className={`text-[13px] transition-colors duration-150 ${
                    isSelected
                      ? "font-medium text-foreground"
                      : "text-foreground/75"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => handleSelect("Other")}
            style={{ animationDelay: "180ms" }}
            className={`animate-in fade-in zoom-in-95 duration-300 fill-mode-both col-span-2 relative flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border transition-all duration-150 active:scale-[0.98] ${
              selected === "Other"
                ? "border-primary bg-primary/[0.06]"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            {selected === "Other" && (
              <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check
                  size={9}
                  strokeWidth={3.5}
                  className="text-primary-foreground"
                />
              </span>
            )}
            <MoreHorizontal
              size={16}
              className={
                selected === "Other" ? "text-primary" : "text-muted-foreground"
              }
            />
            <span
              className={`text-[13px] ${
                selected === "Other"
                  ? "font-medium text-foreground"
                  : "text-foreground/75"
              }`}
            >
              Other
            </span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
