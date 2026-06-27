import React, { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { CALCULATION_METHODS } from "@/lib/prayerUtils";

// Makkah images per prayer (free Unsplash URLs, always valid)
// Replace this URL with your preferred simple Hajj image link
const simpleHajjBg =
  "https://images.unsplash.com/photo-1583057577582-748987391515?w=800&q=80";

const BG = {
  fajr: simpleHajjBg,
  dhuhr: simpleHajjBg,
  asr: simpleHajjBg,
  maghrib: simpleHajjBg,
  isha: simpleHajjBg,
  default: simpleHajjBg,
};

function parseTimeToDate(timeStr) {
  if (!timeStr) return null;
  const [h, min] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, min, 0, 0);
  return d;
}

function getNextPrayer(rawTimings) {
  if (!rawTimings) return null;
  const now = new Date();
  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  for (const name of order) {
    const t = parseTimeToDate(rawTimings[name]);
    if (t && t > now)
      return {
        name: name.toLowerCase(),
        label: name,
        time: t,
        raw: rawTimings[name],
      };
  }
  // All passed → next is Fajr tomorrow
  const t = parseTimeToDate(rawTimings["Fajr"]);
  if (t) {
    t.setDate(t.getDate() + 1);
  }
  return { name: "fajr", label: "Fajr", time: t, raw: rawTimings["Fajr"] };
}

function getStatus(nextPrayer) {
  if (!nextPrayer?.time) return null;
  const diffMs = nextPrayer.time - new Date();
  const diffMin = diffMs / 60000;
  if (diffMs <= 0)
    return { label: "Time Entered", color: "bg-red-500", dot: "bg-red-400" };
  if (diffMin <= 15)
    return {
      label: "Starting Soon",
      color: "bg-amber-500",
      dot: "bg-amber-400",
    };
  return { label: "Upcoming", color: "bg-green-600", dot: "bg-green-400" };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatCountdown(ms) {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h: pad2(h), m: pad2(m), s: pad2(s) };
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return "--:--";
  const [h, min] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${pad2(min)} ${period}`;
}

const NextPrayerHero = memo(function NextPrayerHero({
  rawTimings,
  calcMethod,
}) {
  const [countdown, setCountdown] = useState({ h: "--", m: "--", s: "--" });
  const [status, setStatus] = useState(null);
  const timerRef = useRef(null);

  const next = rawTimings ? getNextPrayer(rawTimings) : null;
  const methodName =
    CALCULATION_METHODS.find((m) => m.id === calcMethod)?.name ||
    "Standard Method";
  const bgUrl = BG[next?.name] || BG.default;

  useEffect(() => {
    if (!next?.time) return;
    function tick() {
      const ms = next.time - new Date();
      setCountdown(formatCountdown(ms));
      setStatus(getStatus(next));
    }
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [next?.name, next?.time?.getTime()]);

  const st = status || getStatus(next);

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-xl"
      style={{ minHeight: 220 }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage: `url(${bgUrl})`,
          willChange: "transform",
          animation: "heroZoom 20s ease-in-out infinite alternate",
        }}
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-primary/10" />

      {/* Content */}
      <div className="relative px-5 pt-5 pb-5 flex flex-col gap-3">
        {/* Top row: status + method */}
        <div className="flex items-center justify-between">
          {st ? (
            <span
              className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full text-white ${st.color}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${st.dot}`}
              />
              {st.label}
            </span>
          ) : (
            <span className="text-xs text-white/60">Loading…</span>
          )}
          {rawTimings && (
            <span className="text-[10px] text-white/60 text-right max-w-[140px] leading-tight">
              {methodName}
            </span>
          )}
        </div>

        {/* Prayer name + time */}
        <div>
          <p className="text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-1">
            Next Prayer
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-4xl font-black text-white leading-none">
              {next?.label || "—"}
            </p>
            <p className="text-lg font-bold text-white/80">
              {next ? formatDisplayTime(next.raw) : ""}
            </p>
          </div>
        </div>

        {/* Countdown */}
        {next && (
          <div className="flex items-center gap-2">
            {[
              ["h", "Hours"],
              ["m", "Min"],
              ["s", "Sec"],
            ].map(([key, label]) => (
              <div
                key={key}
                className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 min-w-[52px]"
              >
                <span className="text-2xl font-black text-white tabular-nums leading-none">
                  {countdown[key]}
                </span>
                <span className="text-[9px] text-white/60 mt-0.5 uppercase tracking-wider">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-1">
          <Link
            to="/quran"
            className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-white/25 transition-colors active:scale-95"
          >
            <BookOpen size={13} /> Quran
          </Link>
          <Link
            to="/intelligence"
            className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-white/25 transition-colors active:scale-95"
          >
            <Sparkles size={13} /> Mentor
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1.1); }
          to   { transform: scale(1.18); }
        }
      `}</style>
    </div>
  );
});

export default NextPrayerHero;
