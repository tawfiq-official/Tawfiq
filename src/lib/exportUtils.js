import { PRAYERS, PRAYER_NAMES } from "./prayerUtils";

export function exportToCSV(logs) {
  const headers = [
    "Date",
    ...PRAYERS.map((p) => `${PRAYER_NAMES[p]} Status`),
    ...PRAYERS.map((p) => `${PRAYER_NAMES[p]} Jama'ah`),
    "Tahajjud",
    "Duha",
    "Witr",
    "Exempt",
  ];

  const rows = logs.map((log) => {
    const p = log.prayers || {};
    const j = log.jamaah || {};
    const n = log.nawafil || {};
    return [
      log.date,
      ...PRAYERS.map((pr) => p[pr] || "none"),
      ...PRAYERS.map((pr) => (j[pr] ? "yes" : "no")),
      n.tahajjud ? "yes" : "no",
      n.duha ? "yes" : "no",
      n.witr ? "yes" : "no",
      log.is_exempt ? "yes" : "no",
    ];
  });

  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `salah-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
