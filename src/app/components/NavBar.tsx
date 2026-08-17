"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Resume", href: "#resume" },
  { label: "Projects", href: "#projects" },
  { label: "Experiments", href: "#experiments" },
  { label: "Skills", href: "#skills" },
  { label: "Journey", href: "#journey" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" },
];

const mobileLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Certs", href: "#certificates" },
  { label: "Contact", href: "#contact" },
];

export default function NavBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = "group px-4 py-1.5 rounded-full text-white/85 text-xs tracking-[0.15em] uppercase font-[family-name:var(--font-mono)] transition-all duration-500 hover:border hover:border-[rgba(250,204,21,0.3)] hover:text-[rgba(250,204,21,0.9)] hover:shadow-[0_0_20px_rgba(250,204,21,0.06)] hover:bg-[rgba(250,204,21,0.03)]";

  const mobileLinkClass = "group px-3 py-1.5 rounded-full text-white/85 text-[10px] tracking-[0.12em] uppercase font-[family-name:var(--font-mono)] transition-all duration-500 hover:border hover:border-[rgba(250,204,21,0.3)] hover:text-[rgba(250,204,21,0.9)] whitespace-nowrap";

  return (
    <AnimatePresence>
      {show && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 md:py-5 md:px-6"
        >
          <div className="hidden md:flex items-center gap-1 bg-[#050505]/80 backdrop-blur-xl border border-white/8 rounded-full px-2 py-2">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className={linkClass}>{link.label}</a>
            ))}
          </div>
          <div className="md:hidden flex items-center gap-1 bg-[#050505]/80 backdrop-blur-xl border border-white/8 rounded-full px-2 py-1.5 overflow-x-auto">
            {mobileLinks.map((link) => (
              <a key={link.label} href={link.href} className={mobileLinkClass}>{link.label}</a>
            ))}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
