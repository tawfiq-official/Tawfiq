import React, { useState, useEffect, useMemo } from "react";
import { Users, Star, AlertCircle, Clock } from "lucide-react";
import { PRAYER_NAMES } from "@/lib/prayerUtils";
import PrayerQualitySheet from "@/components/PrayerQualitySheet";
import MissedReasonSheet from "@/components/MissedReasonSheet";

const STATUS_STYLES = {
  default: {
    none: { card: "border-border bg-card" },
    on_time: {
      card: "border-l-4 border-l-green-600 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-700",
    },
    late: {
      card: "border-l-4 border-l-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700",
    },
    missed: {
      card: "border-l-4 border-l-red-500 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-700",
    },
  },
  gold: {
    none: {
      card: "border-amber-300 bg-card dark:border-amber-700",
    },
    on_time: {
      card: "border-l-4 border-l-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-600",
    },
    late: {
      card: "border-l-4 border-l-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700",
    },
    missed: {
      card: "border-l-4 border-l-amber-800 border-amber-300 bg-amber-100 dark:bg-amber-950/40 dark:border-amber-900",
    },
  },
};

const DOT_COLOR = {
  default: {
    none: "bg-muted-foreground/30",
    on_time: "bg-green-600",
    late: "bg-amber-400",
    missed: "bg-red-500",
  },
  gold: {
    none: "bg-amber-400/70",
    on_time: "bg-amber-500",
    late: "bg-amber-600",
    missed: "bg-amber-800",
  },
};

const BTN_ACTIVE = {
  default: {
    on_time: "bg-green-600 text-white shadow-lg shadow-green-500/30",
    late: "bg-amber-500 text-white shadow-lg shadow-amber-400/30",
    missed: "bg-red-500 text-white shadow-lg shadow-red-500/30",
  },
  gold: {
    on_time: "bg-amber-500 text-white shadow-lg shadow-amber-500/30",
    late: "bg-amber-600 text-white shadow-lg shadow-amber-500/30",
    missed: "bg-amber-800 text-white shadow-lg shadow-amber-800/30",
  },
};

export default function PrayerCard({
  prayer,
  status,
  prayerTime,
  jamaah,
  isExempt,
  quality = {},
  missedReason = "",
  rawPrayerTime,
  isFriday = false,
  onStatusChange,
  onJamaahToggle,
  onQualitySave,
  onMissedReasonSave,
}) {
  const [qualityOpen, setQualityOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const isLocked = useMemo(() => {
    if (!rawPrayerTime) return false;
    const [h, m] = rawPrayerTime.split(":").map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(h, m, 0, 0);
    return now < prayerDate;
  }, [rawPrayerTime, now]);

  const lockedUntil = useMemo(() => {
    if (!rawPrayerTime || !isLocked) return null;
    const [h, m] = rawPrayerTime.split(":").map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(h, m, 0, 0);
    const diffMs = prayerDate - now;
    const totalMin = Math.floor(diffMs / 60000);
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    return hh > 0 ? `${hh}h ${mm}m` : `${mm}m`;
  }, [rawPrayerTime, isLocked, now]);

  const theme = isFriday ? "gold" : "default";
  const stl = STATUS_STYLES[theme][status] || STATUS_STYLES[theme].none;
  const dotColor = DOT_COLOR[theme][status] || DOT_COLOR[theme].none;
  const btnActive = BTN_ACTIVE[theme];

  const accent = isFriday
    ? {
        hoverBorder: "hover:border-amber-400",
        jamaahActive: "bg-amber-700 text-white border-amber-700",
        jamaahInactive:
          "border-border text-amber-800 dark:text-amber-300 bg-transparent",
        qualityBtn:
          "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700",
        statusBtnHover: "hover:bg-amber-100 dark:hover:bg-amber-900/40",
        statusText: "text-amber-500",
        statusTextLate: "text-amber-600",
        statusTextMissed: "text-amber-800",
        lockedBadge:
          "bg-amber-100 border-amber-300 text-amber-800 shadow-sm shadow-amber-300/40 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300",
        missedReasonBadge:
          "text-amber-800 bg-amber-50 dark:bg-amber-950/30 border-amber-200/60",
        alertBtn:
          "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200/60",
        btnInactive:
          "bg-amber-50/70 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300",
        lockedBtn:
          "bg-amber-50/25 dark:bg-amber-950/10 text-amber-600/45 dark:text-amber-400/35 border border-dashed border-amber-200/50",
      }
    : {
        hoverBorder: "hover:border-green-300",
        jamaahActive: "bg-green-600 text-primary-foreground border-green-600",
        jamaahInactive:
          "border-border text-green-700 dark:text-green-300 bg-transparent",
        qualityBtn:
          "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
        statusBtnHover: "hover:bg-green-100 dark:hover:bg-green-900/40",
        statusText: "text-green-600",
        statusTextLate: "text-amber-500",
        statusTextMissed: "text-red-500",
        lockedBadge:
          "bg-muted border-border text-muted-foreground dark:bg-zinc-800/60 dark:border-zinc-700",
        missedReasonBadge:
          "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200/60",
        alertBtn: "bg-red-50 dark:bg-red-950/30 text-red-400 border-red-200/60",
        btnInactive:
          "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
        lockedBtn: "bg-secondary/50 text-muted-foreground/40",
      };

  const handleStatus = (next) => {
    if (isExempt || isLocked) return;
    const newStatus = status === next ? "none" : next;
    onStatusChange(prayer, newStatus);
    if (newStatus === "missed") setTimeout(() => setReasonOpen(true), 300);
  };

  const khushu = quality?.khushu || 0;

  return (
    <>
      <div
        className={`rounded-2xl border-2 p-4 transition-all duration-300 hover:shadow-xl ${accent.hoverBorder} hover:-translate-y-0.5 ${stl.card} ${
          isExempt ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 ring-2 ring-white dark:ring-gray-900 rounded-full flex-shrink-0 ${dotColor} transition-colors duration-150`}
            />
            <div>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {PRAYER_NAMES[prayer]}
              </p>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {prayerTime || "—"}
              </p>

              {status === "on_time" && (
                <p className={`text-xs font-medium mt-1 ${accent.statusText}`}>
                  ✓ Completed
                </p>
              )}
              {status === "late" && (
                <p
                  className={`text-xs font-medium mt-1 ${accent.statusTextLate}`}
                >
                  ⏱ Completed Late
                </p>
              )}
              {status === "missed" && (
                <p
                  className={`text-xs font-medium mt-1 ${accent.statusTextMissed}`}
                >
                  ✕ Missed
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLocked && (
              <span
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${accent.lockedBadge}`}
              >
                <Clock size={11} strokeWidth={2.2} />
                {lockedUntil}
              </span>
            )}

            {!isLocked && status === "on_time" && khushu > 0 && (
              <div className="flex items-center gap-0.5">
                {Array(khushu)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
              </div>
            )}

            {!isLocked && status === "missed" && missedReason && (
              <span
                className={`text-[10px] font-medium px-3 py-1 rounded-full border ${accent.missedReasonBadge}`}
              >
                {missedReason}
              </span>
            )}

            {!isLocked && status === "on_time" && (
              <button
                onClick={() => onJamaahToggle(prayer)}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-full border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 ${
                  jamaah ? accent.jamaahActive : accent.jamaahInactive
                }`}
              >
                <Users size={10} />
                Jama'ah
              </button>
            )}

            {!isLocked && status === "missed" && (
              <button
                onClick={() => setReasonOpen(true)}
                className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all active:scale-90 ${accent.alertBtn}`}
              >
                <AlertCircle size={13} />
              </button>
            )}
          </div>
        </div>

        {isLocked ? (
          <div className="grid grid-cols-3 gap-2 opacity-80">
            {["On Time", "Late", "Missed"].map((label) => (
              <div
                key={label}
                className={`py-2.5 rounded-xl text-xs font-semibold text-center cursor-not-allowed select-none ${accent.lockedBtn}`}
              >
                {label}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {["on_time", "late", "missed"].map((btn) => (
              <button
                key={btn}
                onClick={() => handleStatus(btn)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
                  status === btn
                    ? btnActive[btn]
                    : `${accent.btnInactive} ${accent.statusBtnHover}`
                }`}
              >
                {btn === "on_time"
                  ? "On Time"
                  : btn === "late"
                    ? "Late"
                    : "Missed"}
              </button>
            ))}
          </div>
        )}

        {!isLocked && (status === "on_time" || status === "late") && (
          <button
            onClick={() => setQualityOpen(true)}
            className={`mt-2.5 w-full py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted border flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] ${accent.qualityBtn}`}
          >
            <Star size={11} />
            {khushu > 0
              ? `Quality logged (${khushu}/5)`
              : "Log quality (optional)"}
          </button>
        )}
      </div>

      <PrayerQualitySheet
        open={qualityOpen}
        onClose={() => setQualityOpen(false)}
        prayer={prayer}
        quality={quality}
        onSave={(q) => onQualitySave(prayer, q)}
      />
      <MissedReasonSheet
        open={reasonOpen}
        onClose={() => setReasonOpen(false)}
        prayer={prayer}
        currentReason={missedReason}
        onSave={(r) => onMissedReasonSave(prayer, r)}
      />
    </>
  );
}
