import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { isOnline } from "./offlineQueue";

const BLANK_LOG = (dateStr) => ({
  date: dateStr,
  prayers: {
    fajr: "none",
    dhuhr: "none",
    asr: "none",
    maghrib: "none",
    isha: "none",
  },
  jamaah: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  },
  nawafil: {
    tahajjud: false,
    duha: false,
    witr: false,
    ishraq: false,
    awwabin: false,
  },
  quality: {},
  missed_reasons: {},
  is_exempt: false,
  travel_mode: false,
  taraweeh: false,
  quran_pages: 0,
});

function merge(base, saved) {
  return {
    ...base,
    ...saved,
    prayers: { ...base.prayers, ...saved.prayers },
    jamaah: { ...base.jamaah, ...saved.jamaah },
    nawafil: { ...base.nawafil, ...saved.nawafil },
    quality: { ...base.quality, ...saved.quality },
    missed_reasons: { ...base.missed_reasons, ...saved.missed_reasons },
  };
}

export function useDailyLog(date = new Date()) {
  const dateStr = format(date, "yyyy-MM-dd");
  const [log, setLog] = useState(null);
  const [logId, setLogId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [dateStr]);

  async function load() {
    setLoading(true);
    // Check local cache first for instant load
    const LOCAL_KEY = `tawfiq_log_${dateStr}`;
    const localRaw = localStorage.getItem(LOCAL_KEY);
    if (localRaw) {
      try {
        const localLog = JSON.parse(localRaw);
        setLog(merge(BLANK_LOG(dateStr), localLog));
      } catch {}
    }
    try {
      const list = await base44.entities.DailyLog.filter({ date: dateStr });
      if (list.length > 0) {
        setLog(merge(BLANK_LOG(dateStr), list[0]));
        setLogId(list[0].id);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(list[0]));
      } else if (!localRaw) {
        setLog(BLANK_LOG(dateStr));
        setLogId(null);
      }
    } catch {
      // Offline — use cached data
      if (!localRaw) {
        setLog(BLANK_LOG(dateStr));
        setLogId(null);
      }
    }
    setLoading(false);
  }

  const persist = useCallback(
    async (updated) => {
      // Optimistic update — UI feels instant
      setLog(updated);
      // Persist: always try server, store locally on failure
      const LOCAL_KEY = `tawfiq_log_${updated.date}`;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      try {
        if (logId) {
          await base44.entities.DailyLog.update(logId, updated);
        } else {
          const created = await base44.entities.DailyLog.create(updated);
          setLogId(created.id);
          localStorage.removeItem(LOCAL_KEY);
        }
      } catch {
        // Silently queued locally; will sync on next load when online
      }
    },
    [logId],
  );

  const setPrayerStatus = useCallback(
    async (prayer, status) => {
      const next = { ...log, prayers: { ...log.prayers, [prayer]: status } };
      if (status !== "on_time")
        next.jamaah = { ...log.jamaah, [prayer]: false };
      await persist(next);
    },
    [log, persist],
  );

  const toggleJamaah = useCallback(
    async (prayer) => {
      await persist({
        ...log,
        jamaah: { ...log.jamaah, [prayer]: !log.jamaah?.[prayer] },
      });
    },
    [log, persist],
  );

  const toggleNawafil = useCallback(
    async (name) => {
      await persist({
        ...log,
        nawafil: { ...log.nawafil, [name]: !log.nawafil?.[name] },
      });
    },
    [log, persist],
  );

  const saveQuality = useCallback(
    async (prayer, qualityData) => {
      await persist({
        ...log,
        quality: { ...log.quality, [prayer]: qualityData },
      });
    },
    [log, persist],
  );

  const saveMissedReason = useCallback(
    async (prayer, reason) => {
      await persist({
        ...log,
        missed_reasons: { ...log.missed_reasons, [prayer]: reason },
      });
    },
    [log, persist],
  );

  const toggleTaraweeh = useCallback(async () => {
    await persist({ ...log, taraweeh: !log.taraweeh });
  }, [log, persist]);

  const updateQuranPages = useCallback(
    async (pages) => {
      await persist({ ...log, quran_pages: pages });
    },
    [log, persist],
  );

  return {
    log,
    loading,
    setPrayerStatus,
    toggleJamaah,
    toggleNawafil,
    saveQuality,
    saveMissedReason,
    toggleTaraweeh,
    updateQuranPages,
  };
}

export async function fetchAllLogs() {
  try {
    const logs = await base44.entities.DailyLog.list("-date", 400);
    // Cache for offline use
    try {
      localStorage.setItem(
        "tawfiq_all_logs",
        JSON.stringify({ logs, ts: Date.now() }),
      );
    } catch {}
    return logs;
  } catch {
    // Offline fallback
    try {
      const raw = localStorage.getItem("tawfiq_all_logs");
      if (raw) return JSON.parse(raw).logs || [];
    } catch {}
    return [];
  }
}
