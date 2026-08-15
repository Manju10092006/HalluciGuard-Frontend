'use client';

import React, { useEffect, useRef, useState } from 'react';
import { verificationService } from '@/services/verification/VerificationService';
import { eventBus } from '@/engine';
import { VerificationClaim } from '@/types';

export default function HomePage() {
  const raysRef = useRef<SVGGElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'features' | 'studio'>('features');
  
  // Real-time verification state connected to Render backend
  const [isVerifying, setIsVerifying] = useState(false);
  const [draftResponse, setDraftResponse] = useState('');
  const [finalResponse, setFinalResponse] = useState('');
  const [trustScore, setTrustScore] = useState(94);
  const [claims, setClaims] = useState<VerificationClaim[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);

  // 1. Generate 24 runtime SVG rays for the logo
  useEffect(() => {
    if (!raysRef.current) return;
    const g = raysRef.current;
    g.innerHTML = '';
    const totalRays = 24;
    const cx = 26;
    const cy = 26;
    const innerR = 10.4;
    const outerR = 22.6;

    for (let i = 0; i < totalRays; i++) {
      const angle = (i / totalRays) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toFixed(2));
      line.setAttribute('y1', y1.toFixed(2));
      line.setAttribute('x2', x2.toFixed(2));
      line.setAttribute('y2', y2.toFixed(2));
      g.appendChild(line);
    }
  }, []);

  // 2. Web Animations API entrance choreography
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const REVEAL = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const LIFT = 'cubic-bezier(0.22, 1, 0.36, 1)';

    // Hero title masked lines reveal
    const lines = document.querySelectorAll('.hero-h1 .hl-line');
    lines.forEach((line, i) => {
      line.animate(
        [
          { opacity: 0, transform: 'translateY(108%)' },
          { opacity: 1, offset: 0.14, transform: 'translateY(80%)' },
          { opacity: 1, transform: 'translateY(0%)' },
        ],
        {
          duration: 950,
          delay: 200 + i * 90,
          easing: REVEAL,
          fill: 'forwards',
        }
      );
    });

    // Subtitle lift
    const sub = document.querySelector('.hero-sub');
    if (sub) {
      sub.animate(
        [
          { opacity: 0, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 650, delay: 520, easing: LIFT, fill: 'forwards' }
      );
    }

    // Composer card reveal
    const comp = document.querySelector('.composer-shell');
    if (comp) {
      comp.animate(
        [
          { opacity: 0, transform: 'translateY(22px) scale(0.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 950, delay: 640, easing: REVEAL, fill: 'forwards' }
      );
    }
  }, []);

  // 3. Event Bus Subscriptions for live Render backend verification
  useEffect(() => {
    const unsubDraftStream = eventBus.on('LLM_DRAFT_STREAM', (data: any) => {
      setDraftResponse(data.accumulatedText || '');
    });

    const unsubClaims = eventBus.on('CLAIMS_EXTRACTED', (data: any) => {
      setClaims(data.claims || []);
    });

    const unsubEvidence = eventBus.on('EVIDENCE_DISCOVERED', (data: any) => {
      setEvidenceList(data.evidence || []);
    });

    const unsubCompleted = eventBus.on('VERIFICATION_COMPLETED', (data: any) => {
      setIsVerifying(false);
      setFinalResponse(data.finalResponse || draftResponse);
      if (data.overallConfidence) setTrustScore(data.overallConfidence);
    });

    return () => {
      unsubDraftStream?.();
      unsubClaims?.();
      unsubEvidence?.();
      unsubCompleted?.();
    };
  }, [draftResponse]);

  const handleSendPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isVerifying) return;

    const currentPrompt = prompt.trim();
    setIsVerifying(true);
    setDraftResponse('');
    setFinalResponse('');
    setClaims([]);
    setEvidenceList([]);

    // Smooth scroll down to Live Reasoning section
    const sec2 = document.getElementById('features');
    if (sec2) {
      sec2.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      await verificationService.verifyPrompt(currentPrompt, 'strict', 'qwen/qwen-2.5-7b-instruct');
    } catch (err) {
      console.error('Verification query failed:', err);
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full bg-[#0c0c0c] text-white selection:bg-[#ffd400]/20 selection:text-white">
      {/* ══════════════════════════════════════════
          SECTION 1 — HERO (#home)
      ══════════════════════════════════════════ */}
      <section
        id="home"
        className="section-one min-h-[100dvh] bg-[#0c0c0c] flex flex-col justify-between px-4 sm:px-7 pt-4 sm:pt-6 pb-6 relative overflow-hidden"
      >
        {/* TOPBAR NAVIGATION */}
        <header className="w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center justify-between z-20">
          {/* Left: 24-Ray Dynamic SVG Logo */}
          <a href="#home" aria-label="Home" className="flex items-center gap-2 w-fit">
            <svg
              className="w-[38px] h-[38px] md:w-[48px] md:h-[48px] transition-transform duration-200 hover:scale-105"
              viewBox="0 0 52 52"
            >
              <g
                ref={raysRef}
                className="rays"
                stroke="#f4f4f4"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="26" cy="26" r="7.4" fill="#fbfbfb" />
            </svg>
            <span className="font-semibold text-sm tracking-tight text-white hidden sm:inline font-sans">
              HalluciGuard
            </span>
          </a>

          {/* Center: Desktop Nav Links */}
          <ul className="nav-links hidden md:flex items-center gap-8 lg:gap-11 list-none">
            <li>
              <a
                href="#features"
                className="text-[#bcbcbc] hover:text-[#f2f2f2] text-sm lg:text-[15px] tracking-wide transition-colors duration-200"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#benefits"
                className="text-[#bcbcbc] hover:text-[#f2f2f2] text-sm lg:text-[15px] tracking-wide transition-colors duration-200"
              >
                Benefits
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="text-[#bcbcbc] hover:text-[#f2f2f2] text-sm lg:text-[15px] tracking-wide transition-colors duration-200"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-[#bcbcbc] hover:text-[#f2f2f2] text-sm lg:text-[15px] tracking-wide transition-colors duration-200"
              >
                FAQ
              </a>
            </li>
          </ul>

          {/* Right: CTA Pill & Mobile Burger */}
          <div className="flex items-center justify-end gap-3">
            <a
              href="#features"
              className="hidden md:inline-flex items-center justify-center bg-white hover:bg-[#ededed] active:scale-98 text-[#0c0c0c] font-medium text-xs lg:text-sm px-5 py-2.5 rounded-full transition-all duration-200"
            >
              Start Free
            </a>

            {/* Burger for Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-[#1c1c1c] border border-white/10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              <span
                className={`w-4 h-[1.5px] bg-white transition-all duration-200 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-[4.5px]' : ''
                }`}
              />
              <span
                className={`w-4 h-[1.5px] bg-white transition-all duration-200 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`w-4 h-[1.5px] bg-white transition-all duration-200 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-[4.5px]' : ''
                }`}
              />
            </button>
          </div>
        </header>

        {/* HERO COPY & COMPOSER */}
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center my-auto py-8">
          {/* H1 Masked Lines */}
          <h1 className="hero-h1 font-medium text-[#fafafa] tracking-[-0.021em] leading-[1.04] text-[34px] sm:text-[54px] lg:text-[72px]">
            <span className="hl-mask">
              <span className="hl-line">Think clearly.</span>
            </span>
            <span className="hl-mask">
              <span className="hl-line">Decide confidently</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub text-[#9e9e9e] font-normal text-sm sm:text-base lg:text-[19px] leading-[1.3] tracking-[0.004em] mt-5 max-w-xl">
            An AI workspace that structures your reasoning,
            <br className="hidden sm:inline" /> not just your answers.
          </p>

          {/* COMPOSER CARD */}
          <form
            onSubmit={handleSendPrompt}
            className="composer-shell mt-8 sm:mt-11 text-left"
          >
            {/* Glowing yellow-teal underglow */}
            <div className="composer-glow" />

            <div className="composer">
              {/* Textarea Input */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Break down a decision, problem, or idea…"
                rows={2}
                className="w-full bg-transparent text-[#efefef] placeholder:text-[#aeaeae] text-sm sm:text-base lg:text-[18px] resize-none focus:outline-none leading-relaxed font-sans"
              />

              {/* Controls Row */}
              <div className="flex items-center gap-2 sm:gap-3 mt-auto pt-4 border-t border-white/5">
                {/* Plus attachment chip */}
                <button
                  type="button"
                  aria-label="Add attachment"
                  className="chip-btn w-9 h-9 sm:w-11 sm:h-11 shrink-0"
                >
                  <svg
                    className="w-4 h-4 text-[#e8e8e8]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>

                {/* DeepThink pill chip */}
                <button
                  type="button"
                  className="chip-btn h-9 sm:h-11 px-3 sm:px-4 gap-2 text-xs sm:text-sm text-white font-medium shrink-0"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffe776]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                  </svg>
                  <span>DeepThink</span>
                </button>

                <div className="flex-1" />

                {/* Mic button */}
                <button
                  type="button"
                  aria-label="Voice input"
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-[#e1e1e1] hover:text-white transition-colors"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </button>

                {/* Send Button with Ambient Rotating Gradient Ring */}
                <button
                  type="submit"
                  aria-label="Send query"
                  className="send-btn-ring w-10 h-10 sm:w-12 sm:h-12 shrink-0"
                >
                  <div className="send-btn-inner">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-[#fafafa]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* TRUST LOGOS FOOTER */}
        <footer className="w-full max-w-5xl mx-auto pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-[#5c5c5c]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase">logoipsum</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase">logoipsum®</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <polygon points="12 2 2 22 22 22" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase">logoipsum</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase">logoipsum</span>
          </div>
        </footer>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — FEATURES & LIVE REASONING (#features)
      ══════════════════════════════════════════ */}
      <section
        id="features"
        className="section-two min-h-[100dvh] bg-[#0c0c0c] px-4 sm:px-8 py-16 sm:py-24 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section 2 Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-normal text-white tracking-[-0.02em] leading-[1.11] text-[28px] sm:text-[42px] lg:text-[50px]">
              <span className="hl-mask">
                <span className="hl-line">Built for human thinking.</span>
              </span>
              <span className="hl-mask">
                <span className="hl-line">Powered by structured intelligence.</span>
              </span>
            </h2>
            <p className="text-[#8b8b8d] text-xs sm:text-sm lg:text-base leading-relaxed">
              Ask complex questions. Explore multiple perspectives.
              <br className="hidden sm:inline" />
              Get structured, reliable answers — instantly.
            </p>
          </div>

          {/* RADIANT MULTI-LAYER GRADIENT PANEL */}
          <div className="gradient-panel shadow-2xl relative z-10">
            {/* Live reasoning row */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md">
                <span className="reasoning-dot" />
                <span className="text-[11px] font-bold text-[#0b0c07] font-mono tracking-tight uppercase">
                  Live reasoning &amp; Ground Truth Verification
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#0b0c07] font-semibold bg-white/60 px-2.5 py-0.5 rounded-full">
                Consensus Score: {trustScore}%
              </span>
            </div>

            {/* Chat Card Box */}
            <div className="w-full max-w-[814px] mx-auto bg-[#0d0d0d] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl space-y-4 relative z-10">
              {/* Conversation Stream */}
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {/* 1 USER MSG */}
                <div className="flex items-start justify-end gap-3">
                  <div className="chat-bubble bg-[#1c1c1c] text-[#efefef]">
                    Should we expand into the European market next quarter?
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#2a2a2a] border border-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#f2f2f2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>

                {/* 2 AI MSG */}
                <div className="flex items-start justify-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f5c40a] via-[#6ac6a0] to-[#22c0cf] flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="chat-bubble bg-[#1c1c1c] text-[#efefef] space-y-2">
                    <p>Let&apos;s evaluate this across four dimensions:</p>
                    <ul className="text-xs sm:text-sm text-[#bcbcbc] space-y-1 pl-1">
                      <li>• Market demand &amp; competition</li>
                      <li>• Regulatory complexity</li>
                      <li>• Operational cost impact</li>
                      <li>• Long-term strategic value</li>
                    </ul>
                    <p className="pt-1 text-[#efefef]">Would you like to prioritize speed or profitability?</p>
                  </div>
                </div>

                {/* 3 USER MSG */}
                <div className="flex items-start justify-end gap-3">
                  <div className="chat-bubble bg-[#1c1c1c] text-[#efefef]">
                    Analyze the Q3 sales data. Why did revenue drop in August?
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#2a2a2a] border border-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#f2f2f2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>

                {/* 4 AI MSG */}
                <div className="flex items-start justify-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f5c40a] via-[#6ac6a0] to-[#22c0cf] flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="chat-bubble bg-[#1c1c1c] text-[#efefef]">
                    I&apos;ve reviewed the Q3 database. The drop in August correlates with a 15% decrease in enterprise renewals. I&apos;ve drafted a retention strategy below.
                  </div>
                </div>

                {/* 5 USER MSG (LIVE OR DYNAMIC) */}
                <div className="flex items-start justify-end gap-3">
                  <div className="chat-bubble bg-[#1c1c1c] text-[#efefef]">
                    {finalResponse || draftResponse || 'Analyze our churn rate for February and draft a re-engagement email for inactive users'}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#2a2a2a] border border-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#f2f2f2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>

                {/* Live verification loading status */}
                {isVerifying && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-[#ffe776] font-mono animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#ffe776]" />
                    <span>LangGraph Multi-Agent Supervisor: Verifying claims against ground truth registries...</span>
                  </div>
                )}
              </div>

              {/* Bottom White Pill Input Bar */}
              <form onSubmit={handleSendPrompt} className="w-full flex items-center justify-between bg-[#fdfdfd] rounded-full px-4 py-2 border border-black/5 shadow-md">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What should we build today?"
                  disabled={isVerifying}
                  className="bg-transparent text-[#0c0c0c] placeholder:text-[#6b6b6d] text-xs sm:text-sm font-sans focus:outline-none flex-1"
                />
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Mic" className="text-[#111] p-1">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    aria-label="Submit"
                    className="w-7 h-7 rounded-full bg-[#0c0c0c] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* STATS COUNTER FOOTER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5 max-w-4xl mx-auto font-mono">
            <div className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                &lt; 120<span className="text-xs text-[#ffe776]">ms</span>
              </div>
              <div className="text-xs text-[#8e8e8e]">Inference Time</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                99.99<span className="text-xs text-[#78d0cd]">%</span>
              </div>
              <div className="text-xs text-[#8e8e8e]">Platform Uptime</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                24<span className="text-xs text-[#86ca8a]">/7</span>
              </div>
              <div className="text-xs text-[#8e8e8e]">Autonomous Runtime</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                2.4<span className="text-xs text-[#ffe776]">M</span>
              </div>
              <div className="text-xs text-[#8e8e8e]">Context Windows</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MOBILE FULLSCREEN NAV OVERLAY
      ══════════════════════════════════════════ */}
      <div id="navOverlay" className={mobileMenuOpen ? 'open' : ''}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg text-white">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-6 text-center">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl font-medium text-[#bcbcbc] hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl font-medium text-[#bcbcbc] hover:text-white transition-colors"
          >
            Benefits
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl font-medium text-[#bcbcbc] hover:text-white transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl font-medium text-[#bcbcbc] hover:text-white transition-colors"
          >
            FAQ
          </a>
        </nav>

        <div className="space-y-4">
          <div className="h-[2px] w-full bg-[var(--grad)]" />
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3.5 rounded-full bg-white text-[#0c0c0c] font-semibold text-center block text-sm"
          >
            Start Free
          </a>
        </div>
      </div>
    </div>
  );
}
