import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULTS = {
  fajr_count: 0,
  dhuhr_count: 0,
  asr_count: 0,
  maghrib_count: 0,
  isha_count: 0,
};

export function useQaza() {
  const [qaza, setQaza] = useState(DEFAULTS);
  const [qazaId, setQazaId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const list = await base44.entities.QazaLog.list();
    if (list.length > 0) {
      setQaza({ ...DEFAULTS, ...list[0] });
      setQazaId(list[0].id);
    }
    setLoading(false);
  }

  const save = useCallback(
    async (next) => {
      const clamped = Object.fromEntries(
        Object.entries(next).map(([k, v]) => [
          k,
          typeof v === "number" ? Math.max(0, v) : v,
        ]),
      );
      setQaza(clamped);
      if (qazaId) await base44.entities.QazaLog.update(qazaId, clamped);
      else {
        const c = await base44.entities.QazaLog.create(clamped);
        setQazaId(c.id);
      }
    },
    [qaza, qazaId],
  );

  const adjust = useCallback(
    async (prayer, delta) => {
      await save({
        ...qaza,
        [`${prayer}_count`]: (qaza[`${prayer}_count`] || 0) + delta,
      });
    },
    [qaza, save],
  );

  const addFullDay = useCallback(async () => {
    const u = {};
    Object.keys(DEFAULTS).forEach((k) => (u[k] = (qaza[k] || 0) + 1));
    await save({ ...qaza, ...u });
  }, [qaza, save]);
  const subtractFullDay = useCallback(async () => {
    const u = {};
    Object.keys(DEFAULTS).forEach(
      (k) => (u[k] = Math.max(0, (qaza[k] || 0) - 1)),
    );
    await save({ ...qaza, ...u });
  }, [qaza, save]);

  const setAmount = useCallback(
    async (prayer, amount) => {
      await save({ ...qaza, [`${prayer}_count`]: Math.max(0, amount) });
    },
    [qaza, save],
  );

  const total = Object.values(qaza)
    .filter((v) => typeof v === "number")
    .reduce((a, b) => a + b, 0);

  return {
    qaza,
    total,
    loading,
    adjust,
    addFullDay,
    subtractFullDay,
    setAmount,
  };
}
