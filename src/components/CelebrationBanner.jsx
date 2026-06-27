import React, { useEffect, useState } from "react";

export default function CelebrationBanner({ log, streak }) {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!log) return;
    const prayers = log.prayers || {};
    const allOnTime = ["fajr", "dhuhr", "asr", "maghrib", "isha"].every(
      (p) => prayers[p] === "on_time",
    );

    let msg = null;
    if (allOnTime) msg = "Perfect Day — all 5 prayers on time.";
    else if (streak === 30) msg = "30-Day Streak — remarkable consistency.";
    else if (streak === 7) msg = "7-Day Streak — keep it going.";
    else if (streak === 100) msg = "100-Day Streak — MashaAllah.";

    if (msg) {
      const seenKey = `tawfiq_celebrated_${log.date}_${msg.slice(0, 10)}`;
      if (!localStorage.getItem(seenKey)) {
        setMessage(msg);
        setVisible(true);
        localStorage.setItem(seenKey, "1");
        setTimeout(() => setVisible(false), 5000);
      }
    }
  }, [log?.date, streak]);

  if (!visible || !message) return null;

  return (
    <div className="mx-4 mt-2">
      <div className="max-w-md mx-auto bg-primary/10 border border-primary/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary leading-snug">
          {message}
        </p>
        <button
          onClick={() => setVisible(false)}
          className="text-xs text-muted-foreground flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
