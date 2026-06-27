import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      setShowBack(true);
      setTimeout(() => setShowBack(false), 3000);
    }
    function handleOffline() {
      setOnline(false);
      setShowBack(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online && !showBack) return null;

  return (
    <div className={`sticky top-[61px] z-30 px-4 pt-2`}>
      <div
        className={`max-w-md mx-auto flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl ${
          online
            ? "bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
            : "bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-400"
        }`}
      >
        {online ? <Wifi size={14} /> : <WifiOff size={14} />}
        {online
          ? "Back online — syncing your prayers…"
          : "Offline — prayers saved locally"}
      </div>
    </div>
  );
}
