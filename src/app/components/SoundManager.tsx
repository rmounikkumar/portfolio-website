"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type SoundKind = "hover" | "click" | "open" | "close" | "enter" | "leave" | "enable" | "disable";

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  play: (kind?: SoundKind) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

type Note = [freq: number, dur: number, vol: number, delay: number, type: OscillatorType];

const PATTERNS: Record<SoundKind, Note[]> = {
  hover: [[660, 0.06, 0.025, 0, "sine"]],
  click: [[880, 0.08, 0.05, 0, "triangle"]],
  open: [[520, 0.09, 0.05, 0, "triangle"], [780, 0.1, 0.045, 0.07, "triangle"]],
  close: [[660, 0.09, 0.045, 0, "triangle"], [440, 0.1, 0.05, 0.07, "triangle"]],
  enter: [[520, 0.09, 0.03, 0, "sine"], [780, 0.12, 0.03, 0.09, "sine"]],
  leave: [[660, 0.09, 0.03, 0, "sine"], [440, 0.12, 0.03, 0.09, "sine"]],
  enable: [[440, 0.09, 0.05, 0, "triangle"], [660, 0.09, 0.05, 0.09, "triangle"], [880, 0.12, 0.05, 0.18, "triangle"]],
  disable: [[880, 0.09, 0.05, 0, "triangle"], [660, 0.09, 0.05, 0.09, "triangle"], [440, 0.12, 0.05, 0.18, "triangle"]],
};

function playNotes(ctx: AudioContext, notes: Note[]) {
  for (const [freq, dur, vol, delay, type] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctxRef.current) ctxRef.current = new Ctor();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (kind: SoundKind = "hover") => {
      if (!enabledRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      playNotes(ctx, PATTERNS[kind]);
    },
    [getCtx]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      const ctx = getCtx();
      if (ctx) playNotes(ctx, PATTERNS[next ? "enable" : "disable"]);
      return next;
    });
  }, [getCtx]);

  const playRef = useRef(play);
  playRef.current = play;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const lastHover = useRef<Element | null>(null);

  useEffect(() => {
    const onMouseOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement)?.closest?.("a, button") ?? null;
      if (!t || lastHover.current === t || !enabledRef.current) return;
      lastHover.current = t;
      playRef.current("hover");
    };
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement)?.closest?.("a, button") ?? null;
      if (!t || !enabledRef.current) return;
      playRef.current("click");
    };
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("click", onClick);
      lastHover.current = null;
    };
  }, []);

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}

export function SoundToggle() {
  const { enabled, toggle, play } = useSound();

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => play("hover")}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable sound effects" : "Enable sound effects"}
      className={`group fixed bottom-5 right-5 z-[90] flex items-center justify-center rounded-full p-3 text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-mono)] border transition-all duration-500 backdrop-blur-xl ${
        enabled
          ? "border-[rgba(250,204,21,0.4)] bg-[rgba(250,204,21,0.1)] text-[rgba(250,204,21,0.9)] shadow-[0_0_20px_rgba(250,204,21,0.1)]"
          : "border-white/15 bg-[#050505]/80 text-white/60 hover:border-white/30 hover:text-white/85"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        {!enabled && <path strokeLinecap="round" strokeLinejoin="round" d="M17 9l6 6M23 9l-6 6" />}
      </svg>
    </button>
  );
}