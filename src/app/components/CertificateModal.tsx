"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  cert: { title: string; file: string; issuer: string } | null;
  onClose: () => void;
}

export default function CertificateModal({ open, cert, onClose }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && cert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <div>
                <p className="text-white/80 text-sm font-[family-name:var(--font-heading)] font-medium">{cert.title}</p>
                <p className="text-white/45 text-[10px] font-[family-name:var(--font-mono)] mt-0.5">{cert.issuer}</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={cert.file}
                  download
                  className="flex items-center gap-2 border border-white/15 rounded-full px-4 py-1.5 text-white/60 text-[10px] font-[family-name:var(--font-mono)] tracking-wider transition-all duration-500 hover:border-[rgba(250,204,21,0.4)] hover:text-[rgba(250,204,21,0.9)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download
                </a>
                <button onClick={onClose} className="text-white/50 hover:text-white/85 transition-colors duration-300 p-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-2">
              <iframe src={cert.file} className="w-full h-[70vh] rounded-lg border-0" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
