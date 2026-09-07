# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · Spline 3D (React) · deployed on Vercel.

## Users

Primary: peers and the tech community. A developer or curious technical visitor exploring the work, the experiments, and the learning journey — evaluating ability through real projects and documented learnings rather than a formal hiring pitch. The site also functions as a resume/portfolio surface, but peer appeal is the confirmed primary audience.

## Product Purpose

A personal developer portfolio for R. Mounik Kumar — a 3rd-year B.Tech CSE student. It exists to demonstrate what he has built and what he is learning, and to make that visible to peers. Success is a visitor getting a clear, credible read on the person's skills, projects, and trajectory through hands-on work.

## Positioning

The portfolio is framed around "I build things, learn by doing, and document what I discover." It stands apart from a standard résumé by leading with shipped projects, a practical Linux/WSL command reference ("Experiments"), and an explicit "Currently Learning" + "Journey" timeline that foregrounds growth and curiosity rather than a static credential list.

## Operating Context

A dark, single-page site with scroll-driven sections navigated in the browser. Described identity "NEXBOT". Sections, in order: Hero (interactive 3D Spline robot with parallax and floating stat/info widgets), About, Resume (inline summary plus PDF preview modal and PDF download), Projects (six project cards with expandable case studies), Experiments (Linux/WSL command reference with grouped command tables), Skills (17 technology tags with a compact "Currently Learning" strip), Journey (scroll-linked timeline), Certificates (six Coursera certificates with PDF previews), Contact (GitHub, LinkedIn, Email).

## Capabilities and Constraints

Confirmed functionality:
- Interactive Spline 3D hero scene (desktop); radial-gradient replacement on mobile.
- Scroll-driven parallax, animated reveals, rotate-on-load profile ring, and animated banner assets.
- Resume viewing (modal with PDF preview) and downloadable resume.pdf.
- Six project case studies (ShopEasy, EduAssistant AI, SMS Security Gateway, WaveBeat, Pocket Puzzle, and a sixth listed in the certificates count) with expandable "Read Case Study" panels and live-demo/GitHub links.
- Experiments section: grouped Linux/WSL terminal command reference with MUST / NEW / WOW tags.
- Certificate gallery with PDF previews and credential IDs.
- Sound manager and Spline manager providers wrapping the app.

Constraints/technical notes:
- `use client` React components; heavy 3D/motion dependencies (Spline, Framer Motion).
- Custom fonts via next/font: Space Grotesk (--font-space / heading), Inter (--font-inter), JetBrains Mono (--font-mono).
- Accent color: yellow `rgba(250,204,21, ...)` (#FACC15) on a near-black `#050505` background.
- Public assets include resume PDF, six certificate PDFs and previews, project preview images, photo, and animated banner GIF/MP4/AVIF.

## Brand Commitments

- Name: R. Mounik Kumar. Signature line: "Hi, I'm Mounik."
- Identity tagline/motto: "I build things, learn by doing, and document what I discover."
- Described identity: "NEXBOT".
- Established visual language in the incumbent implementation: near-black background, yellow accent, monospace/sans typography, glassy cards with subtle borders and glows, uppercase letter-spaced micro-labels.
- Content is accurate as fact; presentation and some wording may be polished, but project claims, certificate credentials, and personal facts should be preserved.

## Evidence on Hand

Real, verifiable assets committed to the repo:
- Resume: `public/resume.pdf` (download target: R_Mounik_Kumar_Resume.pdf).
- Certificates (6): Google IT Automation with Python, Google IT Support, Linux Command Line, Google Cybersecurity, Google UX Design, Meta Front-End Developer — each with a Coursera issuer, credential ID, and PDF + preview image under `public/cert*.pdf` and `public/cert-previews/`.
- Project previews: `public/shopeasy-preview.png`, `public/eduassistant-preview.png`, `public/sms-security-preview.png`, `public/pocketpuzzle-cover.png`, `public/presentation.png`.
- Profile photo: `public/photo.jpg`.
- Banner media: `public/banner.png`, `public/banner-animated.gif`, `public/banner-big.gif`, `public/banner-video-compressed.mp4`, `public/banner-video-tiny.mp4`, `public/cert-frame.avif`.
- Live project links to ShopEasy, EduAssistant AI, SMS Security Gateway, and WaveBeat/Pocket Puzzle (source repo links on GitHub).

## Product Principles

- Show the work, not just the credentials — real projects with demos, case studies, and outcomes lead.
- Learning is a feature, not a footnote — "Currently Learning", the Journey timeline, and the Experiments reference are first-class content.
- Document discoveries — the Linux/WSL command reference is a practical takeaway, not filler.
- Keep personal truth intact — facts, claims, and credentials are real and trusted; presentation may evolve but the record does not.
- Serve the peer/developer reader — clarity, scanability, and technical credibility outrank promotional polish.

## Accessibility & Inclusion

No product-specific accessibility requirement was established during init. Contrast and readability of the near-black / low-opacity-white-on-dark text should be reviewed as part of any polish pass.
