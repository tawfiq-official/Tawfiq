import React, { useState, useEffect, useMemo, useRef } from "react";
import { Users, Star, AlertCircle } from "lucide-react";
import { PRAYER_NAMES } from "@/lib/prayerUtils";
import PrayerQualitySheet from "@/components/PrayerQualitySheet";
import MissedReasonSheet from "@/components/MissedReasonSheet";

const STATUS_STYLES = {
  none: { card: "border-border bg-card" },
  on_time: {
    card: "border-green-600/40 bg-green-50 dark:bg-green-950/30 dark:border-green-700/50",
  },
  late: {
    card: "border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50",
  },
  missed: {
    card: "border-red-400/40 bg-red-50 dark:bg-red-950/30 dark:border-red-700/50",
  },
};

const DOT_COLOR = {
  none: "bg-muted-foreground/30",
  on_time: "bg-green-600",
  late: "bg-amber-400",
  missed: "bg-red-500",
};

const BTN_ACTIVE = {
  on_time: "bg-green-600 text-white shadow-sm",
  late: "bg-amber-400 text-white shadow-sm",
  missed: "bg-red-500 text-white shadow-sm",
};

export default function PrayerCard({
  prayer,
  status,
  prayerTime,
  jamaah,
  isExempt,
  quality = {},
  missedReason = "",
  rawPrayerTime, // e.g. "05:18" 24h format for lock validation
  onStatusChange,
  onJamaahToggle,
  onQualitySave,
  onMissedReasonSave,
}) {
  const [qualityOpen, setQualityOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Update clock every 30s for auto-unlock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Future lock: prayer hasn't started yet
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

  const stl = STATUS_STYLES[status] || STATUS_STYLES.none;

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
        className={`rounded-2xl border-2 p-4 transition-all duration-150 ${stl.card} ${isExempt ? "opacity-50 pointer-events-none" : ""}`}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${DOT_COLOR[status] || DOT_COLOR.none} transition-colors duration-150`}
            />
            <div>
              <p className="font-semibold text-foreground text-[15px] leading-tight">
                {PRAYER_NAMES[prayer]}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                {prayerTime || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Lock badge */}
            {isLocked && (
              <span className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-secondary border border-border flex items-center gap-1">
                🔒 {lockedUntil}
              </span>
            )}

            {/* Khushu stars indicator */}
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

            {/* Missed reason indicator */}
            {!isLocked && status === "missed" && missedReason && (
              <span className="text-[10px] text-red-500 font-medium px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200/60">
                {missedReason}
              </span>
            )}

            {!isLocked && status === "on_time" && (
              <button
                onClick={() => onJamaahToggle(prayer)}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-full border transition-all duration-150 active:scale-95 ${
                  jamaah
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground bg-transparent"
                }`}
              >
                <Users size={10} />
                Jama'ah
              </button>
            )}

            {!isLocked && status === "missed" && (
              <button
                onClick={() => setReasonOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-400 border border-red-200/60 transition-all active:scale-90"
              >
                <AlertCircle size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Status buttons */}
        {isLocked ? (
          <div className="grid grid-cols-3 gap-2">
            {["On Time", "Late", "Missed"].map((label) => (
              <div
                key={label}
                className="py-2.5 rounded-xl text-xs font-semibold bg-secondary/50 text-muted-foreground/40 text-center cursor-not-allowed select-none"
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
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all duration-100 active:scale-95 ${
                  status === btn
                    ? BTN_ACTIVE[btn]
                    : "bg-secondary text-muted-foreground hover:bg-muted"
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

        {/* Quality log button — only for completed prayers */}
        {!isLocked && (status === "on_time" || status === "late") && (
          <button
            onClick={() => setQualityOpen(true)}
            className="mt-2.5 w-full py-2 rounded-xl text-xs font-medium text-muted-foreground bg-secondary/70 hover:bg-muted border border-border/50 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
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
