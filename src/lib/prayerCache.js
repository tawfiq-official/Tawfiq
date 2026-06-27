/**
 * Prayer time cache — aggressive localStorage caching so prayer times
 * are available offline and load instantly on repeat visits.
 */

const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function key(lat, lon, method, dateStr) {
  return `pt_${lat}_${lon}_${method}_${dateStr}`;
}

export function getCachedTimes(lat, lon, method, dateStr) {
  try {
    const raw = localStorage.getItem(key(lat, lon, method, dateStr));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export function setCachedTimes(lat, lon, method, dateStr, data) {
  try {
    localStorage.setItem(
      key(lat, lon, method, dateStr),
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {}
}

/** Cache all logs for offline analytics */
export function cacheAllLogs(logs) {
  try {
    localStorage.setItem(
      "tawfiq_all_logs",
      JSON.stringify({ logs, ts: Date.now() }),
    );
  } catch {}
}

export function getCachedLogs() {
  try {
    const raw = localStorage.getItem("tawfiq_all_logs");
    if (!raw) return null;
    const { logs } = JSON.parse(raw);
    return logs;
  } catch {
    return null;
  }
}
