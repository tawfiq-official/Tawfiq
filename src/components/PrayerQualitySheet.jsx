import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PRAYER_NAMES } from "@/lib/prayerUtils";
import { Star, Clock, BookOpen, Heart } from "lucide-react";

export default function PrayerQualitySheet({
  open,
  onClose,
  prayer,
  quality = {},
  onSave,
}) {
  const [khushu, setKhushu] = useState(quality.khushu || 0);
  const [early, setEarly] = useState(!!quality.early);
  const [sunnah, setSunnah] = useState(!!quality.sunnah);
  const [dhikr, setDhikr] = useState(!!quality.dhikr);

  function handleSave() {
    onSave({ khushu, early, sunnah, dhikr });
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-w-md mx-auto pb-10"
      >
        <SheetHeader className="mb-5">
          <SheetTitle className="text-base font-bold">
            {PRAYER_NAMES[prayer]} — Quality
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Khushu rating */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={15} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Khushu (Focus)
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setKhushu(khushu === n ? 0 : n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                    khushu >= n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 px-0.5">
              <span className="text-[10px] text-muted-foreground">
                Distracted
              </span>
              <span className="text-[10px] text-muted-foreground">
                Fully present
              </span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            {[
              {
                key: "early",
                label: "Prayed within first 15 min",
                Icon: Clock,
                val: early,
                set: setEarly,
              },
              {
                key: "sunnah",
                label: "Completed Sunnah prayers",
                Icon: BookOpen,
                val: sunnah,
                set: setSunnah,
              },
              {
                key: "dhikr",
                label: "Completed post-prayer Dhikr",
                Icon: Heart,
                val: dhikr,
                set: setDhikr,
              },
            ].map(({ key, label, Icon, val, set }) => (
              <button
                key={key}
                onClick={() => set((v) => !v)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.99] ${
                  val
                    ? "bg-green-50 dark:bg-green-950/30 border-green-500/40 text-green-700 dark:text-green-400"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium flex-1">{label}</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    val
                      ? "bg-green-600 border-green-600"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {val && (
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

          <button
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm active:scale-[0.99] transition-all"
          >
            Save Quality Log
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
