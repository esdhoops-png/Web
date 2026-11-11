"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { useRef, useState } from "react";
import { whyKgm } from "@/content/site";
import { FadeIn } from "@/components/ui/Motion";
import { DrawLine, useFinePointer, useVelocitySkew } from "@/components/ui/Fx";
import { StageTile } from "@/components/ui/VehicleCutout";
import { useMotionPrefs } from "@/components/Providers";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_INOUT = [0.76, 0, 0.24, 1] as const;

const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/* ---------- Variants (children of a parent that switches hidden -> show) ---------- */

/** Giant headline letter: rises out of a mask. custom = index. */
const giantLetter: Variants = {
  hidden: { y: "112%", rotate: 10 },
  show: (i: number) => ({ y: "0%", rotate: 0, transition: { duration: 1.25, ease: EASE_OUT, delay: 0.05 + i * 0.07 } }),
};

/** The question mark: drops in from above and swings to rest like something with weight. */
const questionMark: Variants = {
  hidden: { y: "-70%", rotate: -38, opacity: 0 },
  show: {
    y: "0%",
    rotate: 0,
    opacity: 1,
    transition: {
      y: { type: "spring", stiffness: 150, damping: 15, mass: 1, delay: 0.62 },
      rotate: { type: "spring", stiffness: 85, damping: 6.5, mass: 1.1, delay: 0.62 },
      opacity: { duration: 0.25, delay: 0.62 },
    },
  },
};

const rowLine: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.3, ease: EASE_INOUT } },
};
const rowWord: Variants = {
  hidden: { y: "112%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 1, ease: EASE_OUT, delay: 0.12 + i * 0.06 } }),
};
const rowBody: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.5 } },
};
const rowChip: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE, delay: 0.7 + i * 0.05 } }),
};
const rowMedia: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.1, ease: EASE_INOUT, delay: 0.55 } },
};

/** "03" -> the last digit rolls up to its value like an odometer. */
function Tick({ n }: { n: string }) {
  const lead = n.slice(0, -1);
  const d = Number(n.slice(-1)) || 0;
  const digits = Array.from({ length: d + 1 }, (_, k) => k);
  return (
    <span className="inline-flex h-[1.2em] overflow-hidden leading-[1.2]">
      <span className="sr-only">{n}</span>
      <span aria-hidden>{lead}</span>
      <motion.span
        aria-hidden
        className="flex flex-col will-change-transform"
        variants={{
          hidden: { y: "0%" },
          show: { y: `-${(d / (d + 1)) * 100}%`, transition: { duration: 0.9 + d * 0.12, ease: EASE_INOUT, delay: 0.1 } },
        }}
      >
        {digits.map((k) => (
          <span key={k} className="block h-[1.2em]">
            {k}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/* ---------- Closing: pinned, scroll-scrubbed statement ---------- */

function FillWord({ word, progress, range, reduced }: { word: string; progress: MotionValue<number>; range: [number, number]; reduced: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span className="inline-block" style={{ opacity: reduced ? 1 : opacity }}>
      {word}
    </motion.span>
  );
}

function RiseChar({ c, progress, range, reduced }: { c: string; progress: MotionValue<number>; range: [number, number]; reduced: boolean }) {
  const y = useTransform(progress, range, ["115%", "0%"]);
  const rotate = useTransform(progress, range, [12, 0]);
  return (
    <motion.span className="inline-block origin-bottom-left will-change-transform" style={{ y: reduced ? "0%" : y, rotate: reduced ? 0 : rotate }}>
      {c}
    </motion.span>
  );
}

function Closing() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.65", "end end"] });
  const [first, second] = whyKgm.closing;

  const firstWords = first.split(" ");
  const secondWords = second.split(" ");
  const secondCount = second.replace(/ /g, "").length;

  const drift = useTransform(scrollYProgress, [0, 0.45], [60, 0]);
  const bar = useTransform(scrollYProgress, [0.02, 0.84], [0, 1]);

  let ci = 0;
  return (
    <div ref={ref} className={reduced ? "mt-24 md:mt-36" : "relative mt-10 h-[190vh] md:mt-16 md:h-[200vh]"}>
      <div className={reduced ? "" : "sticky top-0 flex h-[100svh] flex-col justify-center"}>
        <motion.p
          aria-label={first}
          className="display text-[clamp(2.4rem,6.4vw,6rem)]"
          style={{ y: reduced ? 0 : drift }}
        >
          {firstWords.map((w, i) => {
            const a = 0.03 + (i / firstWords.length) * 0.4;
            return (
              <span key={i} aria-hidden>
                <FillWord word={w} progress={scrollYProgress} range={[a, a + 0.4 / firstWords.length + 0.03]} reduced={reduced} />
                {i < firstWords.length - 1 ? " " : ""}
              </span>
            );
          })}
        </motion.p>
        <p
          aria-label={second}
          className="display text-[clamp(2.4rem,6.4vw,6rem)] text-signal italic [html[data-theme=sand]_&]:text-ember md:pl-[16%]"
        >
          {secondWords.map((w, wi) => (
            <span key={wi} aria-hidden>
              <span className="-mx-[0.08em] -mb-[0.06em] inline-block overflow-hidden px-[0.08em] pb-[0.16em] align-top whitespace-nowrap">
                {Array.from(w).map((c, k) => {
                  const a = 0.46 + (ci++ / secondCount) * 0.24;
                  return <RiseChar key={k} c={c} progress={scrollYProgress} range={[a, a + 0.12]} reduced={reduced} />;
                })}
              </span>
              {wi < secondWords.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        {!reduced && (
          <span aria-hidden className="mt-12 block h-px w-full bg-ink/15 md:mt-16">
            <motion.span className="block h-px w-full origin-left bg-signal [html[data-theme=sand]_&]:bg-ember" style={{ scaleX: bar }} />
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Section ---------- */

export function WhyKgm() {
  const [hover, setHover] = useState<number | null>(null);
  const fine = useFinePointer();
  const { reduced } = useMotionPrefs();

  // Cursor-following preview
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 160, damping: 22 });
  const y = useSpring(my, { stiffness: 160, damping: 22 });
  const vx = useVelocity(x);
  const tiltRaw = useTransform(vx, [-1800, 0, 1800], [-9, 0, 9], { clamp: true });
  const tilt = useSpring(tiltRaw, { stiffness: 140, damping: 18 });

  // Giant headline: leans with scroll speed, drifts sideways as it crosses the screen
  const headRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress: headP } = useScroll({ target: headRef, offset: ["start end", "end start"] });
  const headX = useTransform(headP, [0, 1], ["2.5%", "-2.5%"]);
  const skew = useVelocitySkew(3.5);
  const swing = useVelocitySkew(16);

  const letters = Array.from("Why KGM");

  return (
    <section
      id="why-kgm"
      className="relative bg-bone py-28 text-ink md:py-40"
      onMouseMove={(e) => {
        mx.set(e.clientX);
        my.set(e.clientY);
      }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <FadeIn className="label flex items-center gap-4 !text-ink/60" y={12}>
              <span className="h-px w-10 bg-ink/40" aria-hidden />
              <span>{whyKgm.label}</span>
            </FadeIn>
            <motion.h2
              ref={headRef}
              className="display mt-8 text-[clamp(4.5rem,15vw,14rem)] leading-[0.82]"
              aria-label={whyKgm.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            >
              <motion.span aria-hidden className="inline-block origin-bottom-left whitespace-nowrap will-change-transform" style={{ x: reduced ? 0 : headX, skewX: reduced ? 0 : skew }}>
                <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-top">
                  {letters.map((c, i) =>
                    c === " " ? (
                      <span key={i}>&nbsp;</span>
                    ) : (
                      <motion.span key={i} custom={i} variants={giantLetter} className="inline-block origin-bottom-left will-change-transform">
                        {c}
                      </motion.span>
                    ),
                  )}
                </span>
                {/* outer: swings with scroll speed · inner: drops in and settles */}
                <motion.span className="inline-block origin-top will-change-transform" style={{ rotate: reduced ? 0 : swing }}>
                  <motion.span
                    variants={questionMark}
                    className="inline-block origin-top text-signal will-change-transform [html[data-theme=sand]_&]:text-ember"
                  >
                    ?
                  </motion.span>
                </motion.span>
              </motion.span>
            </motion.h2>
          </div>
          <FadeIn as="p" delay={0.5} className="self-end font-serif text-2xl leading-snug italic md:col-span-4 md:text-3xl">
            {whyKgm.subtitle}
          </FadeIn>
        </div>

        <ol className="relative mt-20 md:mt-28">
          <DrawLine className="absolute top-0 left-0 w-full text-ink/15" />
          {whyKgm.reasons.map((r, i) => {
            const dim = fine && !reduced && hover !== null && hover !== i;
            return (
              <motion.li
                key={r.n}
                className={`group relative grid gap-6 py-10 transition-opacity duration-500 ease-out md:grid-cols-12 md:gap-10 md:py-14 ${dim ? "opacity-30" : "opacity-100"}`}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
                onMouseEnter={() => fine && setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="label !text-signal transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] [html[data-theme=sand]_&]:!text-ember md:col-span-1 md:pt-4 md:group-hover:translate-x-1">
                  <Tick n={r.n} />
                </span>
                <h3
                  aria-label={r.title}
                  className="display text-[clamp(2.2rem,4.6vw,4.2rem)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] md:col-span-6 md:group-hover:translate-x-5"
                >
                  {r.title.split(" ").map((w, wi, all) => (
                    <span key={wi} aria-hidden>
                      <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.18em] align-top">
                        <motion.span custom={wi} variants={rowWord} className="inline-block will-change-transform">
                          {w}
                        </motion.span>
                      </span>
                      {wi < all.length - 1 ? " " : ""}
                    </span>
                  ))}
                </h3>
                <div className="md:col-span-5 md:pt-3">
                  <motion.p variants={rowBody} className="text-base leading-relaxed text-ink/70 md:text-lg">
                    {r.body}
                  </motion.p>
                  {r.list && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {r.list.map((l, li) => (
                        <motion.li
                          key={l}
                          custom={li}
                          variants={rowChip}
                          className="rounded-full border border-ink/20 px-4 py-1.5 text-sm text-ink/80 transition-colors hover:border-signal hover:text-signal [html[data-theme=sand]_&]:hover:border-ember [html[data-theme=sand]_&]:hover:text-ember"
                        >
                          {l}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                  {"vehicle" in r && r.vehicle ? (
                    <motion.div variants={rowMedia} className="mt-6 md:hidden">
                      <StageTile vehicle={r.vehicle} className="aspect-[16/9]" sizes="100vw" />
                    </motion.div>
                  ) : (
                    "image" in r && r.image && (
                      <motion.div variants={rowMedia} className="relative mt-6 aspect-[16/9] overflow-hidden md:hidden">
                        <Image src={r.image.src} alt={r.image.alt} fill sizes="100vw" className="cine-img object-cover" style={{ objectPosition: r.image.position }} />
                      </motion.div>
                    )
                  )}
                </div>
                <motion.span variants={rowLine} className="absolute bottom-0 left-0 h-px w-full origin-left bg-ink/15" aria-hidden />
                <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-signal [html[data-theme=sand]_&]:bg-ember transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" aria-hidden />
              </motion.li>
            );
          })}
        </ol>

        <Closing />
      </div>

      {/* Cursor-following preview (desktop) */}
      <motion.div className="pointer-events-none fixed top-0 left-0 z-30 hidden md:block" style={{ x, y }} aria-hidden>
        <AnimatePresence>
          {hover !== null &&
            (() => {
              const r = whyKgm.reasons[hover];
              return (
                <motion.div
                  key={hover}
                  className="absolute top-0 left-0 -mt-64 ml-8 h-60 w-[22rem] origin-bottom-left overflow-hidden shadow-2xl will-change-transform"
                  style={{ rotate: reduced ? 0 : tilt }}
                  initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0.7, ease: EASE_INOUT } }}
                  exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.45, ease: EASE_INOUT } }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.35, y: "8%" }}
                    animate={{ scale: 1.04, y: "0%", transition: { duration: 1.2, ease: EASE_OUT } }}
                  >
                    {"vehicle" in r && r.vehicle ? (
                      <StageTile vehicle={r.vehicle} className="h-full w-full" sizes="352px" />
                    ) : (
                      "image" in r && r.image && <Image src={r.image.src} alt="" fill sizes="352px" className="cine-img object-cover" style={{ objectPosition: r.image.position }} />
                    )}
                  </motion.div>
                  <span className="label absolute bottom-3 left-4 !text-day/90">{r.n} / 0{whyKgm.reasons.length}</span>
                </motion.div>
              );
            })()}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
