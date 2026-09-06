"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type SoundKind = "hover" | "click" | "open" | "close" | "enter" | "leave";

interface SoundContextValue {
  enabled: boolean;
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
  const [enabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const lastHover = useRef<Element | null>(null);

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

  const playRef = useRef(play);
  playRef.current = play;

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

  const value = useMemo(() => ({ enabled, play }), [enabled, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}