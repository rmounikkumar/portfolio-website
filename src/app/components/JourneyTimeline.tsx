"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const timeline = [
  { year: "2024", title: "Started B.Tech CSE", desc: "Began my Computer Science journey. First exposure to programming, data structures, and how computers actually work.", tags: ["B.Tech", "CSE", "Beginner"] },
  { year: "2025", title: "Started Building Small Projects", desc: "Moved beyond tutorials. Started writing actual code, breaking things, and figuring out how to fix them.", tags: ["Projects", "Self-taught", "Trial & Error"] },
  { year: "2026", title: "Built Full-Stack Projects", desc: "ShopEasy, EduAssistant AI — real apps with auth, databases, payments. Started participating in hackathons and sharpening DSA.", tags: ["Full-Stack", "Hackathons", "DSA", "GATE Prep"] },
  { year: "NOW", current: true, title: "Building → Learning → Experimenting", desc: "The loop never stops. Build something, learn from it, break it, experiment with something new. Repeat.", tags: ["Linux", "WSL", "AI Tools", "Open Source"] },
];

export default function JourneyTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.3"],
  });

  const barHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute left-[19px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-white/10" />
      <motion.div
        className="absolute left-[19px] md:left-1/2 md:-translate-x-px top-0 w-px origin-top"
        style={{ height: barHeight, background: "linear-gradient(to bottom, rgba(250,204,21,0.8), rgba(250,204,21,0.3))" }}
      />
      {timeline.map((item, i) => (
        <div key={item.year} className={`relative flex items-start mb-16 last:mb-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
          <div className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 top-1 z-10">
            <div className="relative">
              <div className={`w-[18px] h-[18px] rounded-full border-2 ${item.current ? "border-[rgba(250,204,21,0.8)] bg-[rgba(250,204,21,0.15)]" : "border-white/20 bg-[#050505]"} flex items-center justify-center`}>
                {item.current && <div className="w-2 h-2 rounded-full bg-[rgba(250,204,21,0.9)] animate-pulse" />}
              </div>
              {item.current && <div className="absolute inset-[-4px] rounded-full border border-[rgba(250,204,21,0.2)] animate-ping" style={{ animationDuration: "2s" }} />}
            </div>
          </div>
          <div className={`ml-12 md:ml-0 md:w-[calc(50%-40px)] ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
            <span className={`inline-block text-xs font-[family-name:var(--font-mono)] tracking-[0.2em] mb-3 ${item.current ? "text-[rgba(250,204,21,0.8)]" : "text-white/45"}`}>{item.year}</span>
            <h3 className="text-white/90 text-lg font-[family-name:var(--font-heading)] font-medium mb-2">{item.title}</h3>
            <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
            {item.tags && <div className={`flex flex-wrap gap-2 mt-3 ${i % 2 === 0 ? "md:justify-end" : ""}`}>{item.tags.map((tag) => (<span key={tag} className="text-white/40 text-[10px] border border-white/8 rounded-full px-3 py-1 bg-white/[0.02] font-[family-name:var(--font-mono)]">{tag}</span>))}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
