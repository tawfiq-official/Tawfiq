import React, { useEffect, useState, useRef } from "react";

// Usage: wrap setPrayerStatus calls through this hook
export function useUndoAction(onUndo) {
  const [pending, setPending] = useState(null); // { label, undoFn }
  const timerRef = useRef(null);

  function push(label, undoFn) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPending({ label, undoFn });
    timerRef.current = setTimeout(() => setPending(null), 8000);
  }

  function doUndo() {
    if (!pending) return;
    clearTimeout(timerRef.current);
    pending.undoFn();
    setPending(null);
  }

  function dismiss() {
    clearTimeout(timerRef.current);
    setPending(null);
  }

  return { pending, push, doUndo, dismiss };
}

export default function UndoBanner({ pending, onUndo, onDismiss }) {
  if (!pending) return null;
  return (
    <div className="sticky top-[61px] z-30 px-4 pt-2">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm">
        <p className="text-xs text-foreground">{pending.label}</p>
        <div className="flex items-center gap-3">
          <button onClick={onUndo} className="text-xs font-bold text-primary">
            Undo
          </button>
          <button onClick={onDismiss} className="text-xs text-muted-foreground">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
