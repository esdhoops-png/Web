"use client";

import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type MotionPrefs = {
  reduced: boolean;
  toggleReduced: () => void;
  scrollTo: (target: string | number) => void;
};

const MotionPrefsContext = createContext<MotionPrefs>({
  reduced: false,
  toggleReduced: () => {},
  scrollTo: () => {},
});

export const useMotionPrefs = () => useContext(MotionPrefsContext);

const STORAGE_KEY = "esd-kgm:reduced-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Initial preference: explicit user choice, otherwise the OS setting.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    setReduced(stored !== null ? stored === "true" : mq.matches);
    const onChange = (e: MediaQueryListEvent) => {
      let s: string | null = null;
      try {
        s = localStorage.getItem(STORAGE_KEY);
      } catch {}
      if (s === null) setReduced(e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reduced);
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  const toggleReduced = useCallback(() => {
    setReduced((r) => {
      try {
        localStorage.setItem(STORAGE_KEY, String(!r));
      } catch {}
      return !r;
    });
  }, []);

  const scrollTo = useCallback((target: string | number) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target as never, { offset: 0, duration: 1.6 });
      return;
    }
    if (typeof target === "number") window.scrollTo({ top: target });
    else document.querySelector(target)?.scrollIntoView();
  }, []);

  return (
    <MotionPrefsContext.Provider value={{ reduced, toggleReduced, scrollTo }}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </MotionPrefsContext.Provider>
  );
}
