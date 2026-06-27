/**
 * Offline Queue — buffers mutations when offline, replays when connection returns.
 * All operations are saved to localStorage so they survive page refreshes.
 */

const QUEUE_KEY = "tawfiq_offline_queue";

function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function enqueueOp(op) {
  const q = loadQueue();
  q.push({
    ...op,
    id: Date.now() + Math.random(),
    ts: new Date().toISOString(),
  });
  saveQueue(q);
}

export function getQueue() {
  return loadQueue();
}
export function clearQueue() {
  saveQueue([]);
}
export function removeOp(id) {
  const q = loadQueue().filter((op) => op.id !== id);
  saveQueue(q);
}

export function isOnline() {
  return navigator.onLine !== false;
}
