"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { EsdMark, KgmWordmark } from "@/components/ui/Logos";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const { reduced, toggleReduced, scrollTo } = useMotionPrefs();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 400 && y > prev && !open);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollTo(`#${id}`), open ? 350 : 0);
  };

  return (
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-700 ${scrolled && !open ? "bg-ink/70 backdrop-blur-md" : "bg-transparent"}`}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="mx-auto grid h-16 grid-cols-3 items-center px-5 md:h-20 md:px-10">
          <span className="label hidden truncate text-[0.625rem] md:block">Strategic Partnership Proposal</span>
          <button
            onClick={() => go("top")}
            className="col-start-2 flex items-center justify-center gap-3 text-bone"
            aria-label="Back to top"
          >
            <span className="block h-7 w-[19px] text-tan"><EsdMark className="h-full w-full" /></span>
            <span className="font-serif text-silver">×</span>
            <span className="block h-[10px] w-[60px]"><KgmWordmark className="h-full w-full" /></span>
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="col-start-3 flex items-center justify-self-end gap-3 text-bone"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-controls="site-menu"
          >
            <span className="label hidden text-bone sm:inline">{open ? "Close" : "Navigate"}</span>
            <span className="relative block h-3 w-6" aria-hidden>
              <span className={`absolute left-0 h-px w-full bg-bone transition-transform duration-500 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-full bg-bone transition-transform duration-500 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
        <motion.div className="h-px origin-left bg-signal" style={{ scaleX: scrollYProgress }} aria-hidden />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-40 flex flex-col bg-ink"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.8, ease: EASE }}
            data-lenis-prevent
          >
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center overflow-y-auto px-5 pt-24 pb-10 md:px-10">
              <nav aria-label="Sections">
                <ol className="grid gap-x-16 md:grid-cols-2">
                  {nav.map((item, i) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.04 }}
                      className="border-b hairline"
                    >
                      <button
                        onClick={() => go(item.id)}
                        className="group flex w-full items-baseline gap-5 py-3 text-left md:py-4"
                      >
                        <span className="label w-8 text-signal">{String(i + 1).padStart(2, "0")}</span>
                        <span className="display text-4xl transition-transform duration-500 group-hover:translate-x-3 md:text-5xl">
                          {item.label}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ol>
              </nav>
              <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
                <span className="label">ESD HOOPS × KGM</span>
                <button
                  onClick={toggleReduced}
                  className="label flex items-center gap-3 text-bone"
                  aria-pressed={reduced}
                >
                  <span className={`relative h-4 w-8 rounded-full border transition-colors ${reduced ? "border-signal bg-signal/30" : "border-silver/50"}`}>
                    <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-bone transition-all ${reduced ? "left-4" : "left-0.5"}`} />
                  </span>
                  Reduce motion
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
