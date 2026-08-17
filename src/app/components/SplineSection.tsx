"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { useSplineManager } from "./SplineManager";

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

const SCENE = "https://prod.spline.design/Z2vh92TWwbhel09T/scene.splinecode";

interface Props {
  children: ReactNode;
  className?: string;
  id: string;
}

export default function SplineSection({ children, className = "", id }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const { activeIds, register } = useSplineManager();
  const isActive = activeIds.has(id);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isActive) setHasLoaded(true);
  }, [isActive]);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          register(id);
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [id, register, hasLoaded]);

  const onLoad = useCallback((splineApp: any) => {
    try {
      splineApp._renderer?.pipeline?.setWatermark?.(null);
    } catch {}
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {hasLoaded && (
        <div className="absolute inset-0 z-0">
          <Spline scene={SCENE} className="w-full h-full" onLoad={onLoad} />
        </div>
      )}

      <div className="absolute inset-0 z-[1] bg-[#050505]/50" />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.97 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.97 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[2]"
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
