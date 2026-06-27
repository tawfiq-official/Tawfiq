import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  calculation_method: 2,
  dark_mode: false,
  exempt_mode: false,
  travel_mode: false,
  notifications_on: false,
  notification_mins: 15,
  adhan_voice: "none",
  latitude: null,
  longitude: null,
  city: "",
  quran_daily_goal: 2,
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", !!settings.dark_mode);
  }, [settings.dark_mode]);

  async function load() {
    const list = await base44.entities.UserSettings.list();
    if (list.length > 0) {
      setSettings({ ...DEFAULTS, ...list[0] });
      setSettingsId(list[0].id);
    }
    setLoading(false);
  }

  const updateSettings = useCallback(
    async (updates) => {
      const next = { ...settings, ...updates };
      setSettings(next);
      if (settingsId) {
        await base44.entities.UserSettings.update(settingsId, updates);
      } else {
        const created = await base44.entities.UserSettings.create(next);
        setSettingsId(created.id);
      }
    },
    [settings, settingsId],
  );

  return { settings, updateSettings, loading };
}
