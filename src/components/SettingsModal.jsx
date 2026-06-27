import React, { useState } from "react";
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
import { Moon, Pause, Download, Plane, Bell, Volume2 } from "lucide-react";
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
      <DialogContent className="max-w-sm mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={17} className="text-primary" />
              <Label className="text-sm font-medium cursor-pointer">
                Dark Mode
              </Label>
            </div>
            <Switch
              checked={!!settings.dark_mode}
              onCheckedChange={(v) => onUpdate({ dark_mode: v })}
            />
          </div>

          {/* Exempt Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pause size={17} className="text-primary" />
              <div>
                <Label className="text-sm font-medium cursor-pointer">
                  Exempt Mode
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
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
              <Plane size={17} className="text-primary" />
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

          <div className="border-t border-border" />

          {/* Prayer Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={17} className="text-primary" />
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
              <Volume2 size={17} className="text-primary" />
              <Label className="text-sm font-medium">Adhan Voice</Label>
            </div>
            <Select
              value={settings.adhan_voice || "none"}
              onValueChange={(v) => {
                onUpdate({ adhan_voice: v });
                previewAdhan(v);
              }}
            >
              <SelectTrigger className="rounded-xl">
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
                  className="text-xs text-muted-foreground underline underline-offset-2"
                >
                  Preview adhan
                </button>
              )}
          </div>

          <div className="border-t border-border" />

          {/* Calculation Method */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Calculation Method</Label>
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
          <div className="border-t border-border pt-4">
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2"
              onClick={handleExport}
            >
              <Download size={15} />
              Export Prayer History (CSV)
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Your data, always yours.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
