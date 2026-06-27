import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PRAYER_NAMES } from "@/lib/prayerUtils";

const REASONS = [
  "Overslept",
  "Work",
  "School",
  "Travel",
  "Illness",
  "Forgot",
  "Other",
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
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-w-md mx-auto pb-10"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold">
            Why was {PRAYER_NAMES[prayer]} missed?
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Optional — helps identify patterns
          </p>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => handleSelect(r)}
              className={`py-3 px-4 rounded-xl text-sm font-medium text-left border transition-all active:scale-[0.98] ${
                selected === r
                  ? "bg-red-50 dark:bg-red-950/30 border-red-400/60 text-red-700 dark:text-red-400"
                  : "bg-secondary border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl text-sm text-muted-foreground border border-border"
        >
          Skip
        </button>
      </SheetContent>
    </Sheet>
  );
}
