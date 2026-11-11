"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { EsdMark, KgmWordmark } from "@/components/ui/Logos";
import { Magnetic } from "@/components/ui/Fx";

const EASE = [0.22, 1, 0.36, 1] as const;
const WIPE = [0.76, 0, 0.24, 1] as const;

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
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-700 ${scrolled && !open ? "bg-ink/70 backdrop-blur-md [html[data-theme=sand]_&]:bg-ink/92" : "bg-transparent"}`}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="mx-auto grid h-16 grid-cols-3 items-center px-5 md:h-20 md:px-10">
          <span className="label hidden truncate text-[0.625rem] md:block">Strategic Partnership Proposal</span>
          <button
            onClick={() => go("top")}
            className="col-start-2 flex items-center justify-center gap-3 text-bone"
            aria-label="Volver al inicio"
          >
            <span className="block h-7 w-[19px] text-tan"><EsdMark className="h-full w-full" /></span>
            <span className="font-serif text-silver">×</span>
            <span className="block h-[10px] w-[60px]"><KgmWordmark className="h-full w-full" /></span>
          </button>
          <div className="col-start-3 flex items-center gap-6 justify-self-end">
          <div className={`hidden transition-opacity duration-500 md:block ${scrolled && !open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <Magnetic strength={0.3}>
              <button
                onClick={() => go("contact")}
                className="label group/cta relative block overflow-hidden rounded-full border border-tan/60 px-5 py-2.5 !text-tan transition-colors duration-500 hover:!text-ink"
                tabIndex={scrolled && !open ? 0 : -1}
              >
                <span aria-hidden className="absolute inset-0 origin-bottom translate-y-[102%] rounded-full bg-tan transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-y-0" />
                <span className="relative">Hablemos</span>
              </button>
            </Magnetic>
          </div>
          <Magnetic strength={0.25}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="group/menu flex items-center gap-3 py-2 text-bone"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-controls="site-menu"
          >
            <span className="label hidden text-bone sm:inline">{open ? "Cerrar" : "Menú"}</span>
            <span className="relative block h-3 w-6" aria-hidden>
              <span className={`absolute left-0 h-px w-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? "top-1.5 rotate-45" : "top-0 origin-right group-hover/menu:scale-x-[0.6]"}`} />
              <span className={`absolute left-0 h-px w-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? "top-1.5 -rotate-45" : "top-3 origin-left group-hover/menu:scale-x-[0.6]"}`} />
            </span>
          </button>
          </Magnetic>
          </div>
        </div>
        <motion.div className="h-px origin-left bg-signal" style={{ scaleX: scrollYProgress }} aria-hidden />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
            className="fixed inset-0 z-40 flex flex-col bg-ink"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.5, ease: WIPE } }}
            transition={{ duration: 0.7, ease: WIPE }}
            data-lenis-prevent
          >
            {/* The panel's content travels a little slower than the wipe: the sheet feels like it has weight */}
            <motion.div
              className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-5 pt-24 pb-10 md:px-10"
              initial={{ y: -48 }}
              animate={{ y: 0 }}
              exit={{ y: -32, transition: { duration: 0.5, ease: WIPE } }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <div className="my-auto">
              <nav aria-label="Secciones">
                <ol className="group/list grid gap-x-16 md:grid-cols-2">
                  {nav.map((item, i) => {
                    const d = 0.18 + i * 0.035;
                    return (
                      <li key={item.id} className="relative transition-opacity duration-500 group-hover/list:opacity-45 hover:!opacity-100 focus-within:!opacity-100">
                        <button onClick={() => go(item.id)} className="group relative flex w-full items-baseline gap-5 py-3 text-left md:py-4">
                          <motion.span
                            className="label w-8 text-signal"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, ease: EASE, delay: d + 0.12 }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </motion.span>
                          {/* Label rises out of a mask; on hover it rolls over to its italic twin */}
                          <span className="display relative block overflow-hidden pr-[0.12em] pb-[0.1em] text-4xl md:text-5xl">
                            <motion.span
                              className="block"
                              initial={{ y: "115%", rotate: 4 }}
                              animate={{ y: "0%", rotate: 0 }}
                              transition={{ duration: 0.85, ease: EASE, delay: d }}
                              style={{ transformOrigin: "0% 100%" }}
                            >
                              <span className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[115%] group-focus-visible:-translate-y-[115%]">
                                {item.label}
                              </span>
                              <span
                                aria-hidden
                                className="absolute inset-x-0 top-0 block translate-y-[115%] text-tan italic transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
                              >
                                {item.label}
                              </span>
                            </motion.span>
                          </span>
                          <span
                            aria-hidden
                            className="ml-auto -translate-x-4 self-center font-serif text-2xl text-tan opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100"
                          >
                            →
                          </span>
                        </button>
                        {/* Hairline draws itself; a second line in the accent colour runs across on hover */}
                        <motion.span
                          aria-hidden
                          className="absolute inset-x-0 bottom-0 block h-px origin-left bg-bone/15"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.9, ease: WIPE, delay: d }}
                        />
                        <span aria-hidden className="absolute inset-x-0 bottom-0 block h-px origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [li:hover>&]:scale-x-100" />
                      </li>
                    );
                  })}
                </ol>
              </nav>
              <motion.div
                className="mt-10 flex flex-wrap items-center justify-between gap-6"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
              >
                <span className="label">ESD HOOPS × KGM</span>
                <button
                  onClick={toggleReduced}
                  className="label flex items-center gap-3 text-bone"
                  aria-pressed={reduced}
                >
                  <span className={`relative h-4 w-8 rounded-full border transition-colors ${reduced ? "border-signal bg-signal/30" : "border-silver/50"}`}>
                    <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-bone transition-all ${reduced ? "left-4" : "left-0.5"}`} />
                  </span>
                  Reducir movimiento
                </button>
              </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
