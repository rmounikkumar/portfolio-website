"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useIsMobile } from "./useIsMobile";

interface SplineCtx {
  activeIds: Set<string>;
  register: (id: string) => void;
}

const Ctx = createContext<SplineCtx>({ activeIds: new Set(), register: () => {} });

export function useSplineManager() {
  return useContext(Ctx);
}

export function SplineManager({ children }: { children: ReactNode }) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      fetch("https://prod.spline.design/Z2vh92TWwbhel09T/scene.splinecode").catch(() => {});
    }
  }, [isMobile]);

  const register = useCallback((id: string) => {
    setActiveIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ activeIds, register }), [activeIds, register]);

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}
