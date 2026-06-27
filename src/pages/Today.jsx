import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Settings, MapPin, RefreshCw, Pause, Plane } from "lucide-react";
import PrayerCard from "@/components/PrayerCard";
import SettingsModal from "@/components/SettingsModal";
import NawafilSection from "@/components/NawafilSection";
import QiblaCompass from "@/components/QiblaCompass";
import QiblaCard from "@/components/QiblaCard";
import RecoveryCard from "@/components/RecoveryCard";
import RamadanSection from "@/components/RamadanSection";
import BottomNav from "@/components/BottomNav";
import OfflineBanner from "@/components/OfflineBanner";
import EndOfDayReflectionCard from "@/components/EndOfDayReflectionCard";
import CelebrationBanner from "@/components/CelebrationBanner";
import UndoBanner, { useUndoAction } from "@/components/UndoBanner";
import NextPrayerHero from "@/components/NextPrayerHero";
import IntelligencePreviewCard from "@/components/IntelligencePreviewCard";
import { useDailyLog, fetchAllLogs } from "@/lib/useDailyLog";
import { useSettings } from "@/lib/useSettings";
import { useQaza } from "@/lib/useQaza";
import { computeStreaks } from "@/lib/streakUtils";
import {
  fetchPrayerTimes,
  fetchHijriDate,
  getCurrentLocation,
  formatTime12h,
  PRAYERS,
  scheduleWindowWarnings,
  schedulePrayerNotifications,
} from "@/lib/prayerUtils";

export default function Today() {
  const today = new Date();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState({});
  const [rawTimings, setRawTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");
  const [warning, setWarning] = useState(null);
  const [allLogs, setAllLogs] = useState([]);

  const { settings, updateSettings, loading: sLoading } = useSettings();
  const {
    log,
    loading: lLoading,
    setPrayerStatus,
    toggleJamaah,
    toggleNawafil,
    saveQuality,
    saveMissedReason,
    toggleTaraweeh,
    updateQuranPages,
  } = useDailyLog(today);
  const { total: qazaTotal } = useQaza();
  const {
    pending: undoPending,
    push: pushUndo,
    doUndo,
    dismiss: dismissUndo,
  } = useUndoAction();

  const isExempt = settings.exempt_mode;
  const isTravelMode = settings.travel_mode;

  useEffect(() => {
    if (
      !sLoading &&
      !settings.onboarding_done &&
      !localStorage.getItem("tawfiq_onboarding_done")
    ) {
      navigate("/onboarding");
    }
  }, [sLoading, settings.onboarding_done]);

  useEffect(() => {
    fetchHijriDate(today)
      .then((h) => {
        setHijriDate(h);
        if (h)
          localStorage.setItem("hijri_month", h.month.number?.toString() || "");
      })
      .catch(() => {});
    fetchAllLogs()
      .then(setAllLogs)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (settings.latitude && settings.longitude)
      loadTimes(settings.latitude, settings.longitude);
  }, [settings.latitude, settings.longitude, settings.calculation_method]);

  useEffect(() => {
    if (!rawTimings || !settings.notifications_on) return;
    const cancel = schedulePrayerNotifications(
      rawTimings,
      PRAYERS,
      settings.notification_mins || 15,
    );
    return cancel;
  }, [rawTimings, settings.notifications_on, settings.notification_mins]);

  useEffect(() => {
    if (!rawTimings) return;
    const cancel = scheduleWindowWarnings(rawTimings, PRAYERS, (prayer) => {
      const name = prayer.charAt(0).toUpperCase() + prayer.slice(1);
      setWarning(`30 minutes left for ${name}`);
      setTimeout(() => setWarning(null), 8000);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Salah Reminder", {
          body: `30 minutes left for ${name} prayer`,
          icon: "/favicon.ico",
        });
      }
    });
    return cancel;
  }, [rawTimings]);

  async function loadTimes(lat, lon) {
    const data = await fetchPrayerTimes(
      lat,
      lon,
      settings.calculation_method,
      today,
    );
    setRawTimings(data?.timings);
    const t = data?.timings;
    if (t) {
      setPrayerTimes({
        fajr: formatTime12h(t.Fajr),
        dhuhr: formatTime12h(t.Dhuhr),
        asr: formatTime12h(t.Asr),
        maghrib: formatTime12h(t.Maghrib),
        isha: formatTime12h(t.Isha),
      });
    }
  }

  async function handleLocation() {
    setLocStatus("loading");
    const pos = await getCurrentLocation();
    await updateSettings({ latitude: pos.lat, longitude: pos.lon });
    await loadTimes(pos.lat, pos.lon);
    setLocStatus("done");
    if ("Notification" in window && Notification.permission === "default")
      Notification.requestPermission();
  }

  // Undo-wrapped prayer status setter
  async function handleSetPrayerStatus(prayer, newStatus) {
    const prevStatus = log?.prayers?.[prayer] || "none";
    await setPrayerStatus(prayer, newStatus);
    if (newStatus !== "none" && prevStatus !== newStatus) {
      const label = `${prayer.charAt(0).toUpperCase() + prayer.slice(1)} marked as ${newStatus === "on_time" ? "On Time" : newStatus}.`;
      pushUndo(label, () => setPrayerStatus(prayer, prevStatus));
    }
  }

  const hijriStr = hijriDate
    ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} AH`
    : "";
  const loading = sLoading || lLoading;

  const onTimeCount = log
    ? Object.values(log.prayers || {}).filter((v) => v === "on_time").length
    : 0;
  const lateCount = log
    ? Object.values(log.prayers || {}).filter((v) => v === "late").length
    : 0;
  const missedCount = log
    ? Object.values(log.prayers || {}).filter((v) => v === "missed").length
    : 0;

  const todayStr = format(today, "yyyy-MM-dd");
  const currentHour = today.getHours();
  const ishaLogged = log?.prayers?.isha && log.prayers.isha !== "none";
  const showEOD =
    !loading && !isExempt && log && (ishaLogged || currentHour >= 20);

  const { current: streak } = useMemo(() => computeStreaks(allLogs), [allLogs]);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {format(today, "EEEE, MMMM d")}
            </h1>
            {hijriStr && (
              <p className="text-xs text-muted-foreground mt-0.5">{hijriStr}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExempt && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
                <Pause size={10} /> Exempt
              </span>
            )}
            {isTravelMode && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                <Plane size={10} /> Travel
              </span>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </header>

      <OfflineBanner />

      {/* Celebration banner */}
      {!loading && <CelebrationBanner log={log} streak={streak} />}

      {/* Undo banner */}
      <UndoBanner
        pending={undoPending}
        onUndo={doUndo}
        onDismiss={dismissUndo}
      />

      {/* Window warning */}
      {warning && (
        <div className="sticky top-[61px] z-30 px-4">
          <div className="max-w-md mx-auto mt-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm font-medium px-4 py-2.5 rounded-xl">
            ⏳ {warning}
          </div>
        </div>
      )}

      {/* Travel mode banner */}
      {isTravelMode && !loading && (
        <div className="px-4 pt-3">
          <div className="max-w-md mx-auto bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 rounded-2xl p-3.5 text-sm text-amber-800 dark:text-amber-400">
            <span className="font-semibold">Travel Mode active.</span> Qasr
            (shortened prayers) and combining prayers is permissible.
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-4 space-y-3">
        {/* Next Prayer Hero */}
        <NextPrayerHero
          rawTimings={rawTimings}
          calcMethod={settings.calculation_method}
        />

        {/* Qibla Card */}
        <QiblaCard
          latitude={settings.latitude}
          longitude={settings.longitude}
          onOpen={() => setQiblaOpen(true)}
        />

        {/* Intelligence Preview */}
        {!loading && allLogs.length > 0 && (
          <IntelligencePreviewCard logs={allLogs} />
        )}

        {/* Location banner */}
        {!settings.latitude && (
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-4">
            <MapPin size={17} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Enable Location
              </p>
              <p className="text-xs text-muted-foreground">
                For accurate local prayer times
              </p>
            </div>
            <button
              onClick={handleLocation}
              disabled={locStatus === "loading"}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
            >
              {locStatus === "loading" ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                "Allow"
              )}
            </button>
          </div>
        )}

        {/* Prayer cards */}
        {loading
          ? Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-muted animate-pulse"
                />
              ))
          : PRAYERS.map((prayer) => (
              <PrayerCard
                key={prayer}
                prayer={prayer}
                status={log?.prayers?.[prayer] || "none"}
                prayerTime={prayerTimes[prayer]}
                rawPrayerTime={
                  rawTimings
                    ? rawTimings[
                        prayer.charAt(0).toUpperCase() + prayer.slice(1)
                      ]
                    : undefined
                }
                jamaah={log?.jamaah?.[prayer] || false}
                quality={log?.quality?.[prayer] || {}}
                missedReason={log?.missed_reasons?.[prayer] || ""}
                isExempt={isExempt}
                onStatusChange={handleSetPrayerStatus}
                onJamaahToggle={toggleJamaah}
                onQualitySave={saveQuality}
                onMissedReasonSave={saveMissedReason}
              />
            ))}

        {/* Recovery card */}
        {!loading &&
          !isExempt &&
          log &&
          (missedCount > 0 ||
            Object.values(log.prayers || {}).some((s) => s === "none")) && (
            <RecoveryCard
              log={log}
              prayerTimes={prayerTimes}
              qazaTotal={qazaTotal}
            />
          )}

        {/* Daily summary */}
        {!loading &&
          log &&
          !isExempt &&
          onTimeCount + lateCount + missedCount > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Today
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center bg-green-50 dark:bg-green-950/30 rounded-xl py-3">
                  <p className="text-2xl font-bold text-green-600 tabular-nums">
                    {onTimeCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    On Time
                  </p>
                </div>
                <div className="text-center bg-amber-50 dark:bg-amber-950/30 rounded-xl py-3">
                  <p className="text-2xl font-bold text-amber-500 tabular-nums">
                    {lateCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Late</p>
                </div>
                <div className="text-center bg-red-50 dark:bg-red-950/30 rounded-xl py-3">
                  <p className="text-2xl font-bold text-red-500 tabular-nums">
                    {missedCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Missed</p>
                </div>
              </div>
            </div>
          )}

        {/* Ramadan section */}
        {!loading && log && (
          <RamadanSection
            log={log}
            quranGoal={settings.quran_daily_goal || 2}
            onToggleTaraweeh={toggleTaraweeh}
            onUpdateQuranPages={updateQuranPages}
          />
        )}

        {/* Nawafil */}
        {!loading && (
          <NawafilSection
            nawafil={log?.nawafil || {}}
            onToggle={toggleNawafil}
          />
        )}

        {/* End of Day Reflection */}
        {showEOD && <EndOfDayReflectionCard log={log} todayStr={todayStr} />}
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />
      <QiblaCompass
        open={qiblaOpen}
        onClose={() => setQiblaOpen(false)}
        latitude={settings.latitude}
        longitude={settings.longitude}
      />
      <BottomNav />
    </div>
  );
}
