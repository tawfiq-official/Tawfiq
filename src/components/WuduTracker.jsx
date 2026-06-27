import React, { useState, useEffect } from "react";
import { Droplets } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

const KEY = "tawfiq_wudu";

function getStored() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function status(lastTime) {
  if (!lastTime) return { label: "Unknown", color: "text-muted-foreground" };
  const mins = differenceInMinutes(new Date(), new Date(lastTime));
  if (mins < 60) return { label: "Likely Valid", color: "text-green-600" };
  if (mins < 180) return { label: "Check Required", color: "text-amber-500" };
  return { label: "Renew Wudu", color: "text-red-500" };
}

export default function WuduTracker() {
  const [data, setData] = useState(getStored);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  function markDone() {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const next = {
      lastTime: new Date().toISOString(),
      history: [
        { time: new Date().toISOString() },
        ...(data.history || []),
      ].slice(0, 10),
      dailyCounts: {
        ...data.dailyCounts,
        [todayKey]: ((data.dailyCounts || {})[todayKey] || 0) + 1,
      },
    };
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const st = status(data.lastTime);
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayCount = (data.dailyCounts || {})[todayKey] || 0;

  const timeAgo = data.lastTime
    ? (() => {
        const mins = differenceInMinutes(
          new Date(now),
          new Date(data.lastTime),
        );
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ${mins % 60}m ago`;
      })()
    : null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Droplets size={15} className="text-blue-500" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Wudu Tracker
        </p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-sm font-bold ${st.color}`}>{st.label}</p>
          {timeAgo && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last: {timeAgo}
            </p>
          )}
          {!data.lastTime && (
            <p className="text-xs text-muted-foreground">No record yet</p>
          )}
        </div>
        <div className="text-center bg-secondary rounded-xl px-3 py-2">
          <p className="text-lg font-bold text-foreground tabular-nums">
            {todayCount}
          </p>
          <p className="text-[10px] text-muted-foreground">Today</p>
        </div>
      </div>

      <button
        onClick={markDone}
        className="w-full bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
      >
        Wudu Completed
      </button>
    </div>
  );
}
