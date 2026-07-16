import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Minus,
  Check,
  X,
  Calculator,
  Moon,
  Sun,
  Info,
  Trash2,
  Award,
  Clock,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

// ─── Native Zero-Dependency Confetti ──────────────────────────────────────────
const LocalConfetti = () => {
  const colors = [
    "#16a34a",
    "#d97706",
    "#ef4444",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];
  const pieces = useMemo(
    () =>
      Array.from({ length: 75 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${Math.random() * 2 + 2}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: `${Math.random() * 6 + 4}px`,
        height: `${Math.random() * 12 + 6}px`,
        rotation: `${Math.random() * 360}deg`,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-10%]"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation})`,
            animation: `confetti-fall ${p.animationDuration} linear ${p.animationDelay} forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ─── Ramadan Live Countdown Engine ───────────────────────────────────────────
function RamadanCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isRamadan, setIsRamadan] = useState(false);
  const [targetDate, setTargetDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    const monthNumberFormatter = new Intl.DateTimeFormat("en-u-ca-islamic", {
      month: "numeric",
    });
    const monthNameFormatter = new Intl.DateTimeFormat("en-u-ca-islamic", {
      month: "long",
    });
    const today = new Date();

    setCurrentMonth(monthNameFormatter.format(today));

    if (monthNumberFormatter.format(today) === "9") {
      setIsRamadan(true);
      return;
    }

    let nextDate = new Date(today);
    for (let i = 1; i <= 365; i++) {
      nextDate.setDate(nextDate.getDate() + 1);
      if (monthNumberFormatter.format(nextDate) === "9") {
        nextDate.setHours(0, 0, 0, 0);
        setTargetDate(nextDate);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!targetDate || isRamadan) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setIsRamadan(true);
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, isRamadan]);

  if (isRamadan) {
    return (
      <div className="bg-gradient-to-br from-primary to-green-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-4 border border-green-700">
        <Moon size={140} className="absolute -right-8 -bottom-8 opacity-10" />
        <div className="relative z-10">
          <p className="text-xs font-bold text-green-200 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Clock size={12} /> Ramadan Mode
          </p>
          <h2 className="text-3xl font-black mb-1">Ramadan Mubarak</h2>
          <p className="text-green-50 text-sm leading-relaxed">
            May Allah accept your fasting, prayers, and good deeds this month.
          </p>
        </div>
      </div>
    );
  }

  if (!targetDate) return null;

  const expectedDateString = targetDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.08] via-card to-primary/[0.03] border border-green-500/15 dark:border-green-800/30 rounded-3xl p-6 shadow-sm mb-5">
      {/* Background Decorative Elements */}
      <div className="absolute -right-10 -bottom-10 pointer-events-none opacity-[0.03] dark:opacity-[0.05] text-primary">
        <Moon size={200} strokeWidth={1} />
      </div>
      <div className="absolute left-6 bottom-6 pointer-events-none opacity-[0.02] dark:opacity-[0.04] text-primary">
        <Sparkles size={80} strokeWidth={1} />
      </div>

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Moon size={15} />
          </div>
          <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-widest">
            Countdown to Ramadan
          </h3>
        </div>
        {currentMonth && (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
            Currently {currentMonth}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 text-center mb-5 relative z-10">
        {/* Days */}
        <div className="bg-white/40 dark:bg-black/10 backdrop-blur-md rounded-2xl py-3.5 px-2 border border-white/50 dark:border-white/5 shadow-sm transition-all duration-300 hover:border-green-500/20">
          <p className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text">
            {timeLeft.days}
          </p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
            Days
          </p>
        </div>

        {/* Hours */}
        <div className="bg-white/40 dark:bg-black/10 backdrop-blur-md rounded-2xl py-3.5 px-2 border border-white/50 dark:border-white/5 shadow-sm transition-all duration-300 hover:border-green-500/20">
          <p className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text">
            {timeLeft.hours.toString().padStart(2, "0")}
          </p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
            Hours
          </p>
        </div>

        {/* Mins */}
        <div className="bg-white/40 dark:bg-black/10 backdrop-blur-md rounded-2xl py-3.5 px-2 border border-white/50 dark:border-white/5 shadow-sm transition-all duration-300 hover:border-green-500/20">
          <p className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
            Mins
          </p>
        </div>

        {/* Secs */}
        <div className="bg-primary/[0.08] dark:bg-primary/[0.12] rounded-2xl py-3.5 px-2 border border-primary/20 shadow-sm transition-all duration-300">
          <p className="text-3xl font-extrabold text-primary tracking-tight tabular-nums animate-pulse">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </p>
          <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1.5">
            Secs
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-3.5 border-t border-border/40 relative z-10 text-center">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <p className="text-[11px] text-muted-foreground font-semibold">
          Estimated starting date:{" "}
          <span className="text-foreground font-bold">{expectedDateString}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Counter Component ───────────────────────────────────────────────────────
function Counter({
  name,
  count,
  subtitle,
  onAdd,
  onSub,
  onSet,
  highlight = false,
  icon = null,
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  function startEdit() {
    setInputVal(String(count));
    setEditing(true);
  }

  function confirmEdit() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 0) onSet(n);
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  return (
    <div
      className={`flex items-center justify-between py-4 border-b border-border hover:bg-green-50 dark:hover:bg-green-950/20 px-3 transition-all duration-300 last:border-0 last:pb-0 first:pt-0 ${highlight ? "bg-primary/5 border border-primary/20 rounded-2xl p-4" : ""}`}
    >
      <div>
        <div className="flex items-center gap-1.5">
          {icon}
          <p
            className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"}`}
          >
            {name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {editing ? (
          <>
            <input
              type="number"
              min="0"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="w-20 text-center font-bold text-base bg-secondary border border-border rounded-xl px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
              autoFocus
            />
            <button
              onClick={confirmEdit}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-90 transition-all"
            >
              <Check size={13} />
            </button>
            <button
              onClick={cancelEdit}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground active:scale-90 transition-all"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onSub}
              disabled={count === 0}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-secondary hover:bg-red-50 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-all duration-300 active:scale-90"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={startEdit}
              className={`w-14 text-center text-2xl font-black tabular-nums transition-all ${count > 0 ? "text-foreground" : "text-muted-foreground/50"}`}
            >
              {count}
            </button>
            <button
              onClick={onAdd}
              className={`w-11 h-11 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-90 ${highlight ? "bg-primary text-primary-foreground" : "bg-green-700 hover:bg-green-800 text-white"}`}
            >
              <Plus size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Sawm Component ─────────────────────────────────────────────────────
export default function SawmTracker() {
  const [missedFasts, setMissedFasts] = useState(() =>
    parseInt(localStorage.getItem("sawm_missed") || "0"),
  );
  const [fidyah, setFidyah] = useState(() =>
    parseInt(localStorage.getItem("sawm_fidyah") || "0"),
  );
  const [voluntaryFasts, setVoluntaryFasts] = useState(() =>
    parseInt(localStorage.getItem("sawm_voluntary") || "0"),
  );

  const [baseline, setBaseline] = useState(() =>
    parseInt(localStorage.getItem("sawm_baseline") || "0"),
  );

  const [showConfetti, setShowConfetti] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const [yearsMissed, setYearsMissed] = useState("");
  const [extraDaysMissed, setExtraDaysMissed] = useState("");

  const prevMissedRef = useRef(missedFasts);

  useEffect(() => {
    localStorage.setItem("sawm_missed", missedFasts.toString());
    localStorage.setItem("sawm_fidyah", fidyah.toString());
    localStorage.setItem("sawm_voluntary", voluntaryFasts.toString());

    if (missedFasts > baseline) {
      setBaseline(missedFasts);
      localStorage.setItem("sawm_baseline", missedFasts.toString());
    }
  }, [missedFasts, fidyah, voluntaryFasts, baseline]);

  useEffect(() => {
    if (prevMissedRef.current > 0 && missedFasts === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    prevMissedRef.current = missedFasts;
  }, [missedFasts]);

  const progressPercent =
    baseline > 0
      ? Math.max(0, Math.min(100, ((baseline - missedFasts) / baseline) * 100))
      : 0;

  const sunnahData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isMonday = dayOfWeek === 1;
    const isThursday = dayOfWeek === 4;

    let hijriDay = 0;
    let hijriMonth = "";

    try {
      const formatter = new Intl.DateTimeFormat("en-u-ca-islamic", {
        day: "numeric",
        month: "long",
      });
      const parts = formatter.formatToParts(today);
      const dayPart = parts.find((p) => p.type === "day");
      const monthPart = parts.find((p) => p.type === "month");

      if (dayPart) hijriDay = parseInt(dayPart.value, 10);
      if (monthPart) hijriMonth = monthPart.value;
    } catch (e) {
      console.error("Hijri formatting not supported by browser", e);
    }

    const isWhiteDay = hijriDay >= 13 && hijriDay <= 15;
    const isSunnahDay = isMonday || isThursday || isWhiteDay;

    return {
      isMonday,
      isThursday,
      isWhiteDay,
      isSunnahDay,
      hijriDay,
      hijriMonth,
    };
  }, []);

  function applyWizard() {
    if (missedFasts > 0) {
      const confirmed = window.confirm(
        "Applying this calculation will overwrite your current tracking data. Proceed?",
      );
      if (!confirmed) return;
    }
    const years = parseInt(yearsMissed) || 0;
    const days = parseInt(extraDaysMissed) || 0;
    const totalMissed = years * 30 + days;

    setMissedFasts(totalMissed);
    setBaseline(totalMissed);
    localStorage.setItem("sawm_baseline", totalMissed.toString());
    setShowWizard(false);
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {showConfetti && <LocalConfetti />}

      {/* Setup Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-foreground">
                Calculate Debt
              </h2>
              <button
                onClick={() => setShowWizard(false)}
                className="w-8 h-8 flex items-center justify-center bg-secondary rounded-full text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Full Ramadans Missed
                </label>
                <input
                  type="number"
                  value={yearsMissed}
                  onChange={(e) =>
                    setYearsMissed(
                      e.target.value === "" ? "" : parseInt(e.target.value),
                    )
                  }
                  placeholder="e.g. 2"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                  Calculated as 30 days per year
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Specific Days Missed
                </label>
                <input
                  type="number"
                  value={extraDaysMissed}
                  onChange={(e) =>
                    setExtraDaysMissed(
                      e.target.value === "" ? "" : parseInt(e.target.value),
                    )
                  }
                  placeholder="e.g. 7"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={applyWizard}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                Apply Calculation
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Clear all missed fasts to zero?")) {
                    setMissedFasts(0);
                    setBaseline(0);
                    localStorage.setItem("sawm_baseline", "0");
                    setShowWizard(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 font-bold py-3.5 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
              >
                <Trash2 size={16} /> Clear All Debt to Zero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Fixed classes removed so it scrolls naturally */}
      <header className="bg-background border-b border-border px-6 py-5">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Sawm Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track missed and voluntary fasts
          </p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <RamadanCountdown />

        {/* Total Owed Card */}
        <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-card border border-green-100 dark:border-green-900 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Missed Ramadan Days
              </p>
              <div className="flex items-end gap-2 mt-1.5 mb-4">
                <p
                  className={`text-6xl font-black leading-none tabular-nums ${missedFasts > 0 ? "text-foreground" : "text-green-600"}`}
                >
                  {missedFasts}
                </p>
                <p className="text-green-700 dark:text-green-300 text-base pb-1 font-medium">
                  days owed
                </p>
              </div>
            </div>
            {baseline > 0 && missedFasts > 0 && (
              <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs font-bold px-3 py-1 rounded-full">
                {progressPercent.toFixed(1)}% cleared
              </div>
            )}
          </div>

          {baseline > 0 && missedFasts > 0 && (
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          )}

          {missedFasts === 0 && (
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-semibold mt-2">
              <Check size={14} /> All obligatory fasts cleared.
            </p>
          )}
        </div>

        {/* Obligatory Actions: Qaza + Fidyah */}
        <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 pl-1">
            Obligatory Duties
          </p>
          <div className="space-y-1">
            <Counter
              name="Make Up Fast (Qaza)"
              subtitle="Subtract from your debt"
              count={missedFasts}
              onAdd={() => setMissedFasts((m) => m + 1)}
              onSub={() => setMissedFasts((m) => Math.max(0, m - 1))}
              onSet={(n) => setMissedFasts(n)}
            />
            <Counter
              name="Fidyah (Meals Owed)"
              subtitle="For fasts that cannot be made up"
              count={fidyah}
              icon={<HeartHandshake size={14} className="text-amber-500" />}
              onAdd={() => setFidyah((m) => m + 1)}
              onSub={() => setFidyah((m) => Math.max(0, m - 1))}
              onSet={(n) => setFidyah(n)}
            />
          </div>

          <div className="pt-4 pb-1">
            <button
              onClick={() => setShowWizard(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-secondary hover:bg-muted text-foreground font-semibold border border-border transition-all active:scale-95 text-sm"
            >
              <Calculator size={15} className="text-muted-foreground" />{" "}
              Calculate Debt Wizard
            </button>
          </div>
        </div>

        {/* Sunnah Fasting Prompts */}
        <div
          className={`rounded-3xl p-5 shadow-sm border ${sunnahData.isSunnahDay ? "bg-primary/10 border-primary/30" : "bg-card border-border"}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Moon
              size={18}
              className={
                sunnahData.isSunnahDay
                  ? "text-primary"
                  : "text-muted-foreground"
              }
            />
            <p
              className={`text-sm font-bold tracking-wide ${sunnahData.isSunnahDay ? "text-primary" : "text-foreground"}`}
            >
              Sunnah Fasting
            </p>
          </div>

          {sunnahData.isSunnahDay ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground leading-relaxed font-medium">
                Today is an excellent day to observe a voluntary fast.
              </p>
              <div className="space-y-2">
                {(sunnahData.isMonday || sunnahData.isThursday) && (
                  <div className="flex items-center gap-2 text-sm text-foreground bg-background/50 px-3 py-2 rounded-lg border border-primary/20">
                    <Sun size={14} className="text-amber-500" /> Today is{" "}
                    {sunnahData.isMonday ? "Monday" : "Thursday"}
                  </div>
                )}
                {sunnahData.isWhiteDay && (
                  <div className="flex items-center gap-2 text-sm text-foreground bg-background/50 px-3 py-2 rounded-lg border border-primary/20">
                    <Moon size={14} className="text-blue-500" /> White Day (
                    {sunnahData.hijriDay} {sunnahData.hijriMonth})
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Prophet (ﷺ) encouraged fasting on Mondays, Thursdays, and the
              13th, 14th, and 15th of the lunar month (White Days).
            </p>
          )}
          {sunnahData.hijriDay > 0 && !sunnahData.isSunnahDay && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border flex items-center gap-1.5">
              <Info size={12} /> Current lunar date is roughly{" "}
              {sunnahData.hijriDay} {sunnahData.hijriMonth}.
            </p>
          )}
        </div>

        {/* Voluntary (Nafl) Tracker */}
        <div className="bg-white dark:bg-card border border-green-100 dark:border-green-900 rounded-3xl p-3 shadow-sm mb-6">
          <Counter
            name="Voluntary Fasts (Nafl)"
            subtitle="Track your extra fasts"
            count={voluntaryFasts}
            onAdd={() => setVoluntaryFasts((v) => v + 1)}
            onSub={() => setVoluntaryFasts((v) => Math.max(0, v - 1))}
            onSet={(n) => setVoluntaryFasts(n)}
            highlight={true}
          />
          {voluntaryFasts > 0 && (
            <div className="px-4 pb-2 pt-1 flex items-center gap-2 text-xs font-medium text-primary">
              <Award size={14} /> May Allah accept your {voluntaryFasts}{" "}
              voluntary fast{voluntaryFasts > 1 ? "s" : ""}.
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
