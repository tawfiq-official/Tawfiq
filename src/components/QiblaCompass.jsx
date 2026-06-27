import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronDown, ChevronUp, Navigation } from "lucide-react";

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

function calcQibla(lat, lon) {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LON - lon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function calcDistance(lat, lon) {
  const R = 6371;
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δφ = ((KAABA_LAT - lat) * Math.PI) / 180;
  const Δλ = ((KAABA_LON - lon) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function bearingToCardinal(deg) {
  const dirs = [
    "North",
    "North-Northeast",
    "Northeast",
    "East-Northeast",
    "East",
    "East-Southeast",
    "Southeast",
    "South-Southeast",
    "South",
    "South-Southwest",
    "Southwest",
    "West-Southwest",
    "West",
    "West-Northwest",
    "Northwest",
    "North-Northwest",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

function angleDiff(target, current) {
  let d = target - current;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function smoothAngle(current, target, alpha = 0.13) {
  const diff = angleDiff(target, current);
  return current + alpha * diff;
}

// States: idle | requesting | active | unavailable | denied
export default function QiblaCompass({ open, onClose, latitude, longitude }) {
  const [sensorState, setSensorState] = useState("idle");
  const [displayHeading, setDisplayHeading] = useState(null);
  const [accuracy, setAccuracy] = useState(null); // excellent | good | poor
  const [confirmed, setConfirmed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const headingTargetRef = useRef(null);
  const smoothRef = useRef(null);
  const animRef = useRef(null);
  const listenerRef = useRef(null);
  const sensorTimeoutRef = useRef(null);
  const wasAlignedRef = useRef(false);
  const gotFirstRef = useRef(false);

  const qiblaDir =
    latitude && longitude ? calcQibla(latitude, longitude) : null;
  const distanceKm =
    latitude && longitude ? calcDistance(latitude, longitude) : null;

  // RAF smoothing loop
  useEffect(() => {
    function loop() {
      if (headingTargetRef.current !== null) {
        const prev = smoothRef.current ?? headingTargetRef.current;
        const next = smoothAngle(prev, headingTargetRef.current);
        smoothRef.current = next;
        setDisplayHeading(next);
      }
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const cleanup = useCallback(() => {
    clearTimeout(sensorTimeoutRef.current);
    if (listenerRef.current) {
      window.removeEventListener(
        "deviceorientationabsolute",
        listenerRef.current,
        true,
      );
      window.removeEventListener(
        "deviceorientation",
        listenerRef.current,
        true,
      );
      listenerRef.current = null;
    }
  }, []);

  const startSensor = useCallback(() => {
    setSensorState("requesting");
    setDisplayHeading(null);
    setConfirmed(false);
    cleanup();
    headingTargetRef.current = null;
    smoothRef.current = null;
    wasAlignedRef.current = false;
    gotFirstRef.current = false;

    if (!window.DeviceOrientationEvent) {
      setSensorState("unavailable");
      return;
    }

    function attachListener() {
      const handler = (e) => {
        let h = null,
          acc = null;
        if (
          typeof e.webkitCompassHeading === "number" &&
          e.webkitCompassHeading >= 0
        ) {
          h = e.webkitCompassHeading;
          acc = e.webkitCompassAccuracy;
        } else if (typeof e.alpha === "number" && e.alpha !== null) {
          h = (360 - e.alpha) % 360;
          acc = 25;
        }
        if (h === null) return;
        if (!gotFirstRef.current) {
          gotFirstRef.current = true;
          clearTimeout(sensorTimeoutRef.current);
          setSensorState("active");
          headingTargetRef.current = h;
          smoothRef.current = h;
        } else {
          headingTargetRef.current = h;
        }
        if (acc !== null && acc >= 0) {
          setAccuracy(acc < 20 ? "excellent" : acc < 45 ? "good" : "poor");
        } else {
          setAccuracy("good");
        }
      };
      listenerRef.current = handler;
      window.addEventListener("deviceorientationabsolute", handler, true);
      window.addEventListener("deviceorientation", handler, true);
      sensorTimeoutRef.current = setTimeout(() => {
        if (!gotFirstRef.current) setSensorState("unavailable");
      }, 3500);
    }

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then((s) => {
          if (s === "granted") attachListener();
          else setSensorState("denied");
        })
        .catch(() => setSensorState("denied"));
    } else {
      attachListener();
    }
  }, [cleanup]);

  useEffect(() => {
    if (!open) {
      cleanup();
      setSensorState("idle");
      setAccuracy(null);
      setDisplayHeading(null);
      setConfirmed(false);
      setShowDetails(false);
      headingTargetRef.current = null;
      smoothRef.current = null;
      wasAlignedRef.current = false;
      gotFirstRef.current = false;
      return;
    }
    startSensor();
    return cleanup;
  }, [open]);

  // Alignment + haptics
  const diff =
    sensorState === "active" && displayHeading !== null && qiblaDir !== null
      ? angleDiff(qiblaDir, displayHeading)
      : null;

  const alignState =
    diff === null
      ? null
      : Math.abs(diff) <= 5
        ? "perfect"
        : Math.abs(diff) <= 15
          ? "close"
          : "off";

  useEffect(() => {
    if (alignState === null) return;
    const aligned = alignState === "perfect";
    if (aligned && !wasAlignedRef.current) {
      wasAlignedRef.current = true;
      setConfirmed(true);
      if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
    } else if (!aligned && wasAlignedRef.current) {
      wasAlignedRef.current = false;
      setConfirmed(false);
      if (navigator.vibrate) navigator.vibrate(30);
    }
  }, [alignState]);

  // Kaaba angle on the ring (0 = top center)
  const kaabaAngle =
    sensorState === "active" && displayHeading !== null
      ? (qiblaDir - displayHeading + 360) % 360
      : (qiblaDir ?? 0);

  // Guidance text
  function getGuidance() {
    if (diff === null) return null;
    const abs = Math.round(Math.abs(diff));
    if (abs <= 5)
      return {
        icon: "✓",
        line1: "Facing Qibla",
        line2: "You are aligned",
        color: "green",
      };
    if (abs <= 15)
      return {
        icon: "◎",
        line1: `Almost There`,
        line2: `Turn ${diff > 0 ? "Right" : "Left"} ${abs}°`,
        color: "amber",
      };
    return {
      icon: diff > 0 ? "→" : "←",
      line1: `Turn ${diff > 0 ? "Right" : "Left"}`,
      line2: `${abs}° to go`,
      color: "red",
    };
  }
  const guidance = getGuidance();

  // Color palettes
  const palette = {
    perfect: {
      bg: "bg-green-500",
      text: "text-white",
      ring: "#16a34a",
      glow: "rgba(22,163,74,0.35)",
      label:
        "bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-700",
      labelText: "text-green-700 dark:text-green-300",
    },
    close: {
      bg: "bg-amber-500",
      text: "text-white",
      ring: "#d97706",
      glow: "rgba(217,119,6,0.3)",
      label:
        "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700",
      labelText: "text-amber-700 dark:text-amber-300",
    },
    off: {
      bg: "bg-red-500",
      text: "text-white",
      ring: "#dc2626",
      glow: "rgba(220,38,38,0.2)",
      label: "bg-secondary border-border",
      labelText: "text-foreground",
    },
  };
  const pal = alignState ? palette[alignState] : palette.off;

  const RING_R = 112;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-2 rounded-3xl p-0 overflow-hidden border-0 shadow-2xl bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">Qibla Finder</h2>
            {distanceKm && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {distanceKm.toLocaleString()} km to Kaaba
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── No location ── */}
        {!latitude && (
          <div className="px-6 pb-8 pt-4 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📍</span>
            </div>
            <p className="text-base font-bold text-foreground mb-2">
              Location Needed
            </p>
            <p className="text-sm text-muted-foreground">
              Enable location in Settings to find the Qibla direction.
            </p>
          </div>
        )}

        {/* ── Permission denied ── */}
        {latitude && sensorState === "denied" && (
          <div className="px-6 pb-8 pt-4 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔒</span>
            </div>
            <p className="text-base font-bold text-foreground mb-2">
              Compass Access Denied
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Allow compass access in your device settings, then try again.
            </p>
            <button
              onClick={startSensor}
              className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-2xl"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {latitude &&
          (sensorState === "idle" || sensorState === "requesting") && (
            <div className="px-6 pb-8 pt-6 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Starting compass…</p>
            </div>
          )}

        {/* ── Unavailable — Manual Fallback ── */}
        {latitude && sensorState === "unavailable" && (
          <div className="px-5 pb-6 pt-2 space-y-3">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">🧭</p>
              <p className="text-sm font-bold text-foreground">
                Compass Not Available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your device doesn't support a live compass. Use the direction
                below.
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/25 rounded-2xl p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Face This Direction
              </p>
              <p className="text-3xl font-bold text-foreground">
                {qiblaDir !== null ? bearingToCardinal(qiblaDir) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Bearing: {qiblaDir !== null ? `${Math.round(qiblaDir)}°` : "—"}
              </p>
            </div>
            {distanceKm && (
              <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Distance to Kaaba
                </p>
                <p className="text-sm font-bold text-foreground">
                  {distanceKm.toLocaleString()} km
                </p>
              </div>
            )}
            <button
              onClick={startSensor}
              className="w-full flex items-center justify-center gap-2 bg-secondary border border-border rounded-xl py-2.5 text-sm font-medium text-foreground"
            >
              <Navigation size={13} /> Retry Compass
            </button>
          </div>
        )}

        {/* ── Live Compass ── */}
        {latitude && sensorState === "active" && (
          <div className="flex flex-col items-center px-5 pb-5 pt-1 gap-4">
            {/* Big status indicator */}
            <div
              className={`w-full rounded-3xl px-5 py-4 text-center transition-all duration-500 border ${pal.label}`}
              style={{ boxShadow: `0 0 24px ${pal.glow}` }}
            >
              <p
                className={`text-4xl font-black leading-none mb-1 ${pal.labelText}`}
              >
                {guidance?.line1 ?? "—"}
              </p>
              <p
                className={`text-base font-semibold ${pal.labelText} opacity-80`}
              >
                {guidance?.line2}
              </p>
            </div>

            {/* Compass ring */}
            <div className="relative" style={{ width: 268, height: 268 }}>
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-full transition-all duration-500"
                style={{
                  boxShadow: `0 0 0 3px ${pal.ring}, 0 0 32px ${pal.glow}`,
                }}
              />
              <div className="absolute inset-0 rounded-full bg-card" />

              {/* Rotating ring */}
              <div
                className="absolute inset-0"
                style={{ transform: `rotate(${-displayHeading ?? 0}deg)` }}
              >
                {Array.from({ length: 72 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: "1px",
                      height:
                        i % 9 === 0 ? "12px" : i % 3 === 0 ? "6px" : "3px",
                      backgroundColor:
                        i % 9 === 0
                          ? "hsl(var(--foreground))"
                          : "hsl(var(--border))",
                      opacity: i % 9 === 0 ? 0.45 : 0.2,
                      transformOrigin: "0 -121px",
                      transform: `rotate(${i * 5}deg) translateX(-50%)`,
                    }}
                  />
                ))}
                {[
                  ["N", 0, "#ef4444"],
                  ["E", 90, null],
                  ["S", 180, null],
                  ["W", 270, null],
                ].map(([lbl, deg, col]) => (
                  <div
                    key={lbl}
                    className="absolute flex items-center justify-center"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: 22,
                      height: 22,
                      marginLeft: -11,
                      marginTop: -11,
                      transform: `rotate(${deg}deg) translateY(-99px) rotate(-${deg}deg)`,
                    }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: col || "hsl(var(--muted-foreground))" }}
                    >
                      {lbl}
                    </span>
                  </div>
                ))}
              </div>

              {/* Top notch (phone direction) */}
              <div
                className="absolute"
                style={{ top: 5, left: "50%", transform: "translateX(-50%)" }}
              >
                <div
                  className="w-2 h-5 rounded-full"
                  style={{ background: pal.ring, opacity: 0.7 }}
                />
              </div>

              {/* Kaaba icon orbiting */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: "50%",
                  top: "50%",
                  width: 44,
                  height: 44,
                  marginLeft: -22,
                  marginTop: -22,
                  transform: `rotate(${kaabaAngle}deg) translateY(-${RING_R}px) rotate(-${kaabaAngle}deg)`,
                  zIndex: 10,
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl text-2xl transition-all duration-500"
                  style={{
                    background:
                      alignState === "perfect"
                        ? "#16a34a"
                        : alignState === "close"
                          ? "#d97706"
                          : "hsl(var(--card))",
                    border: `2.5px solid ${pal.ring}`,
                    boxShadow: `0 0 12px ${pal.glow}`,
                  }}
                >
                  🕋
                </div>
              </div>

              {/* Center large circle indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner"
                  style={{
                    background: pal.ring,
                    boxShadow: `0 0 0 6px ${pal.glow}, inset 0 0 20px rgba(0,0,0,0.15)`,
                  }}
                >
                  <span className="text-white text-3xl font-black leading-none select-none">
                    {alignState === "perfect"
                      ? "✓"
                      : alignState === "close"
                        ? "◎"
                        : diff !== null && diff > 0
                          ? "→"
                          : "←"}
                  </span>
                </div>
              </div>
            </div>

            {/* Calibration warning */}
            {accuracy === "poor" && (
              <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 text-center">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                  ⚠ Calibration Needed
                </p>
                <p className="text-xs text-muted-foreground">
                  Move your phone slowly in a figure-eight ∞ motion
                </p>
              </div>
            )}

            {/* Confirmed prayer ready */}
            {confirmed ? (
              <div className="w-full bg-green-600 rounded-2xl px-5 py-4 text-center shadow-lg">
                <p className="text-base font-black text-white mb-0.5">
                  ✓ Qibla Confirmed
                </p>
                <p className="text-xs text-green-100">Ready for prayer</p>
                <button
                  onClick={onClose}
                  className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                >
                  Begin Prayer
                </button>
              </div>
            ) : null}

            {/* Compass health row */}
            <div className="w-full grid grid-cols-3 gap-2">
              <div className="bg-secondary rounded-xl px-2 py-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  Compass
                </p>
                <p className="text-xs font-bold text-green-600">✓ Active</p>
              </div>
              <div className="bg-secondary rounded-xl px-2 py-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  Location
                </p>
                <p
                  className={`text-xs font-bold ${latitude ? "text-green-600" : "text-red-500"}`}
                >
                  {latitude ? "✓ Active" : "✗ Off"}
                </p>
              </div>
              <div className="bg-secondary rounded-xl px-2 py-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  Accuracy
                </p>
                <p
                  className={`text-xs font-bold ${accuracy === "excellent" ? "text-green-600" : accuracy === "good" ? "text-amber-500" : accuracy === "poor" ? "text-red-500" : "text-muted-foreground"}`}
                >
                  {accuracy === "excellent"
                    ? "Excellent"
                    : accuracy === "good"
                      ? "Good"
                      : accuracy === "poor"
                        ? "Poor"
                        : "—"}
                </p>
              </div>
            </div>

            {/* Expandable details */}
            <button
              onClick={() => setShowDetails((d) => !d)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
              {showDetails ? "Hide details" : "Show details"}
            </button>

            {showDetails && (
              <div className="w-full bg-secondary rounded-2xl px-4 py-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current Heading</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {displayHeading !== null
                      ? `${Math.round(displayHeading)}°`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Qibla Direction</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {qiblaDir !== null ? `${Math.round(qiblaDir)}°` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Difference</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {diff !== null ? `${Math.round(Math.abs(diff))}°` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {distanceKm ? `${distanceKm.toLocaleString()} km` : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
