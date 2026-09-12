import { useState, useEffect, useRef } from "react";

interface BrandLoaderProps {
  onReady?: () => void;
}

export function BrandLoader({ onReady }: BrandLoaderProps) {
  // Check if preloader has already executed for this window session
  const alreadyDone =
    typeof window !== "undefined" &&
    Boolean((window as any).__PR1ME_PRELOADER_DONE__);

  // If already done, initialize as "done" so it never renders again
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | "done">(() =>
    alreadyDone ? "done" : 0
  );

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const hasStartedRef = useRef(false);

  useEffect(() => {
    // If already executed or running in this window, exit immediately
    if (
      typeof window === "undefined" ||
      (window as any).__PR1ME_PRELOADER_DONE__ ||
      hasStartedRef.current
    ) {
      setPhase("done");
      onReadyRef.current?.();
      return;
    }

    // Mark as started and executed for this window lifecycle
    hasStartedRef.current = true;
    (window as any).__PR1ME_PRELOADER_DONE__ = true;

    // Accessibility check: instant exit if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      onReadyRef.current?.();
      return;
    }

    // 1. At 200ms: PR1ME logo appears (opacity: 0 -> 1, scale: 0.96 -> 1)
    const t1 = setTimeout(() => {
      setPhase(1);
    }, 200);

    // 2. At 400ms: Loading animation & brand tagline begin
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 400);

    // 3. Coordinate exit transition (~1800ms-2400ms)
    let isExiting = false;
    let tExit: ReturnType<typeof setTimeout> | null = null;
    let tDone: ReturnType<typeof setTimeout> | null = null;

    const startExitTransition = () => {
      if (isExiting) return;
      isExiting = true;
      setPhase(3);
      onReadyRef.current?.();

      // Complete unmount after 600ms fade duration
      tDone = setTimeout(() => {
        setPhase("done");
      }, 650);
    };

    // Minimum cinematic presence: 1800ms (to give the intended premium feel)
    // Maximum ceiling: 2800ms (never keeps user waiting unnecessarily)
    const minWaitTime = 1800;
    const maxCeilingTime = 2800;
    const startTime = Date.now();

    const handleAssetsReady = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minWaitTime - elapsed);
      tExit = setTimeout(startExitTransition, remainingTime);
    };

    if (document.readyState === "complete") {
      handleAssetsReady();
    } else {
      window.addEventListener("load", handleAssetsReady, { once: true });
      // Fallback maximum ceiling timer
      tExit = setTimeout(startExitTransition, maxCeilingTime);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (tExit) clearTimeout(tExit);
      if (tDone) clearTimeout(tDone);
      window.removeEventListener("load", handleAssetsReady);
    };
  }, []); // Strictly empty dependency array to prevent any re-triggers

  if (phase === "done") return null;

  return (
    <aside
      id="pr1me-preloader"
      aria-label="PR1ME Brand Intro"
      aria-hidden={phase === 3}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0D0D0D] select-none transition-all duration-600 ease-out ${
        phase === 3
          ? "opacity-0 pointer-events-none scale-[1.01]"
          : "opacity-100 pointer-events-auto scale-100"
      }`}
    >
      {/* Centered Editorial Brand Experience */}
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-sm sm:max-w-md">
        {/* Phase 1 (200ms): PR1ME Monospace Wordmark */}
        <div
          className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase >= 1
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-[0.96] translate-y-2"
          }`}
        >
          <span className="font-mono text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#F7F7F5] block">
            PR1ME
          </span>
        </div>

        {/* Phase 2 (400ms): WEAR YOUR STORY Tagline */}
        <div
          className={`mt-2.5 sm:mt-3.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase >= 2
              ? "opacity-100 tracking-[0.35em] sm:tracking-[0.45em] translate-y-0"
              : "opacity-0 tracking-[0.2em] translate-y-1.5"
          }`}
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase text-[#C9B89A]">
            WEAR YOUR STORY
          </span>
        </div>

        {/* Phase 2 (400ms): Elegant Haute-Couture Loading Bar */}
        <div
          className={`mt-6 sm:mt-8 flex flex-col items-center transition-all duration-500 ease-out ${
            phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {/* Minimalist Progress Track */}
          <div className="w-32 sm:w-44 h-[1.5px] bg-white/12 rounded-full overflow-hidden relative">
            <div className="h-full bg-[#C9B89A] animate-brand-progress rounded-full" />
          </div>

          {/* Editorial Origin Stamp */}
          <span className="mt-3 text-[9px] font-mono tracking-widest text-white/40 uppercase">
            CAIRO • 2026
          </span>
        </div>
      </div>
    </aside>
  );
}
