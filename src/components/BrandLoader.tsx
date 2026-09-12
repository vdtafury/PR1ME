import { useState, useEffect } from "react";

export function BrandLoader() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | "done">("done");

  useEffect(() => {
    // 1. Accessibility check: skip immediately if prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // 2. Session check: only show on initial site entry in a session
    try {
      const hasSeen = sessionStorage.getItem("pr1me_intro_seen");
      if (hasSeen) {
        return;
      }
      sessionStorage.setItem("pr1me_intro_seen", "true");
    } catch {
      // Fallback if sessionStorage is disabled or unavailable
    }

    // Start Phase 0/1 immediately
    setPhase(0);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const phase1Delay = isMobile ? 80 : 120;
    const phase2Delay = isMobile ? 350 : 500;
    const phase3Delay = isMobile ? 950 : 1350;
    const doneDelay = isMobile ? 1450 : 1950;

    const t1 = setTimeout(() => setPhase(1), phase1Delay);
    const t2 = setTimeout(() => setPhase(2), phase2Delay);
    const t3 = setTimeout(() => setPhase(3), phase3Delay);
    const t4 = setTimeout(() => setPhase("done"), doneDelay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <aside
      aria-label="PR1ME Brand Intro"
      aria-hidden={phase === 3}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0D0D0D] select-none transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
        phase === 3
          ? "-translate-y-full opacity-90 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto"
      }`}
    >
      {/* Centered Brand Content */}
      <div className="flex flex-col items-center justify-center text-center px-4">
        {/* Phase 1: PR1ME Wordmark */}
        <div
          className={`transition-all duration-700 ease-out ${
            phase >= 1
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2"
          }`}
        >
          <span className="font-mono text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#F7F7F5] block">
            PR1ME
          </span>
        </div>

        {/* Phase 2: WEAR YOUR STORY Tagline */}
        <div
          className={`mt-2 sm:mt-3 transition-all duration-700 ease-out ${
            phase >= 2
              ? "opacity-100 tracking-[0.3em] sm:tracking-[0.4em] translate-y-0"
              : "opacity-0 tracking-[0.15em] translate-y-1.5"
          }`}
        >
          <span className="text-[9px] sm:text-xs font-bold uppercase text-[#C9B89A]">
            WEAR YOUR STORY
          </span>
        </div>

        {/* Subtle Fashion Campaign Line */}
        <div
          className={`mt-4 sm:mt-6 h-[1px] bg-white/20 transition-all duration-600 ease-out ${
            phase >= 2 ? "w-12 sm:w-16 opacity-60" : "w-0 opacity-0"
          }`}
        />
      </div>
    </aside>
  );
}
