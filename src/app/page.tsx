"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const HeroSpline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });
import SplineSection from "./components/SplineSection";
import { SplineManager } from "./components/SplineManager";
import NavBar from "./components/NavBar";
import ResumeModal from "./components/ResumeModal";
import CertificateModal from "./components/CertificateModal";
import JourneyTimeline from "./components/JourneyTimeline";
import { useIsMobile } from "./components/useIsMobile";

const experiments = [
  { icon: "🐧", title: "WSL Setup & Install", desc: "Getting Linux running inside Windows — the first real step.", commands: [{ tag: "MUST", cmd: "wsl --install", note: "Install WSL + Ubuntu" }, { tag: "MUST", cmd: "wsl -l -v", note: "List installed distros" }, { tag: "NEW", cmd: "wsl --install -d Ubuntu-24.04 --location D:\\WSL", note: "Install to D: drive" }, { tag: "MUST", cmd: "wsl --shutdown", note: "Stop all WSL" }] },
  { icon: "📂", title: "Navigate Filesystem", desc: "Moving around like you own the place.", commands: [{ tag: "MUST", cmd: "pwd", note: "Where am I?" }, { tag: "MUST", cmd: "ls -la", note: "All files with details" }, { tag: "MUST", cmd: "cd /mnt/c", note: "Access Windows C: drive" }, { tag: "WOW", cmd: "tree -L 2", note: "Visual folder tree" }] },
  { icon: "📝", title: "Files & Editing", desc: "Create, edit, peek — the basics of not losing your work.", commands: [{ tag: "MUST", cmd: "nano file.txt", note: "Simple text editor" }, { tag: "NEW", cmd: "mkdir -p a/b/c", note: "Nested folders at once" }, { tag: "WOW", cmd: "tail -f log.txt", note: "Live-follow a log" }, { tag: "NEW", cmd: "code file.txt", note: "Open in VS Code" }] },
  { icon: "🔍", title: "Search & Find", desc: "Locating anything across thousands of files instantly.", commands: [{ tag: "WOW", cmd: 'grep -r "text" .', note: "Search all files" }, { tag: "", cmd: 'find . -name "*.txt"', note: "Find all .txt files" }, { tag: "NEW", cmd: "find . -size +10M", note: "Files bigger than 10MB" }, { tag: "NEW", cmd: "diff a.txt b.txt", note: "Compare two files" }] },
  { icon: "⚙️", title: "System Info", desc: "Knowing what's under the hood without opening it.", commands: [{ tag: "MUST", cmd: "uname -r", note: "Kernel version" }, { tag: "MUST", cmd: "free -h", note: "RAM usage" }, { tag: "MUST", cmd: "df -h /mnt/c", note: "Real SSD free space" }, { tag: "MUST", cmd: "top", note: "CPU + memory monitor" }] },
  { icon: "🌐", title: "Networking", desc: "Testing connections, sniffing traffic, checking DNS.", commands: [{ tag: "", cmd: "ping google.com", note: "Test internet" }, { tag: "NEW", cmd: "curl -I https://example.com", note: "Check HTTP headers" }, { tag: "NEW", cmd: "ip addr", note: "Show your IPs" }, { tag: "WOW", cmd: "ss -tlnp", note: "Which ports are in use" }] },
  { icon: "🔀", title: "Git Basics", desc: "Version control — because Ctrl+Z only goes so far.", commands: [{ tag: "MUST", cmd: "git init", note: "Start new repo" }, { tag: "MUST", cmd: 'git commit -m "msg"', note: "Save a snapshot" }, { tag: "NEW", cmd: "git log --oneline", note: "Commit history" }, { tag: "NEW", cmd: "git branch <name>", note: "Create a branch" }] },
  { icon: "🔧", title: "Processes & Kill", desc: "Managing what's running — and forcing what won't stop.", commands: [{ tag: "WOW", cmd: "htop", note: "Fancy process monitor" }, { tag: "NEW", cmd: "ps aux | grep node", note: "Find specific process" }, { tag: "NEW", cmd: "kill -9 <PID>", note: "Force-kill stuck process" }, { tag: "WOW", cmd: "nohup cmd &", note: "Run in background" }] },
  { icon: "🔗", title: "Pipes & Chains", desc: "Linux's superpower — chaining commands like a pro.", commands: [{ tag: "MUST", cmd: "cmd1 | cmd2", note: "Pipe output" }, { tag: "WOW", cmd: "ls | wc -l", note: "Count files in folder" }, { tag: "WOW", cmd: "du -sh * | sort -hr", note: "Biggest folders first" }, { tag: "NEW", cmd: "cmd1 && cmd2", note: "Run cmd2 if cmd1 works" }] },
  { icon: "🎬", title: "Fun Commands", desc: "The stuff that makes terminal actually enjoyable.", commands: [{ tag: "WOW", cmd: "cmatrix", note: "Matrix falling letters" }, { tag: "WOW", cmd: "cowsay 'hello'", note: "Cow says your text" }, { tag: "WOW", cmd: 'figlet "HELLO"', note: "Big ASCII banner" }, { tag: "WOW", cmd: "sl", note: "Train if you miss 'ls'" }] },
  { icon: "🔐", title: "Permissions", desc: "Who can do what — and how to become root.", commands: [{ tag: "MUST", cmd: "sudo <command>", note: "Run as admin" }, { tag: "", cmd: "chmod +x script.sh", note: "Make executable" }, { tag: "NEW", cmd: "chmod 755 file", note: "Full access owner" }, { tag: "NEW", cmd: "chown user file", note: "Change owner" }] },
  { icon: "📦", title: "Packages & Install", desc: "Installing, updating, and cleaning up software.", commands: [{ tag: "MUST", cmd: "sudo apt update", note: "Refresh packages" }, { tag: "MUST", cmd: "sudo apt upgrade", note: "Upgrade all" }, { tag: "", cmd: "sudo apt install <name>", note: "Install software" }, { tag: "NEW", cmd: "sudo apt autoremove", note: "Clean unused" }] },
];

const contactLinks = [
  { icon: (<svg viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>), label: "GitHub", href: "https://github.com/rmounikkumar" },
  { icon: (<svg viewBox="0 0 24 24" fill="#0A66C2" className="w-8 h-8"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>), label: "LinkedIn", href: "https://www.linkedin.com/in/rmounikkumar/" },
  { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="1.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>), label: "Email", href: "mailto:rmounikkumar2024@gmail.com" },
];

const currentlyLearning = [
  { icon: "🐍", name: "Python", desc: "Deepening scripting, automation, and data handling skills.", status: "ACTIVE" },
  { icon: "🧩", name: "DSA", desc: "Problem solving, algorithms, and data structures for competitive coding.", status: "GRINDING" },
  { icon: "💻", name: "Operating Systems", desc: "Process management, memory, scheduling — core CS fundamentals.", status: "ACTIVE" },
  { icon: "🌐", name: "Web Development", desc: "Full-stack apps, modern frameworks, and deployment pipelines.", status: "BUILDING" },
  { icon: "🎯", name: "GATE Preparation", desc: "Strong technical foundation for GATE — theory + practice.", status: "PREPARING" },
];

const skills = [
  { name: "C", icon: "🔧", type: "Language" }, { name: "Java", icon: "☕", type: "Language" }, { name: "Python", icon: "🐍", type: "Language" },
  { name: "HTML / CSS", icon: "🎨", type: "Frontend" }, { name: "JavaScript", icon: "⚡", type: "Frontend" }, { name: "React", icon: "⚛️", type: "Library" },
  { name: "Node.js / Express", icon: "🟢", type: "Backend" }, { name: "JWT", icon: "🔐", type: "Auth" },
  { name: "MySQL", icon: "🗄️", type: "Database" }, { name: "MongoDB", icon: "🍃", type: "Database" },
  { name: "Git / GitHub", icon: "🔀", type: "Version Control" }, { name: "Vercel / Render", icon: "🚀", type: "Deployment" },
  { name: "Linux", icon: "🐧", type: "OS / Terminal" }, { name: "Vibe Coding", icon: "🎵", type: "Approach" },
  { name: "ChatGPT / Claude", icon: "🤖", type: "AI Tools" }, { name: "Canva / Photoshop", icon: "🖌️", type: "Design" },
  { name: "Research", icon: "🔬", type: "Process" },
];

export default function Home() {
  const isMobile = useIsMobile();
  const onLoad = useCallback((splineApp: any) => {
    try { splineApp?.setWatermark?.(null); } catch {}
    try { splineApp?._renderer?.pipeline?.setWatermark?.(null); } catch {}
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.85]);
  const heroTextY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const heroWidgetOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroWidgetY = useTransform(scrollYProgress, [0, 0.25], [0, -40]);
  const heroBtnOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroBtnY = useTransform(scrollYProgress, [0, 0.4], [0, -30]);
  const heroOverlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [activeCert, setActiveCert] = useState<{ title: string; file: string; issuer: string } | null>(null);

  const certificates = [
    { title: "Google IT Automation with Python", issuer: "Coursera", file: "/cert1.pdf", credential: "BAZX6ER904W4" },
    { title: "Google IT Support", issuer: "Coursera", file: "/cert2.pdf", credential: "MJG0D26Y5ZGL" },
    { title: "Linux Command Line", issuer: "Coursera", file: "/cert3.pdf", credential: "Certificate" },
    { title: "Google Cybersecurity", issuer: "Coursera", file: "/cert4.pdf", credential: "O4QRC513LL0S" },
    { title: "Google UX Design", issuer: "Coursera", file: "/cert5.pdf", credential: "4NMZC4YGXLCR" },
    { title: "Meta Front-End Developer", issuer: "Coursera", file: "/cert6.pdf", credential: "EKFX0Q9II4SD" },
  ];

  return (
    <SplineManager>
    <div className="bg-[#050505]">
      <NavBar />
      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
      <CertificateModal open={certOpen} cert={activeCert} onClose={() => { setCertOpen(false); setActiveCert(null); }} />

      {/* ─── Hero ─── */}
      <div ref={heroRef} className={isMobile ? "h-[120vh] relative" : "h-[150vh] relative"}>
        <div className="sticky top-0 h-screen w-full bg-[#050505] relative overflow-hidden">
          {isMobile ? (
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(250,204,21,0.03)_0%,_#050505_70%)]" />
          ) : (
            <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "auto" }}>
              <HeroSpline scene="https://prod.spline.design/3Yn0YhhKQACCHTEu/scene.splinecode" className="w-full h-full" onLoad={onLoad} />
            </div>
          )}
          <motion.div style={{ opacity: heroOverlayOpacity }} className="absolute inset-0 z-[1] bg-[#050505] pointer-events-none" />
          <motion.div style={{ opacity: heroOpacity }} className="pointer-events-none relative z-10 flex flex-col justify-between h-full px-8 py-10 md:px-16 lg:px-24">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-center justify-between">
              <p className="text-white/80 text-xs tracking-[0.35em] uppercase font-[family-name:var(--font-mono)]">NEXBOT</p>
              <p className="text-white/85 text-xs tracking-[0.3em] font-[family-name:var(--font-mono)]">R. MOUNIK KUMAR</p>
            </motion.div>

            <motion.div style={{ opacity: heroWidgetOpacity, y: heroWidgetY }} className="absolute left-8 md:left-16 top-24 pointer-events-auto hidden md:block">
              <div className="bg-white/[0.02] backdrop-blur-lg border border-white/5 rounded-2xl p-5 w-56 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/65 text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-mono)]">Available for work</span>
                </div>
                <div className="h-px bg-white/6" />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/85 text-[10px] font-[family-name:var(--font-mono)]">Projects</span>
                    <span className="text-white/90 text-xs font-[family-name:var(--font-mono)]">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/45 text-[10px] font-[family-name:var(--font-mono)]">Certificates</span>
                    <span className="text-white/90 text-xs font-[family-name:var(--font-mono)]">6</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/45 text-[10px] font-[family-name:var(--font-mono)]">Stack</span>
                    <span className="text-white/90 text-xs font-[family-name:var(--font-mono)]">Full-Stack</span>
                  </div>
                </div>
                <div className="h-px bg-white/6" />
                <div className="flex gap-2">
                  {["React", "Node", "Python"].map((t) => (
                    <span key={t} className="text-[rgba(250,204,21,0.7)] text-[9px] border border-[rgba(250,204,21,0.15)] rounded-full px-2 py-0.5 font-[family-name:var(--font-mono)]">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div style={{ opacity: heroWidgetOpacity, y: heroWidgetY }} className="absolute right-8 md:right-16 top-24 pointer-events-auto hidden md:block">
              <div className="bg-white/[0.02] backdrop-blur-lg border border-white/5 rounded-2xl p-5 w-52 space-y-4">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-white/50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span className="text-white/85 text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-mono)]">Quick Info</span>
                </div>
                <div className="h-px bg-white/6" />
                <div className="space-y-3">
                  <div>
                    <span className="text-white/40 text-[9px] font-[family-name:var(--font-mono)] block">LOCATION</span>
                    <span className="text-white/85 text-xs font-[family-name:var(--font-mono)]">India</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[9px] font-[family-name:var(--font-mono)] block">EDUCATION</span>
                    <span className="text-white/85 text-xs font-[family-name:var(--font-mono)]">B.Tech CSE — 3rd Year</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[9px] font-[family-name:var(--font-mono)] block">FOCUS</span>
                    <span className="text-white/85 text-xs font-[family-name:var(--font-mono)]">Web Dev &amp; AI</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div style={{ opacity: heroBtnOpacity, y: heroBtnY }} className="flex flex-col items-center justify-center text-center flex-1">
              <motion.h1 initial={{ opacity: 0, y: isMobile ? 15 : 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: isMobile ? 0.5 : 1, delay: 0.3 }} className="text-white text-3xl md:text-6xl lg:text-7xl font-[family-name:var(--font-heading)] font-light tracking-tight leading-[1.1]">
                Hi, I&apos;m <span className="font-medium">Mounik.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="mt-6 text-white/80 text-lg md:text-xl font-light max-w-md leading-relaxed">
                I build things, learn by doing,<br />and document what I discover.
              </motion.p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} style={{ opacity: heroBtnOpacity, y: heroBtnY }} className="flex justify-center pb-10">
              <a href="#about" className="pointer-events-auto group flex items-center gap-3 border border-white/15 rounded-full px-8 py-3 text-white/80 text-xs tracking-[0.25em] uppercase font-[family-name:var(--font-mono)] transition-all duration-500 hover:border-[rgba(250,204,21,0.4)] hover:text-[rgba(250,204,21,0.9)] hover:shadow-[0_0_30px_rgba(250,204,21,0.08)]">
                ENTER PORTFOLIO
                <span className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ─── About ─── */}
      <SplineSection id="about">
        <section id="about" className="relative z-20 px-6 py-28 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">About</p>
              <h2 className="text-white text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-light tracking-tight">The <span className="font-medium">person</span> behind the bot.</h2>
            </div>
            <div className="grid md:grid-cols-[1fr_1px_1fr] gap-8 md:gap-12">
              <div className="card p-8 md:p-10 space-y-6">
                <p className="text-white/70 text-base leading-relaxed">👋 Hi, I&apos;m R. Mounik Kumar, a 3rd-year B.Tech Computer Science &amp; Engineering student passionate about 💻 software development, 🚀 technology, and 🧠 problem-solving.</p>
                <p className="text-white/70 text-base leading-relaxed">I&apos;m currently building my skills in programming, 🌐 web development, and core computer science concepts while working on practical projects and participating in 💡 hackathons and technical challenges. I believe in learning by building, experimenting, and improving through real-world experience.</p>
                <p className="text-white/70 text-base leading-relaxed">🔧 I enjoy creating projects, exploring new technologies, and turning ideas into working solutions. I&apos;m also preparing for GATE and continuously working on strengthening my technical foundation.</p>
              </div>
              <div className="hidden md:block glow-line" />
              <div className="space-y-6">
                <div className="card p-6 flex items-center gap-6">
                  <div className="relative w-20 h-20 shrink-0">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-[-3px] rounded-full" style={{ background: "conic-gradient(from 0deg, transparent, rgba(250,204,21,0.4), transparent, rgba(250,204,21,0.4), transparent)" }} />
                    <div className="w-20 h-20 rounded-full overflow-hidden relative z-10">
                      <Image src="/photo.jpg" alt="R. Mounik Kumar" width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)]">3rd-Year CSE Student</p>
                    <p className="text-white/80 text-sm mt-1">B.Tech Computer Science &amp; Engineering</p>
                  </div>
                </div>
                <div className="card p-6">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-3">Currently Learning</p>
                  <div className="flex flex-wrap gap-2">
                    {["Web Development", "DSA", "Core CS", "GATE Prep"].map((t) => (<span key={t} className="text-white/60 text-xs border border-white/8 rounded-full px-3.5 py-1.5 bg-white/[0.02]">{t}</span>))}
                  </div>
                </div>
                <div className="card p-6">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-2">What I&apos;m Building</p>
                  <p className="text-white/70 text-sm leading-relaxed">Practical projects, hackathon prototypes, and anything that teaches me something new.</p>
                </div>
                <div className="card p-6">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-2">Where I&apos;m Heading</p>
                  <p className="text-white/70 text-sm leading-relaxed">🎯 Become a strong software professional, gain meaningful industry experience, and keep learning every day.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SplineSection>

      {/* ─── Resume ─── */}
      <SplineSection id="resume">
        <section id="resume" className="relative z-20 px-6 py-28 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">Resume</p>
              <h2 className="text-white text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-light tracking-tight">My <span className="font-medium">resume</span>.</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="card p-6">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-2">About</p>
                  <p className="text-white/70 text-sm leading-relaxed">3rd-year B.Tech CSE student with hands-on experience in full-stack development, AI tools, and system administration. Proven ability to build and ship production-ready applications.</p>
                </div>
                <div className="card p-6">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-2">Education</p>
                  <p className="text-white/85 text-sm">B.Tech Computer Science &amp; Engineering</p>
                  <p className="text-white/50 text-xs mt-1">3rd Year — Currently Pursuing</p>
                </div>
                <div className="card p-6">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-2">Experience</p>
                  <p className="text-white/85 text-sm">Self-taught full-stack developer</p>
                  <p className="text-white/50 text-xs mt-1">Hackathon participant · Open-source contributor</p>
                </div>
                <div className="card p-6">
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-3">Key Highlights</p>
                  <ul className="space-y-2">
                    {["Full-stack web development", "Hackathon participant", "Linux & WSL proficiency", "AI-assisted development", "Strong DSA & problem solving"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-white/85 text-sm">
                        <span className="text-[rgba(250,204,21,0.6)] text-xs">→</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="card p-8 flex flex-col items-center justify-center text-center gap-8">
                <div className="relative w-32 h-32">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-[-3px] rounded-full" style={{ background: "conic-gradient(from 0deg, transparent, rgba(250,204,21,0.4), transparent, rgba(250,204,21,0.4), transparent)" }} />
                  <div className="w-32 h-32 rounded-full overflow-hidden relative z-10 border-2 border-[#0a0a0a]">
                    <Image src="/photo.jpg" alt="R. Mounik Kumar" width={128} height={128} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <p className="text-white/80 text-lg font-[family-name:var(--font-heading)] font-medium mb-2">R. Mounik Kumar</p>
                  <p className="text-white/50 text-xs font-[family-name:var(--font-mono)]">Last updated: August 2026</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => setResumeOpen(true)}
                    className="group flex-1 flex items-center justify-center gap-2 border border-white/15 rounded-full px-6 py-3 text-white/85 text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-mono)] transition-all duration-500 hover:border-[rgba(250,204,21,0.4)] hover:text-[rgba(250,204,21,0.9)] hover:shadow-[0_0_20px_rgba(250,204,21,0.06)]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View Resume
                    <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </button>
                  <a
                    href="/resume.pdf"
                    download="R_Mounik_Kumar_Resume.pdf"
                    className="group flex-1 flex items-center justify-center gap-2 border border-white/15 rounded-full px-6 py-3 text-white/85 text-xs tracking-[0.2em] uppercase font-[family-name:var(--font-mono)] transition-all duration-500 hover:border-[rgba(250,204,21,0.4)] hover:text-[rgba(250,204,21,0.9)] hover:shadow-[0_0_20px_rgba(250,204,21,0.06)]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                    <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SplineSection>

      {/* ─── Projects ─── */}
      <SplineSection id="projects">
        <section id="projects" className="relative z-20 px-6 pb-28 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">Projects</p>
              <h2 className="text-white text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-light tracking-tight">Things I&apos;ve <span className="font-medium">built</span>.</h2>
            </div>

            {/* ShopEasy */}
            <div className="card p-8 md:p-12 mb-10 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-white/35 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)]">01</span>
                <div className="glow-line flex-1" />
              </div>
              <div className="grid md:grid-cols-[1fr_1.2fr] gap-10">
                <div>
                  <h3 className="text-white text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-medium mb-2">ShopEasy</h3>
                  <p className="text-white/45 text-xs font-[family-name:var(--font-mono)] mb-6">Full-stack e-commerce application</p>
                  <p className="text-white/70 text-sm leading-relaxed mb-8">A complete, ready-to-run online store with a storefront, admin dashboard, real inventory management, and payment integration. 108 demo products across 9 categories.</p>
                  <div className="space-y-5">
                    {[{ label: "What I built", text: "Storefront with search & filters, product galleries, shopping cart, checkout, admin panel, email OTP auth, and Razorpay integration." }, { label: "The problem", text: "Most e-commerce templates are broken, abandoned, or paywalled. I wanted something that works out of the box." }, { label: "What went wrong", text: "Inventory race conditions, session token bugs, and getting Razorpay test mode to behave like production." }, { label: "What I learned", text: "Real auth isn't just 'hash and store passwords.' httpOnly cookies, rotating tokens, and rate limiting are what keep things secure." }].map((item) => (<div key={item.label}><p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-1.5">{item.label}</p><p className="text-white/70 text-sm leading-relaxed">{item.text}</p></div>))}
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="rounded-2xl overflow-hidden border border-white/8 mb-6 relative" style={{ aspectRatio: '16/10' }}>
                    <Image src="/shopeasy-preview.png" alt="ShopEasy preview" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-3">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {["JavaScript", "Vite", "Node.js", "Express", "MongoDB", "Razorpay", "Brevo", "JWT"].map((t) => (<span key={t} className="text-white/55 text-xs border border-white/8 rounded-full px-3.5 py-1.5 bg-white/[0.02]">{t}</span>))}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <a href="https://ecommerce-store-shop-easy.vercel.app/" target="_blank" rel="noopener noreferrer" className="group/btn relative flex items-center gap-2 border border-[rgba(250,204,21,0.2)] rounded-full px-6 py-2.5 text-[rgba(250,204,21,0.8)] text-xs font-[family-name:var(--font-mono)] tracking-wider transition-all duration-500 bg-[rgba(250,204,21,0.05)] hover:bg-[rgba(250,204,21,0.1)] hover:border-[rgba(250,204,21,0.4)] hover:text-[rgba(250,204,21,1)] hover:shadow-[0_0_25px_rgba(250,204,21,0.12),0_0_50px_rgba(250,204,21,0.04)]">Live Demo <span className="transition-transform duration-500 group-hover/btn:translate-x-1">→</span></a>
                    <a href="https://github.com/rmounikkumar/ecommerce-store" target="_blank" rel="noopener noreferrer" className="group/btn flex items-center gap-2 border border-white/15 rounded-full px-6 py-2.5 text-white/85 text-xs font-[family-name:var(--font-mono)] tracking-wider transition-all duration-500 hover:border-white/30 hover:text-white/80 hover:bg-white/[0.03]">GitHub <span className="transition-transform duration-500 group-hover/btn:translate-x-1">→</span></a>
                  </div>
                </div>
              </div>
            </div>

            {/* EduAssistant */}
            <div className="card p-8 md:p-12 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-white/35 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)]">02</span>
                <div className="glow-line flex-1" />
              </div>
              <div className="grid md:grid-cols-[1fr_1.2fr] gap-10">
                <div>
                  <h3 className="text-white text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-medium mb-2">EduAssistant AI</h3>
                  <p className="text-white/45 text-xs font-[family-name:var(--font-mono)] mb-6">AI-powered educational platform</p>
                  <p className="text-white/70 text-sm leading-relaxed mb-8">A full-stack learning platform with role-based dashboards for students, teachers, and parents. Course management, quizzes, progress tracking, and an AI assistant.</p>
                  <div className="space-y-5">
                    {[{ label: "What I built", text: "Three dashboards, JWT auth with role-based access, course enrollment & video tracking, quizzes with auto-grading, and an AI chat assistant." }, { label: "What went wrong", text: "Managing three user roles with different permissions got messy. Google OAuth integration had its own fun surprises." }, { label: "What I learned", text: "Good data modeling from the start saves hours later. 'Just add Google login' is never as simple as it sounds." }].map((item) => (<div key={item.label}><p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-1.5">{item.label}</p><p className="text-white/70 text-sm leading-relaxed">{item.text}</p></div>))}
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="rounded-2xl overflow-hidden border border-white/8 mb-6 relative" style={{ aspectRatio: '16/10' }}>
                    <Image src="/eduassistant-preview.png" alt="EduAssistant AI preview" fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-mono)] mb-3">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {["Node.js", "Express", "MongoDB", "JWT", "Tailwind CSS", "Chart.js", "Google OAuth"].map((t) => (<span key={t} className="text-white/55 text-xs border border-white/8 rounded-full px-3.5 py-1.5 bg-white/[0.02]">{t}</span>))}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <a href="https://eduteck.onrender.com" target="_blank" rel="noopener noreferrer" className="group/btn relative flex items-center gap-2 border border-[rgba(250,204,21,0.2)] rounded-full px-6 py-2.5 text-[rgba(250,204,21,0.8)] text-xs font-[family-name:var(--font-mono)] tracking-wider transition-all duration-500 bg-[rgba(250,204,21,0.05)] hover:bg-[rgba(250,204,21,0.1)] hover:border-[rgba(250,204,21,0.4)] hover:text-[rgba(250,204,21,1)] hover:shadow-[0_0_25px_rgba(250,204,21,0.12),0_0_50px_rgba(250,204,21,0.04)]">Live Demo <span className="transition-transform duration-500 group-hover/btn:translate-x-1">→</span></a>
                    <a href="https://github.com/rmounikkumar/Eduteck-website" target="_blank" rel="noopener noreferrer" className="group/btn flex items-center gap-2 border border-white/15 rounded-full px-6 py-2.5 text-white/85 text-xs font-[family-name:var(--font-mono)] tracking-wider transition-all duration-500 hover:border-white/30 hover:text-white/80 hover:bg-white/[0.03]">GitHub <span className="transition-transform duration-500 group-hover/btn:translate-x-1">→</span></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SplineSection>

      {/* ─── Experiments ─── */}
      <SplineSection id="experiments">
        <section id="experiments" className="relative z-20 px-6 pb-28 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">Experiments</p>
              <h2 className="text-white text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-light tracking-tight mb-4">Where I <span className="font-medium">break things</span> on purpose.</h2>
              <p className="text-white/85 text-sm max-w-xl">Linux, WSL, terminal tricks, and the stuff nobody puts on a resume but everyone should know.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {experiments.map((exp, i) => (
                <div key={exp.title} className="card p-6 group" style={{ transitionDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg">{exp.icon}</span>
                    <h3 className="text-white/80 text-sm font-[family-name:var(--font-heading)] font-medium">{exp.title}</h3>
                  </div>
                  <p className="text-white/70 text-sm mb-5 leading-relaxed">{exp.desc}</p>
                  <div className="space-y-2">
                    {exp.commands.map((cmd) => (<div key={cmd.cmd} className="flex items-start gap-2 text-xs"><span className="text-[rgba(250,204,21,0.6)] font-[family-name:var(--font-mono)] shrink-0 mt-px">{cmd.tag}</span><div><code className="text-white/80 font-[family-name:var(--font-mono)] text-[11px]">{cmd.cmd}</code><span className="text-white/45 ml-2 text-[10px]">{cmd.note}</span></div></div>))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <a href="/Linux_WSL_Commands.pdf" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 border border-[rgba(250,204,21,0.2)] rounded-full px-8 py-3 text-[rgba(250,204,21,0.8)] text-xs tracking-[0.25em] uppercase font-[family-name:var(--font-mono)] bg-[rgba(250,204,21,0.05)] transition-all duration-500 hover:border-[rgba(250,204,21,0.5)] hover:text-[rgba(250,204,21,1)] hover:bg-[rgba(250,204,21,0.1)] hover:shadow-[0_0_25px_rgba(250,204,21,0.12),0_0_50px_rgba(250,204,21,0.04)]">
                View Full Reference PDF <span className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
              </a>
            </div>
          </div>
        </section>
      </SplineSection>

      {/* ─── Skills ─── */}
      <SplineSection id="skills">
        <section id="skills" className="relative z-20 px-6 pb-28 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">Skills</p>
              <h2 className="text-white text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-light tracking-tight">What I <span className="font-medium">use</span>.</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {skills.map((skill) => (
                <div key={skill.name} className="card px-5 py-5 flex items-center gap-3 group">
                  <span className="text-xl">{skill.icon}</span>
                  <div>
                    <p className="text-white/85 text-sm font-[family-name:var(--font-heading)] font-medium">{skill.name}</p>
                    <p className="text-white/45 text-[10px] font-[family-name:var(--font-mono)] mt-0.5">{skill.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SplineSection>

      {/* ─── Currently Learning ─── */}
      <SplineSection id="learning">
        <section id="learning" className="relative z-20 px-6 pb-28 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">Currently Learning</p>
              <h2 className="text-white text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-light tracking-tight">What&apos;s on my <span className="font-medium">plate right now</span>.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentlyLearning.map((item) => (
                <div key={item.name} className="card p-6 flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/8 flex items-center justify-center shrink-0 text-lg group-hover:border-[rgba(250,204,21,0.2)] transition-colors duration-500">{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-white/85 text-sm font-[family-name:var(--font-heading)] font-medium mb-1">{item.name}</p>
                    <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                  <span className="text-[rgba(250,204,21,0.4)] text-[10px] font-[family-name:var(--font-mono)] tracking-wider shrink-0 mt-1">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SplineSection>

      {/* ─── Journey ─── */}
      <SplineSection id="journey">
        <section id="journey" className="relative z-20 px-6 pb-32 md:px-16 lg:px-24">
          <div className="max-w-4xl mx-auto bg-[#050505]/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/5">
            <div className="mb-20">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">Journey</p>
              <h2 className="text-white text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-light tracking-tight">How I got <span className="font-medium">here</span>.</h2>
            </div>
            <JourneyTimeline />
          </div>
        </section>
      </SplineSection>

      {/* ─── Certificates ─── */}
      <SplineSection id="certificates">
        <section id="certificates" className="relative z-20 px-6 py-28 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">Certificates</p>
              <h2 className="text-white text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-light tracking-tight">What I&apos;ve <span className="font-medium">earned</span>.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {certificates.map((cert) => (
                <button
                  key={cert.credential}
                  onClick={() => { setActiveCert(cert); setCertOpen(true); }}
                  className="card card-glow relative p-0 text-left group cursor-pointer transition-all duration-500 hover:border-[rgba(250,204,21,0.15)] !overflow-hidden"
                >
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image src="/cert-frame.avif" alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain rounded-2xl" />
                  </div>
                  <div className="relative z-10 p-5">
                    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-white/5 mb-4 bg-white">
                      <iframe src={cert.file} className="w-full h-full border-0 pointer-events-none scale-[0.45] origin-top-left" style={{ width: "222%", height: "222%" }} />
                      <div className="absolute top-2 right-2 z-10">
                        <Image src="/coursera-logo.png" alt="Coursera" width={28} height={28} className="rounded-md" />
                      </div>
                    </div>
                    <h3 className="text-white/85 text-sm font-[family-name:var(--font-heading)] font-medium mb-1 group-hover:text-white/80 transition-colors duration-500">{cert.title}</h3>
                    <p className="text-white/45 text-[10px] font-[family-name:var(--font-mono)] mb-2">{cert.issuer}</p>
                    <div className="flex items-center gap-2 text-white/35 text-[10px] font-[family-name:var(--font-mono)] group-hover:text-[rgba(250,204,21,0.4)] transition-colors duration-500">
                      <span>View Certificate</span>
                      <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </SplineSection>

      {/* ─── Contact ─── */}
      <SplineSection id="contact">
        <section id="contact" className="relative z-20 px-6 pb-32 md:px-16 lg:px-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 text-center">
              <p className="text-[rgba(250,204,21,0.7)] text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-mono)] mb-4">Contact</p>
              <h2 className="text-white text-4xl md:text-6xl font-[family-name:var(--font-heading)] font-light tracking-tight mb-4">Let&apos;s <span className="font-medium">connect</span>.</h2>
              <p className="text-white/60 text-sm max-w-md mx-auto">Got a project idea, a question, or just want to say hi? I&apos;m always open to talking about tech, code, or anything in between.</p>
            </div>
            <div className="space-y-0">
              {contactLinks.map((link) => (
                <a key={link.label} href={link.href} target={link.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="group relative flex items-center justify-between py-7 border-b border-white/6 hover:border-[rgba(250,204,21,0.2)] transition-colors duration-500">
                  <div className="flex items-center gap-5">
                    <span className="text-white/35 text-lg group-hover:text-[rgba(250,204,21,0.7)] transition-colors duration-500">{link.icon}</span>
                    <span className="text-white/90 text-xl md:text-3xl font-[family-name:var(--font-heading)] font-light tracking-tight group-hover:text-white transition-colors duration-500">{link.label}</span>
                  </div>
                  <span className="text-white/35 text-sm font-[family-name:var(--font-mono)] group-hover:text-[rgba(250,204,21,0.7)] transition-all duration-500 group-hover:translate-x-1">→</span>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(250,204,21,0.4)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </a>
              ))}
            </div>
            <div className="mt-20 pt-10 border-t border-white/5 text-center">
              <p className="text-white/60 text-sm font-[family-name:var(--font-heading)] font-light tracking-tight">Designed &amp; built by</p>
              <p className="text-white/90 text-lg font-[family-name:var(--font-heading)] font-medium mt-1">R. Mounik Kumar</p>
              <p className="text-white/35 text-[10px] font-[family-name:var(--font-mono)] mt-4 tracking-wider">© {new Date().getFullYear()}</p>
            </div>
          </div>
        </section>
      </SplineSection>
    </div>
    </SplineManager>
  );
}
