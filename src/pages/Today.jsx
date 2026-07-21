import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  MapPin,
  RefreshCw,
  Pause,
  Plane,
  Moon,
  ChevronRight,
} from "lucide-react";
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
  }, [sLoading, settings.onboarding_done, navigate]);

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

  const loading = sLoading || lLoading;
  const currentHour = today.getHours();
  const todayStr = format(today, "yyyy-MM-dd");

  const onTimeCount = log
    ? Object.values(log.prayers || {}).filter((v) => v === "on_time").length
    : 0;
  const lateCount = log
    ? Object.values(log.prayers || {}).filter((v) => v === "late").length
    : 0;
  const completedPrayers = onTimeCount + lateCount;
  const remaining = 5 - completedPrayers;
  const { current: streak } = useMemo(() => computeStreaks(allLogs), [allLogs]);

  // --- Context Engine Logic ---

  const hijriMonthEn = hijriDate?.month?.en || "";
  const isRamadan = hijriMonthEn === "Ramadan";

  // 1. Smart Date Line
  let dateDisplay = format(today, "EEEE");
  if (isRamadan && hijriDate) {
    dateDisplay = `Ramadan Day ${hijriDate.day}`;
  } else if (isFriday && hijriDate) {
    dateDisplay = `Jumu'ah • ${hijriDate.day} ${hijriMonthEn}`;
  } else if (hijriDate) {
    dateDisplay = `${format(today, "EEEE")} • ${hijriDate.day} ${hijriMonthEn}`;
  }

  // 2. Contextual Main Greeting
  const dynamicGreeting = useMemo(() => {
    if (completedPrayers === 5)
      return { ar: "الحمد لله", en: "All prayers completed today" };
    if (isRamadan) return { ar: "رمضان مبارك", en: "Ramadan Mubarak" };
    if (isFriday) return { ar: "جمعة مباركة", en: "Jumu'ah Mubarak" };
    return { ar: "السلام عليكم", en: "Assalamu Alaikum" };
  }, [completedPrayers, isFriday, isRamadan]);

  // 3. Today's Focus Engine (Replaces the generic "Today's Salah" chip)
  let focusText = "";
  if (completedPrayers === 5) {
    focusText = "May Allah accept your worship";
  } else if (isFriday && currentHour < 18) {
    focusText = "Don't forget Surah Al-Kahf";
  } else if (qazaTotal > 0 && currentHour > 12) {
    focusText = `Recover your ${qazaTotal} Qaza prayers`;
  } else if (streak >= 3 && completedPrayers === 0) {
    focusText = `Maintain your ${streak}-day streak`;
  } else if (remaining === 5) {
    focusText = "Begin your day with Fajr";
  } else {
    focusText = "Protect your remaining prayers";
  }

  const ishaLogged = log?.prayers?.isha && log.prayers.isha !== "none";
  const showEOD =
    !loading && !isExempt && log && (ishaLogged || currentHour >= 20);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="min-h-screen bg-[#F9F9F7] dark:bg-background pb-28">
        {/* Glassmorphism Header */}
        <header
          className="relative overflow-hidden border-b border-emerald-900/[0.04] dark:border-emerald-100/[0.04] px-6 pb-5 bg-gradient-to-b from-white/95 to-[#F9F9F7]/95 dark:from-background/95 dark:to-background/90 backdrop-blur-xl transition-all duration-700"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
        >
          {/* Faint Islamic Geometry Signature */}
          <div className="absolute -right-10 -top-10 opacity-[0.025] dark:opacity-[0.015] text-emerald-950 dark:text-emerald-100 pointer-events-none select-none transform -rotate-6">
            <svg
              width="220"
              height="220"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>

          <div className="relative z-10 max-w-md flex flex-col self-start mt-1">
            {/* Top Row: Contextual Date Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon
                  size={15}
                  className={
                    isFriday
                      ? "text-amber-800/60"
                      : "text-emerald-800/60 dark:text-emerald-300/60"
                  }
                  strokeWidth={2.5}
                />
                <h1
                  className={`text-sm font-bold tracking-wider uppercase opacity-80 ${
                    isFriday
                      ? "text-amber-800 dark:text-amber-400"
                      : "text-emerald-900 dark:text-emerald-400"
                  }`}
                >
                  {dateDisplay}
                </h1>
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
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-transparent text-emerald-900/40 hover:bg-black/[0.04] dark:text-emerald-100/40 dark:hover:bg-white/10"
                >
                  <Settings size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {/* Middle Container: Identity & Interactive Arc */}
            <div className="flex items-center justify-between mt-3.5">
              {/* Left Column: Contextual Greeting */}
              <div className="flex flex-col items-start min-h-[76px] justify-center">
                <span
                  className={`text-[2.2rem] font-bold leading-none mb-1 tracking-tight select-none font-arabic ${
                    completedPrayers === 5 || isFriday
                      ? "text-amber-800"
                      : "text-emerald-900 dark:text-emerald-200"
                  }`}
                  style={{ lineHeight: "1.2" }}
                >
                  {dynamicGreeting.ar}
                </span>
                <span
                  className={`text-md font-medium tracking-wide ${
                    completedPrayers === 5 || isFriday
                      ? "text-amber-800/70"
                      : "text-emerald-900/60 dark:text-emerald-100/60"
                  }`}
                >
                  {dynamicGreeting.en}
                </span>
              </div>

              {/* Right Column: Interactive Progress Ring */}
              <button
                onClick={() =>
                  window.scrollTo({ top: 300, behavior: "smooth" })
                }
                className="relative w-16 h-16 flex items-center justify-center select-none shrink-0 mr-1 bg-white/40 dark:bg-white/5 rounded-full p-1 shadow-inner hover:scale-105 active:scale-95 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                aria-label="Scroll to today's prayers"
              >
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="transparent"
                    className="text-emerald-900/[0.04] dark:text-white/[0.04]"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (completedPrayers / 5) * 163.36}
                    strokeLinecap="round"
                    className={`${completedPrayers === 5 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center leading-none mt-0.5">
                  <span
                    className={`text-base font-bold tracking-tighter ${completedPrayers === 5 ? "text-amber-600 dark:text-amber-400" : "text-emerald-950 dark:text-white"}`}
                  >
                    {completedPrayers}/5
                  </span>
                </div>
              </button>
            </div>

            {/* Bottom Row: Today's Focus Action Chip */}
            <div className="mt-5 self-start">
              <button
                onClick={() =>
                  window.scrollTo({ top: 260, behavior: "smooth" })
                }
                className={`relative overflow-hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all group shadow-[0_1px_4px_rgba(0,0,0,0.01)] ${
                  completedPrayers === 5
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400"
                    : isFriday
                      ? "bg-amber-50/70 border-amber-900/5 text-amber-900 dark:bg-amber-950/30 dark:border-amber-100/10 dark:text-amber-300"
                      : "bg-emerald-50/70 border-emerald-900/5 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-100/10 dark:text-emerald-400"
                } hover:bg-white/90 dark:hover:bg-white/10 active:scale-[0.98] focus:outline-none`}
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent pointer-events-none"></div>
                <span>Today's Focus</span>
                <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                <span className="normal-case font-semibold tracking-normal flex items-center gap-1">
                  {focusText}{" "}
                  <ChevronRight
                    size={13}
                    className="opacity-60 group-hover:translate-x-0.5 transition-transform"
                  />
                </span>
              </button>
            </div>
          </div>
        </header>

        <OfflineBanner />

        {!loading && <CelebrationBanner log={log} streak={streak} />}

        {warning && (
          <div className="sticky top-[61px] z-30 px-4">
            <div className="max-w-md mt-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-sm font-medium px-4 py-2.5 rounded-xl">
              ⏳ {warning}
            </div>
          </div>
        )}

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

          {/* Intelligence Preview */}
          {!loading && allLogs.length > 0 && (
            <IntelligencePreviewCard logs={allLogs} />
          )}

          {/* Location banner */}
          {!settings.latitude && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <MapPin
                size={17}
                className="text-emerald-700 dark:text-emerald-400 flex-shrink-0"
              />
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
                className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60"
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
                    className="h-32 rounded-3xl bg-gradient-to-r from-gray-200/50 via-gray-100/50 to-gray-200/50 dark:from-white/5 dark:via-white/10 dark:to-white/5 animate-pulse"
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
            (Object.values(log.prayers || {}).filter((v) => v === "missed")
              .length > 0 ||
              Object.values(log.prayers || {}).some((s) => s === "none")) && (
              <RecoveryCard
                log={log}
                prayerTimes={prayerTimes}
                qazaTotal={qazaTotal}
                isFriday={isFriday}
              />
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
