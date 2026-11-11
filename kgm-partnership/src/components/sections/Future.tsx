"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { future, images, kgmLifestyle, vehicles } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { CineImage, FadeIn, SectionLabel } from "@/components/ui/Motion";
import { ParallaxLayer } from "@/components/ui/Fx";
import { EsdMark, KgmWordmark } from "@/components/ui/Logos";
import { VehicleCutout } from "@/components/ui/VehicleCutout";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Headline built letter by letter from a mask. The observer sits on the (unclipped) heading itself. */
function Headline({ text, className = "" }: { text: string; className?: string }) {
  const { reduced } = useMotionPrefs();
  const words = text.split(" ");
  return (
    <motion.h2
      className={className}
      aria-label={text}
      key={reduced ? "still" : "motion"}
      initial={reduced ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.026 } } }}
    >
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-nowrap [margin-bottom:-0.04em]">
          {Array.from(w).map((c, ci) => (
            <motion.span
              key={ci}
              className="inline-block origin-bottom-left will-change-transform"
              variants={{
                hidden: { y: "115%", rotate: 9, opacity: 0 },
                show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.05, ease: EASE, opacity: { duration: 0.4 } } },
              }}
            >
              {c}
            </motion.span>
          ))}
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.h2>
  );
}

/** The closing line: every word rises from a mask, the last two land in ember and get underlined. */
function ClosingLine() {
  const accent = "moves people.";
  const lead = future.closing.replace(accent, "").trim().split(" ");
  const word = {
    hidden: { y: "110%" },
    show: { y: "0%", transition: { duration: 1, ease: EASE } },
  };
  const mask = "inline-block overflow-hidden pb-[0.18em] align-top [margin-bottom:-0.18em]";
  return (
    <p className="font-serif text-3xl text-day italic md:text-5xl" aria-label={future.closing}>
      {lead.map((w, i) => (
        <span key={i} aria-hidden className={mask}>
          <motion.span className="inline-block will-change-transform" variants={word}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
      <span aria-hidden className="relative inline-block whitespace-nowrap text-ember">
        {accent.split(" ").map((w, i, all) => (
          <span key={i} className={mask}>
            <motion.span className="inline-block will-change-transform" variants={word}>
              {w}
              {i < all.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
        <motion.span
          className="absolute inset-x-0 -bottom-1 block h-px origin-left bg-ember md:-bottom-2"
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, ease: EASE_OUT, delay: 0.5 } } }}
        />
      </span>
    </p>
  );
}

/** ESD crest × KGM wordmark, assembling: crest rises, the cross turns in, the wordmark wipes in. */
function AssemblingLockup({ size = 64 }: { size?: number }) {
  return (
    <div className="flex items-center text-day" style={{ gap: size * 0.42 }}>
      <motion.span
        className="block shrink-0 text-tan"
        style={{ height: size, width: size * 0.675 }}
        variants={{
          hidden: { clipPath: "inset(100% 0% 0% 0%)", y: 14 },
          show: { clipPath: "inset(0% 0% 0% 0%)", y: 0, transition: { duration: 1.1, ease: EASE, delay: 0.55 } },
        }}
      >
        <EsdMark className="h-full w-full" />
      </motion.span>
      <motion.span
        aria-hidden
        className="font-serif text-silver"
        style={{ fontSize: size * 0.6, lineHeight: 1 }}
        variants={{
          hidden: { opacity: 0, rotate: -90, scale: 0.4 },
          show: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.9, ease: EASE, delay: 0.85 } },
        }}
      >
        ×
      </motion.span>
      <motion.span
        className="block shrink-0"
        style={{ height: size * 0.34, width: size * 0.34 * 5.93 }}
        variants={{
          hidden: { clipPath: "inset(0% 100% 0% 0%)", x: -10 },
          show: { clipPath: "inset(0% 0% 0% 0%)", x: 0, transition: { duration: 1.2, ease: EASE_OUT, delay: 1 } },
        }}
      >
        <KgmWordmark className="h-full w-full" />
      </motion.span>
    </div>
  );
}

export function Future() {
  const backdrop = kgmLifestyle[0];
  const { reduced } = useMotionPrefs();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Slow camera push on the court while the section crosses the screen.
  const { scrollYProgress: through } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const push = useTransform(through, [0, 1], [1.04, 1.22]);
  const titleY = useTransform(through, [0, 1], [50, -50]);

  // The arrival: scroll scrubs the cars in, a spring gives them weight. Done once the line-up sits at 60% of the screen.
  const { scrollYProgress: raw } = useScroll({ target: stageRef, offset: ["start end", "start 0.6"] });
  const a = useSpring(raw, { stiffness: 80, damping: 22, mass: 0.7 });
  const leftX = useTransform(a, [0, 1], ["-85%", "0%"]);
  const rightX = useTransform(a, [0, 1], ["85%", "0%"]);
  const sideOpacity = useTransform(a, [0, 0.35], [0, 1]);
  const centerX = useTransform(a, [0, 1], ["-34%", "0%"]);
  const centerScale = useTransform(a, [0, 1], [0.84, 1]);
  const centerOpacity = useTransform(a, [0, 0.3], [0, 1]);
  const dip = useTransform(a, [0, 0.8, 0.93, 1], ["0%", "0%", "1.6%", "0%"]); // brakes: the nose dips, then settles
  const floor = useTransform(a, [0.2, 1], [0, 1]);
  const lamps = useTransform(a, [0.7, 1], [0, 1]);

  const side = "relative z-0 hidden w-[31%] md:block brightness-[0.85]";

  return (
    <section
      ref={sectionRef}
      id="future"
      className="relative overflow-hidden bg-night [html[data-theme=sand]_&]:[--color-bone:var(--color-day)] [html[data-theme=sand]_&]:[--color-silver:var(--color-day-muted)] [html[data-theme=sand]_&]:[--color-tan:var(--color-day-tan)] [html[data-theme=sand]_&]:[--color-signal:var(--color-ember)]"
    >
      <motion.div className="absolute inset-0 will-change-transform" style={{ scale: reduced ? 1 : push }}>
        <ParallaxLayer depth={-12} className="absolute inset-[-2%]">
          <CineImage img={backdrop ?? images.courtNight} className="!absolute inset-0" parallax={8} reveal="center" />
        </ParallaxLayer>
      </motion.div>
      <div className={`absolute inset-0 ${backdrop ? "bg-night/55" : "bg-night/75"}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-night via-transparent to-night" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-56 bg-gradient-to-b from-transparent to-night-2 [html[data-theme=sand]_&]:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-28 md:px-10 md:pt-40">
        <SectionLabel className="text-day">{future.label}</SectionLabel>
        <div className="mt-8 grid gap-10 md:grid-cols-12">
          <motion.div className="md:col-span-7" style={{ y: reduced ? 0 : titleY }}>
            <Headline text={future.title} className="display text-[clamp(3.2rem,8.4vw,8.4rem)] text-day" />
          </motion.div>
          <div className="space-y-5 self-end text-base leading-relaxed text-day/80 md:col-span-5 md:text-lg">
            {future.body.map((p, i) => (
              <FadeIn key={p} as="p" delay={0.25 + i * 0.14}>
                {p}
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* The range arrives — unless a KGM lifestyle photo is set as the backdrop */}
      {!backdrop && (
        <div ref={stageRef} className="relative z-10 mx-auto mt-14 w-[min(94vw,1280px)] md:mt-10">
          <ParallaxLayer depth={10}>
            {/* floor light: spreads as the cars arrive, then breathes */}
            <motion.div aria-hidden className="pointer-events-none absolute inset-x-[4%] bottom-[-8%] h-[34%]" style={reduced ? { opacity: 1, scaleX: 1 } : { opacity: floor, scaleX: floor }}>
              <motion.div
                className="h-full w-full rounded-[50%] bg-tan/25 blur-2xl"
                animate={reduced ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.05, 1] }}
                transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
              />
            </motion.div>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-[3%] block h-px origin-center bg-gradient-to-r from-transparent via-day/40 to-transparent"
              style={reduced ? { scaleX: 1 } : { scaleX: floor }}
            />

            <div className="relative flex items-end justify-center">
              <motion.div className={`${side} -mr-[9%] will-change-transform`} style={reduced ? { x: "0%", opacity: 1 } : { x: leftX, opacity: sideOpacity }}>
                <div className="translate-y-[-6%]">
                  <VehicleCutout vehicle={vehicles.mussoGreen} sizes="26vw" glow={false} />
                </div>
              </motion.div>

              <motion.div
                className="relative z-10 w-full origin-bottom will-change-transform md:w-[46%]"
                style={reduced ? { x: "0%", scale: 1, y: "0%", opacity: 1 } : { x: centerX, scale: centerScale, y: dip, opacity: centerOpacity }}
              >
                <VehicleCutout vehicle={vehicles.torresEvxVx} sizes="(min-width: 768px) 40vw, 92vw" />
                {/* headlights wake up once the car has stopped, then breathe */}
                <motion.div aria-hidden className="pointer-events-none absolute top-[38%] left-[52%] h-[34%] w-[62%] mix-blend-screen" style={reduced ? { opacity: 1 } : { opacity: lamps }}>
                  <motion.div
                    className="h-full w-full rounded-[50%] bg-day/20 blur-2xl"
                    animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>

              <motion.div className={`${side} -ml-[9%] will-change-transform`} style={reduced ? { x: "0%", opacity: 1 } : { x: rightX, opacity: sideOpacity }}>
                <div className="translate-y-[-6%]">
                  <VehicleCutout vehicle={vehicles.actyon} sizes="26vw" glow={false} />
                </div>
              </motion.div>
            </div>
          </ParallaxLayer>
        </div>
      )}

      <div className={`relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-10 md:pb-32 ${backdrop ? "mt-[38svh]" : "mt-12"}`}>
        <motion.div
          className="relative flex flex-col gap-10 pt-10 md:flex-row md:items-center md:justify-between"
          key={reduced ? "still" : "motion"}
          initial={reduced ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.085, delayChildren: 0.15 } } }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-x-0 top-0 block h-px origin-left bg-day/15"
            variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.5, ease: EASE } } }}
          />
          <ClosingLine />
          <AssemblingLockup size={64} />
        </motion.div>
      </div>
    </section>
  );
}
