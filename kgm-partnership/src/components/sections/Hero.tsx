"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { hero, images, type Img } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { Lockup } from "@/components/ui/Logos";

const EASE = [0.22, 1, 0.36, 1] as const;

function Panel({ img, className, delay, sizes, priority, mobilePosition }: { img: Img; className: string; delay: number; sizes: string; priority?: boolean; mobilePosition?: string }) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ clipPath: "inset(50% 0% 50% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 1.6, ease: EASE, delay }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.25 }}
        animate={{ scale: 1.04 }}
        transition={{ duration: 3.2, ease: EASE, delay }}
      >
        <Image src={img.src} alt={img.alt} fill priority={priority} sizes={sizes} className="cine-img object-cover object-(--pos-m) md:object-(--pos)" style={{ "--pos": img.position ?? "50% 50%", "--pos-m": mobilePosition ?? img.position ?? "50% 50%" } as React.CSSProperties} />
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const panelsScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} id="top" className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-ink" aria-label="ESD HOOPS × KGM — Two worlds, one vision">
      {/* Cinematic triptych: player · vehicle · court */}
      {/* Mobile: diptych (player above, vehicle below). Desktop: triptych. */}
      <motion.div className="absolute inset-0 flex flex-col gap-[3px] md:flex-row md:gap-1.5" style={{ scale: reduced ? 1 : panelsScale }}>
        <Panel img={images.esdShooter} mobilePosition="50% 25%" className="flex-[1.15] md:flex-[0.9]" delay={0.35} sizes="(min-width: 768px) 30vw, 100vw" />
        <Panel img={images.kgmShowroomFront} mobilePosition="50% 72%" className="flex-[0.85] md:flex-[1.6]" delay={0.1} sizes="(min-width: 768px) 55vw, 100vw" priority />
        <Panel img={images.esdOneOnOne} className="hidden flex-[0.9] md:block" delay={0.5} sizes="30vw" />
      </motion.div>

      {/* Grading layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(13,30,44,0.15)_0%,rgba(13,30,44,0.55)_55%,rgba(13,30,44,0.92)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-end px-5 pt-28 pb-28 text-center md:justify-center md:pb-24"
        style={{ y: reduced ? 0 : contentY, opacity: reduced ? 1 : contentOpacity }}
      >
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE, delay: 1.2 }} className="mb-8 text-bone md:mb-10">
          <Lockup size={52} />
        </motion.div>

        <h1 className="display text-[clamp(3.6rem,13vw,12rem)] text-bone" aria-label={`${hero.titleA} ${hero.titleB}`}>
          {[hero.titleA, hero.titleB].map((line, li) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]" aria-hidden>
              <motion.span
                className={`block ${li === 1 ? "italic" : ""}`}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.4, ease: EASE, delay: 0.7 + li * 0.15 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.5 }}
          className="mt-8 flex flex-col items-center gap-4 md:mt-10"
        >
          <span className="label text-bone">
            ESD HOOPS × KGM <span className="mx-2 text-signal">—</span> {hero.eyebrow}
          </span>
          <p className="max-w-md font-serif text-xl text-silver italic md:text-2xl">“{hero.subtitle}”</p>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#vision"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        aria-label="Scroll to the vision"
      >
        <span className="label text-[0.6rem]">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-bone/15">
          <span className="absolute inset-0 bg-bone" style={{ animation: "scroll-cue 2.2s cubic-bezier(.22,1,.36,1) infinite" }} />
        </span>
      </motion.a>
    </section>
  );
}
