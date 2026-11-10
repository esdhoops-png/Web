"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { hero, images, vehicles, type Img } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { Lockup } from "@/components/ui/Logos";
import { Lineup } from "@/components/ui/VehicleCutout";

const EASE = [0.22, 1, 0.36, 1] as const;

function Panel({ img, className, delay, sizes, priority, mobilePosition }: { img: Img; className: string; delay: number; sizes: string; priority?: boolean; mobilePosition?: string }) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ clipPath: "inset(50% 0% 50% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 1.6, ease: EASE, delay }}
    >
      <motion.div className="absolute inset-0" initial={{ scale: 1.25 }} animate={{ scale: 1.04 }} transition={{ duration: 3.2, ease: EASE, delay }}>
        <Image
          src={img.src}
          alt={img.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="cine-img object-cover object-(--pos-m) md:object-(--pos)"
          style={{ "--pos": img.position ?? "50% 50%", "--pos-m": mobilePosition ?? img.position ?? "50% 50%" } as React.CSSProperties}
        />
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const panelsScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const carX = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const carScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} id="top" className="grain relative min-h-[100svh] overflow-hidden bg-ink" aria-label="ESD HOOPS × KGM — Two worlds, one vision">
      {/* Background: the court world (players · night court · players) */}
      <motion.div className="absolute inset-0 flex gap-[3px] md:gap-1.5" style={{ scale: reduced ? 1 : panelsScale }}>
        <Panel img={images.esdShooter} mobilePosition="50% 20%" className="flex-1 md:flex-[0.9]" delay={1.3} sizes="(min-width: 768px) 32vw, 100vw" priority />
        <Panel img={images.courtNight} className="hidden flex-[1.4] md:block" delay={1.1} sizes="45vw" />
        <Panel img={images.esdOneOnOne} className="hidden flex-[0.9] md:block" delay={1.45} sizes="32vw" />
      </motion.div>

      {/* Grading layers */}
      <div className="pointer-events-none absolute inset-0 bg-ink/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(13,30,44,0.1)_0%,rgba(13,30,44,0.6)_60%,rgba(13,30,44,0.95)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />

      {/* Title block */}
      <motion.div
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-5 pt-24 text-center md:pt-28"
        style={{ y: reduced ? 0 : contentY, opacity: reduced ? 1 : contentOpacity }}
      >
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE, delay: 2.1 }} className="mb-7 text-bone md:mb-8">
          <Lockup size={48} />
        </motion.div>
        <h1 className="display text-[clamp(3.4rem,9.4vw,7.6rem)] text-bone" aria-label={`${hero.titleA} ${hero.titleB}`}>
          {[hero.titleA, hero.titleB].map((line, li) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]" aria-hidden>
              <motion.span
                className={`block ${li === 1 ? "text-tan italic" : ""}`}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.4, ease: EASE, delay: 1.6 + li * 0.15 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 2.5 }} className="mt-5 flex flex-col items-center gap-3">
          <p className="max-w-sm font-serif text-lg text-silver italic md:max-w-none md:text-2xl">“{hero.subtitle}”</p>
          <span className="label hidden text-bone md:block">
            ESD HOOPS × KGM <span className="mx-2 text-signal">—</span> {hero.eyebrow}
          </span>
        </motion.div>
      </motion.div>

      {/* The KGM line-up drives into the scene */}
      <motion.div
        className="absolute bottom-[12svh] left-1/2 z-20 w-[min(92vw,640px)] -translate-x-1/2 md:bottom-[7svh] md:w-[min(92vw,1240px,128svh)]"
        style={{ x: reduced ? 0 : carX, scale: reduced ? 1 : carScale }}
      >
        <motion.div
          initial={reduced ? false : { x: "-70vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 1.9 }}
        >
          <Lineup left={vehicles.mussoWhite} center={vehicles.torresEvx} right={vehicles.actyon} priority />
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#opportunity"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 3.2 }}
        className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-4"
        aria-label="Seguir bajando"
      >
        <span className="label text-[0.6rem] md:hidden">Desliza</span>
        <span className="relative block h-8 w-px overflow-hidden bg-bone/15">
          <span className="absolute inset-0 bg-bone" style={{ animation: "scroll-cue 2.2s cubic-bezier(.22,1,.36,1) infinite" }} />
        </span>
      </motion.a>
    </section>
  );
}
