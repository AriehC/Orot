"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./PostDetailModal.module.css";

const PRESETS = [
  { label: "5 דק׳", seconds: 5 * 60 },
  { label: "10 דק׳", seconds: 10 * 60 },
  { label: "15 דק׳", seconds: 15 * 60 },
  { label: "20 דק׳", seconds: 20 * 60 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function playBell() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(528, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 3);
}

export default function MeditationTimer() {
  const [duration, setDuration] = useState(5 * 60);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          stop();
          playBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, stop]);

  function selectPreset(seconds: number) {
    stop();
    setDuration(seconds);
    setRemaining(seconds);
  }

  function toggle() {
    if (remaining === 0) {
      setRemaining(duration);
    }
    setRunning((prev) => !prev);
  }

  function reset() {
    stop();
    setRemaining(duration);
  }

  return (
    <div className={styles.timerSection}>
      <div className={styles.timerDisplay}>{formatTime(remaining)}</div>

      {!running && remaining === duration && (
        <div className={styles.timerPresets}>
          {PRESETS.map((p) => (
            <button
              key={p.seconds}
              className={`${styles.timerPreset} ${duration === p.seconds ? styles.timerPresetActive : ""}`}
              onClick={() => selectPreset(p.seconds)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.timerControls}>
        <button className={styles.timerBtn} onClick={toggle}>
          {running ? "השהיה" : remaining === 0 ? "מחדש" : "התחלה"}
        </button>
        {(running || remaining < duration) && remaining > 0 && (
          <button className={styles.timerBtnSecondary} onClick={reset}>
            איפוס
          </button>
        )}
      </div>

      {remaining === 0 && (
        <p className={styles.timerLabel}>המדיטציה הסתיימה. נמסטה.</p>
      )}
    </div>
  );
}
