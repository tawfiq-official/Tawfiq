  import React, { useState, useEffect, useMemo } from "react";
  import { format } from "date-fns";
  import { useNavigate } from "react-router-dom";
  import { Settings, MapPin, RefreshCw, Pause, Plane } from "lucide-react";
  import PrayerCard from "@/components/PrayerCard";
  import SettingsModal from "@/components/SettingsModal";
  import NawafilSection from "@/components/NawafilSection";
  import QiblaCompass from "@/components/QiblaCompass";
  import RecoveryCard from "@/components/RecoveryCard";
  import RamadanSection from "@/components/RamadanSection";
  import BottomNav from "@/components/BottomNav";
  import OfflineBanner from "@/components/OfflineBanner";
  import EndOfDayReflectionCard from "@/components/EndOfDayReflectionCard";
  import CelebrationBanner from "@/components/CelebrationBanner";
  import NextPrayerHero from "@/components/NextPrayerHero";
  // import NearbyMosquesCard from "@/components/NearbyMosques";
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
    const isFriday = today.getDay() === 5;
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
      console.log(getCurrentLocation);
    }

    async function handleSetPrayerStatus(prayer, newStatus) {
      await setPrayerStatus(prayer, newStatus);
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
      <>
        <div
          className="min-h-screen bg-white/90
  dark:bg-background/90
  backdrop-blur-xl pb-28"
        >
          {/* Header */}
          <header
            className="relative border-b border-border/50 px-6 pb-5 bg-white dark:bg-background transition-all duration-700"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
          >
            <div className="max-w-md flex items-start justify-between self-start mt-1">
              <div>
                <h1
                  className={`text-[2rem] sm:text-[2.2rem] font-bold leading-tight tracking-tight ${
                    isFriday
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-zinc-900 dark:text-white"
                  }`}
                >
                  {format(today, "EEEE, MMMM d")}
                </h1>
                {hijriStr && (
                  <p
                    className={`mt-1 text-sm font-medium mt-0.5 ${
                      isFriday
                        ? "text-amber-600/80 dark:text-amber-400/70"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {hijriStr}
                  </p>
                )}
                <div
                  className="
      mt-1
      animate-in
      fade-in
      slide-in-from-left-2
      duration-500
    "
                >
                  <p
                    className={`text-lg font-semibold ${
                      isFriday ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {isFriday ? "🕌 Jumu'ah Mubarak" : "Assalamu Alaikum 🤲"}
                  </p>

                  {isFriday && (
                    <div className="mt-1 flex items-center gap-2 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                      <span className="text-xs font-medium text-amber-700">
                        Best day of the week
                      </span>
                    </div>
                  )}

                  <div className="mt-2 -ml-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                        isFriday
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-500/8 text-emerald-700"
                      }`}
                    >
                      🔥 {streak} Day Streak
                    </span>
                  </div>
                </div>
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
                  className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center transition-all duration-200 ${
                    isFriday
                      ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
                      : "bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:bg-background dark:border-zinc-700"
                  } hover:shadow-md`}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </header>

          <OfflineBanner />

          {/* Celebration banner */}
          {!loading && <CelebrationBanner log={log} streak={streak} />}

          {/* Window warning */}
          {warning && (
            <div className="sticky top-[61px] z-30 px-4">
              <div className="max-w-md mt-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm font-medium px-4 py-2.5 rounded-xl">
                ⏳ {warning}
              </div>
            </div>
          )}

          {/* Travel mode banner */}
          {isTravelMode && !loading && (
            <div className="px-4 pt-3">
              <div className="max-w-md bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 rounded-2xl p-3.5 text-sm text-amber-800 dark:text-amber-400">
                <span className="font-semibold">Travel Mode active.</span> Qasr
                (shortened prayers) and combining prayers is permissible.
              </div>
            </div>
          )}

          <div className="max-w-md px-4 pt-4 space-y-5">
            {/* Next Prayer Hero */}
            <NextPrayerHero
              rawTimings={rawTimings}
              calcMethod={settings.calculation_method}
              onQiblaOpen={() => setQiblaOpen(true)}
              isFriday={isFriday}
            />
            {/* <NearbyMosquesCard
            latitude={settings.latitude}
            longitude={settings.longitude}
          /> */}

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
                      className="
  h-32
  rounded-3xl
  bg-gradient-to-r
  from-gray-100
  via-gray-50
  to-gray-100
  animate-pulse
  "
                    />
                  ))
              : PRAYERS.map((prayer) => (
                  <PrayerCard
                    key={prayer}
                    prayer={prayer}
                    isFriday={isFriday}
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
                  isFriday={isFriday}
                />
              )}

            {/* Daily summary */}
            {!loading &&
              log &&
              !isExempt &&
              onTimeCount + lateCount + missedCount > 0 && (
                <div
                  className={`bg-gradient-to-br border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 ${
                    isFriday
                      ? "from-amber-50 to-white dark:from-amber-950/20 dark:to-card border-amber-200 dark:border-amber-800"
                      : "from-green-50 to-white dark:from-green-950/20 dark:to-card border-green-200 dark:border-green-800"
                  }`}
                >
                  <p
                    className={`text-[11px] uppercase tracking-[0.2em] font-bold mb-4 ${
                      isFriday
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-green-700 dark:text-green-400"
                    }`}
                  >
                    TODAY'S PROGRESS
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`text-center rounded-xl py-3 border ${
                        isFriday
                          ? "bg-white dark:bg-amber-950/20 border-amber-100 dark:border-amber-800"
                          : "bg-white dark:bg-green-950/20 border-green-100 dark:border-green-800"
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold tabular-nums ${
                          isFriday ? "text-amber-500" : "text-green-600"
                        }`}
                      >
                        {onTimeCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        On Time
                      </p>
                    </div>
                    <div
                      className={`text-center rounded-xl py-3 border ${
                        isFriday
                          ? "bg-white dark:bg-amber-950/20 border-amber-100 dark:border-amber-800"
                          : "bg-white dark:bg-green-950/20 border-green-100 dark:border-green-800"
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold tabular-nums ${
                          isFriday ? "text-amber-600" : "text-amber-500"
                        }`}
                      >
                        {lateCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Late</p>
                    </div>
                    <div
                      className={`text-center rounded-xl py-3 border ${
                        isFriday
                          ? "bg-white dark:bg-amber-950/20 border-amber-100 dark:border-amber-800"
                          : "bg-white dark:bg-green-950/20 border-green-100 dark:border-green-800"
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold tabular-nums ${
                          isFriday ? "text-amber-800" : "text-red-500"
                        }`}
                      >
                        {missedCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Missed
                      </p>
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
                isFriday={isFriday}
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
        </div>
        <BottomNav isFriday={isFriday} />
      </>
    );
  }
