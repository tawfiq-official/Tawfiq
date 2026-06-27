import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, RefreshCw, ChevronRight, CheckCircle2 } from "lucide-react";
import { useSettings } from "@/lib/useSettings";
import { getCurrentLocation } from "@/lib/prayerUtils";
import { CALCULATION_METHODS } from "@/lib/prayerUtils";

const GOALS = [
  { id: "fajr", label: "Improve Fajr", icon: "🌅" },
  { id: "qaza", label: "Reduce Qaza", icon: "📉" },
  { id: "consistency", label: "Build Consistency", icon: "📆" },
  { id: "jamaah", label: "Increase Jama'ah", icon: "🕌" },
];

const MADHABS = ["Hanafi", "Shafi'i", "Maliki", "Hanbali"];

const STEPS = [
  "welcome",
  "location",
  "method",
  "madhab",
  "notifications",
  "goals",
  "done",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateSettings } = useSettings();
  const [step, setStep] = useState(0);
  const [locStatus, setLocStatus] = useState("idle");
  const [selectedMethod, setSelectedMethod] = useState(2);
  const [selectedMadhab, setSelectedMadhab] = useState("Hanafi");
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [notifOn, setNotifOn] = useState(false);

  const stepId = STEPS[step];

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function toggleGoal(id) {
    setSelectedGoals((g) =>
      g.includes(id) ? g.filter((x) => x !== id) : [...g, id],
    );
  }

  async function handleLocation() {
    setLocStatus("loading");
    try {
      const pos = await getCurrentLocation();
      await updateSettings({ latitude: pos.lat, longitude: pos.lon });
      setLocStatus("done");
    } catch {
      setLocStatus("error");
    }
  }

  async function handleNotifications() {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") setNotifOn(true);
    }
    await updateSettings({ notifications_on: notifOn });
    next();
  }

  async function finish() {
    await updateSettings({
      calculation_method: selectedMethod,
      madhab: selectedMadhab,
      primary_goals: selectedGoals,
      onboarding_done: true,
    });
    localStorage.setItem("tawfiq_onboarding_done", "1");
    navigate("/");
  }

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Progress bar */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="w-full max-w-sm">
        {/* WELCOME */}
        {stepId === "welcome" && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🕌</div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome to Tawfiq
              </h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                The most intelligent, private Salah companion. Let's set it up
                for you in 60 seconds.
              </p>
            </div>
            <button
              onClick={next}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight size={18} />
            </button>
            <button
              onClick={finish}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip setup
            </button>
          </div>
        )}

        {/* LOCATION */}
        {stepId === "location" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Your Location
              </h2>
              <p className="text-muted-foreground mt-2">
                For accurate local prayer times and Qibla direction.
              </p>
            </div>
            {locStatus === "done" ? (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-600" />
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Location saved
                </p>
              </div>
            ) : (
              <button
                onClick={handleLocation}
                disabled={locStatus === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
              >
                {locStatus === "loading" ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                {locStatus === "loading" ? "Detecting…" : "Allow Location"}
              </button>
            )}
            {locStatus === "error" && (
              <p className="text-sm text-amber-600 text-center">
                Location unavailable. You can set it later in settings.
              </p>
            )}
            <div className="flex gap-3">
              {locStatus !== "done" && (
                <button
                  onClick={next}
                  className="flex-1 py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-muted transition-all"
                >
                  Skip for now
                </button>
              )}
              {locStatus === "done" && (
                <button
                  onClick={next}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* CALCULATION METHOD */}
        {stepId === "method" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Calculation Method
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Choose the standard used in your region.
              </p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {CALCULATION_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedMethod === m.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                updateSettings({ calculation_method: selectedMethod });
                next();
              }}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* MADHAB */}
        {stepId === "madhab" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Your Madhab
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                This affects Asr prayer time calculation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MADHABS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMadhab(m)}
                  className={`py-4 rounded-2xl border text-sm font-semibold transition-all ${
                    selectedMadhab === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={next}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {stepId === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Prayer Reminders
              </h2>
              <p className="text-muted-foreground mt-2">
                Get notified before each prayer so you never miss one.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Prayer Start Reminders
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Notified before each Adhan
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Window Closing Alerts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    30 minutes before prayer ends
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Streak Protection
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Save your streak before midnight
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleNotifications}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all"
            >
              Enable Reminders
            </button>
            <button
              onClick={next}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Not now
            </button>
          </div>
        )}

        {/* GOALS */}
        {stepId === "goals" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Your Primary Goals
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Tawfiq will personalise your experience around these.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`py-5 rounded-2xl border text-sm font-semibold flex flex-col items-center gap-2 transition-all ${
                    selectedGoals.includes(g.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Start Tracking <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* DONE */}
        {stepId === "done" && (
          <div className="text-center space-y-6">
            <div className="text-6xl">✨</div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                You're all set
              </h2>
              <p className="text-muted-foreground mt-2">
                Tawfiq is ready. May Allah grant you tawfeeq.
              </p>
            </div>
            <button
              onClick={finish}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-2xl hover:opacity-90 active:scale-95 transition-all"
            >
              Open Tawfiq
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
