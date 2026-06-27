import React, { useState, useMemo } from "react";
import {
  Plus,
  Minus,
  CalendarDays,
  TrendingDown,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { useQaza } from "@/lib/useQaza";
import { PRAYER_NAMES, PRAYERS } from "@/lib/prayerUtils";
import BottomNav from "@/components/BottomNav";

function Counter({ name, count, onAdd, onSub, onSet }) {
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
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {count === 0 ? "All clear" : `${count} owed`}
        </p>
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
              className="w-20 text-center font-bold text-base bg-secondary border border-border rounded-xl px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring tabular-nums"
              autoFocus
            />
            <button
              onClick={confirmEdit}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white active:scale-90 transition-all"
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
              className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-muted text-muted-foreground disabled:opacity-30 transition-all active:scale-90"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={startEdit}
              className={`w-12 text-center font-bold text-lg tabular-nums transition-all ${count > 0 ? "text-foreground" : "text-muted-foreground/50"}`}
            >
              {count}
            </button>
            <button
              onClick={onAdd}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-90"
            >
              <Plus size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DebtForecast({ total, history }) {
  const forecast = useMemo(() => {
    if (total === 0) return null;

    // Calculate avg daily made up from history (decrements represent make-ups)
    // We look at days where the total went down vs previous saved total
    // Simple approach: assume user logs ~1 qaza/day if they've been using the app
    const avgDaily = history.avgDailyMadeUp || 0;

    const daysAtCurrent = avgDaily > 0 ? Math.ceil(total / avgDaily) : null;
    const daysAtPlus5 =
      avgDaily > 0 ? Math.ceil(total / (avgDaily + 5)) : Math.ceil(total / 5);
    const daysAtPlus10 = Math.ceil(total / 10);

    function formatDuration(days) {
      if (days <= 0) return "Done!";
      if (days < 30) return `${days} days`;
      if (days < 365) return `${Math.round(days / 30)} months`;
      return `${(days / 365).toFixed(1)} years`;
    }

    return {
      daysAtCurrent: daysAtCurrent ? formatDuration(daysAtCurrent) : null,
      daysAtPlus5: formatDuration(daysAtPlus5),
      daysAtPlus10: formatDuration(daysAtPlus10),
      avgDaily: avgDaily.toFixed(1),
    };
  }, [total, history]);

  if (!forecast) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown size={15} className="text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Debt Forecast
        </p>
      </div>

      <div className="space-y-2.5">
        {forecast.daysAtCurrent && (
          <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-secondary">
            <p className="text-sm text-muted-foreground">At current pace</p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {forecast.daysAtCurrent}
            </p>
          </div>
        )}
        <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-foreground font-medium">+5 daily extra</p>
          <p className="text-sm font-bold text-primary tabular-nums">
            {forecast.daysAtPlus5}
          </p>
        </div>
        <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-secondary">
          <p className="text-sm text-muted-foreground">+10 daily extra</p>
          <p className="text-sm font-bold text-foreground tabular-nums">
            {forecast.daysAtPlus10}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Every prayer made up counts. Go at your own pace.
      </p>
    </div>
  );
}

export default function Qaza() {
  const {
    qaza,
    total,
    loading,
    adjust,
    addFullDay,
    subtractFullDay,
    setAmount,
  } = useQaza();

  // History placeholder — avg daily made up (can be enhanced with actual history tracking)
  const history = { avgDailyMadeUp: 0 };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3.5">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-bold text-foreground">Qaza Prayers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track and make up missed prayers
          </p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Total */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Owed
          </p>
          <div className="flex items-end gap-2 mt-1.5">
            <p
              className={`text-5xl font-bold tabular-nums leading-none ${total > 0 ? "text-foreground" : "text-green-600"}`}
            >
              {loading ? "—" : total}
            </p>
            <p className="text-muted-foreground text-sm pb-1">prayers</p>
          </div>
          {total === 0 && !loading && (
            <p className="text-sm text-green-600 font-medium mt-2">
              All caught up — well done.
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={addFullDay}
              className="flex items-center justify-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-95"
            >
              <CalendarDays size={15} />+ Full Day (5)
            </button>
            <button
              onClick={subtractFullDay}
              disabled={total < 5}
              className="flex items-center justify-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
            >
              <CalendarDays size={15} />− Full Day (5)
            </button>
          </div>
        </div>

        {/* Debt Forecast */}
        {!loading && total > 0 && (
          <DebtForecast total={total} history={history} />
        )}

        {/* Per-prayer counters */}
        <div className="bg-card border border-border rounded-2xl px-5 py-1">
          <div className="flex items-center justify-between pt-4 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              By Prayer
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Edit3 size={10} /> tap count to set manually
            </p>
          </div>
          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-14 my-2 rounded-xl bg-muted animate-pulse"
                  />
                ))
            : PRAYERS.map((p) => (
                <Counter
                  key={p}
                  name={PRAYER_NAMES[p]}
                  count={qaza[`${p}_count`] || 0}
                  onAdd={() => adjust(p, 1)}
                  onSub={() => adjust(p, -1)}
                  onSet={(n) => setAmount(p, n)}
                />
              ))}
        </div>

        <p className="text-xs text-center text-muted-foreground px-4 pb-2">
          Add missed prayers from your past. Subtract one each time you make one
          up.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
