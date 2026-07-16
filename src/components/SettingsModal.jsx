import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import{
  Pause,
  Download,
  Plane,
  Bell,
  Volume2,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { CALCULATION_METHODS } from "@/lib/prayerUtils";
import { fetchAllLogs } from "@/lib/useDailyLog";
import { exportToCSV } from "@/lib/exportUtils";

const ADHAN_VOICES = [
  { id: "none", name: "None (silent)" },
  { id: "mecca", name: "Makkah — Abdul Rahman Al-Sudais" },
  { id: "medina", name: "Madinah — Ali Ahmed Mullah" },
  { id: "egypt", name: "Egypt — Sheikh Ali Al-Husary" },
  { id: "turkey", name: "Turkey — Diyanet" },
  { id: "mishary", name: "Mishary Rashid Al-Afasy" },
];

// Public adhan audio URLs (royalty-free / open use)
const ADHAN_URLS = {
  mecca: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  medina: "https://www.islamcan.com/audio/adhan/azan2.mp3",
  egypt: "https://www.islamcan.com/audio/adhan/azan3.mp3",
  turkey: "https://www.islamcan.com/audio/adhan/azan4.mp3",
  mishary: "https://www.islamcan.com/audio/adhan/azan5.mp3",
};

export default function SettingsModal({ open, onClose, settings, onUpdate }) {
  const navigate = useNavigate();

function handleLogout() {
  onClose();
  navigate("/login", { replace: true });
}
  const [testingAdhan, setTestingAdhan] = useState(false);

  async function handleExport() {
    const logs = await fetchAllLogs();
    exportToCSV(logs);
  }

  async function handleNotificationToggle(v) {
    if (v && Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
    }
    onUpdate({ notifications_on: v });
  }

  function previewAdhan(voice) {
    if (voice === "none" || !ADHAN_URLS[voice]) return;
    setTestingAdhan(true);
    const audio = new Audio(ADHAN_URLS[voice]);
    audio.volume = 0.6;
    audio.play().catch(() => {});
    setTimeout(() => {
      audio.pause();
      setTestingAdhan(false);
    }, 8000);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[360px] w-[92%] rounded-3xl max-h-[88vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-center">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
  

          {/* Exempt Mode */}
          <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-green-50/40 dark:bg-green-900/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                <Pause
                  size={18}
                  className="text-green-700 dark:text-green-400"
                />
              </div>
              <div>
                <Label className="text-sm font-medium cursor-pointer">
                  Exempt Mode
                </Label>
                <p className="text-[13px] text-muted-foreground leading-5">
                  Pauses streak & Qaza tracking
                </p>
              </div>
            </div>
            <Switch
              checked={!!settings.exempt_mode}
              onCheckedChange={(v) => onUpdate({ exempt_mode: v })}
            />
          </div>

          {/* Travel Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <Plane
                  size={18}
                  className="text-green-700 dark:text-green-400"
                />
              </div>
              <div>
                <Label className="text-sm font-medium cursor-pointer">
                  Travel Mode
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enables Qasr & combined prayers
                </p>
              </div>
            </div>
            <Switch
              checked={!!settings.travel_mode}
              onCheckedChange={(v) => onUpdate({ travel_mode: v })}
            />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />

          {/* Prayer Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <Bell
                    size={18}
                    className="text-green-700 dark:text-green-400"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium cursor-pointer">
                    Prayer Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Browser notifications before adhan
                  </p>
                </div>
              </div>
              <Switch
                checked={!!settings.notifications_on}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
            {settings.notifications_on && (
              <div className="space-y-1.5 pl-8">
                <Label className="text-xs text-muted-foreground">
                  Notify me
                </Label>
                <Select
                  value={String(settings.notification_mins ?? 15)}
                  onValueChange={(v) =>
                    onUpdate({ notification_mins: Number(v) })
                  }
                >
                  <SelectTrigger className="rounded-xl h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 30].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} minutes before
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Adhan Voice */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <Volume2
                  size={18}
                  className="text-green-700 dark:text-green-400"
                />
              </div>
              <Label className="text-[15px] font-semibold">Adhan Voice</Label>
            </div>
            <Select
              value={settings.adhan_voice || "none"}
              onValueChange={(v) => {
                onUpdate({ adhan_voice: v });
                previewAdhan(v);
              }}
            >
              <SelectTrigger className="rounded-2xl h-12 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADHAN_VOICES.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {testingAdhan && (
              <p className="text-xs text-primary animate-pulse">
                ▶ Playing preview…
              </p>
            )}
            {settings.adhan_voice &&
              settings.adhan_voice !== "none" &&
              !testingAdhan && (
                <button
                  onClick={() => previewAdhan(settings.adhan_voice)}
                  className="text-sm text-green-700 dark:text-green-400 font-medium hover:underline"
                >
                  Preview adhan
                </button>
              )}
          </div>

          <div className="border-t border-border" />

          {/* Calculation Method */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Calculation Method
            </Label>
            <Select
              value={String(settings.calculation_method ?? 2)}
              onValueChange={(v) => onUpdate({ calculation_method: Number(v) })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {CALCULATION_METHODS.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export */}
          <div className="border-t border-border pt-5 text-center">
            <Button
              variant="outline"
              className="w-full rounded-2xl h-12 bg-green-600 hover:bg-green-700 text-white border-0 gap-2 shadow-md"
              onClick={handleExport}
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Download size={16} />
              </div>
              Export Prayer History (CSV)
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Your data, always yours.
            </p>
          </div>
          <div className="border-t border-border pt-5">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="
          w-full
          rounded-2xl
          border
          border-red-200
          bg-red-50
          hover:bg-red-100
          transition-all
          duration-300
          px-5
          py-4
          flex
          items-center
          justify-between
        "
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                      <LogOut size={20} className="text-red-600" />
                    </div>

                    <div className="text-left">
                      <h3 className="font-semibold text-red-700">Logout</h3>

                      <p className="text-xs text-muted-foreground">
                        Return to onboarding
                      </p>
                    </div>
                  </div>
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout?</AlertDialogTitle>

                  <AlertDialogDescription>
                    You will be returned to the onboarding screen. Your progress
                    will remain saved unless you clear your local data.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleLogout}
                    className="rounded-xl bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
