"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { opportunity } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";

type Beat = (typeof opportunity.beats)[number];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll timeline of the pinned scene (progress 0–1). A cut between two beats is
 * centred on c = i / n and plays in this order: the old statement leaves upward
 * word by word, the new photo wipes across on a slanted edge, the new statement
 * rises from its masks. Every window stays inside 0–1 and strictly increases.
 */
const OUT_FROM = 0.085; // old words start leaving at c - OUT_FROM
const OUT_TO = 0.02; //   ...and are gone by c - OUT_TO
const WIPE_FROM = 0.065; // photo wipe: c - WIPE_FROM → c + WIPE_TO
const WIPE_TO = 0.035;
const IN_FROM = 0.01; //  new words start rising at c - IN_FROM
const IN_TO = 0.08; //    ...and have landed by c + IN_TO

const SLANT = 16; // horizontal lean of the wipe edge, in % of the stage width

/** One photo. Beats after the first wipe in over the previous one; all of them push in slowly while on stage. */
function Photo({ beat, i, n, progress }: { beat: Beat; i: number; n: number; progress: MotionValue<number> }) {
  const c = i / n; // the cut that brings this photo in
  const next = (i + 1) / n; // the cut that takes it away
  const first = i === 0;
  const last = i === n - 1;

  // Slow push-in for as long as the photo is visible.
  const scale = useTransform(progress, [Math.max(0, c - WIPE_FROM), Math.min(1, next + WIPE_TO)], [1.04, 1.2]);
  // The outgoing photo slides away under the incoming one, the incoming one settles from the right: depth.
  const drift = useTransform(
    progress,
    first
      ? [0, next - WIPE_FROM, next + WIPE_TO]
      : last
        ? [c - WIPE_FROM, c + WIPE_TO, 1]
        : [c - WIPE_FROM, c + WIPE_TO, next - WIPE_FROM, next + WIPE_TO],
    first ? ["0%", "0%", "-6%"] : last ? ["7%", "0%", "0%"] : ["7%", "0%", "0%", "-6%"],
  );

  // Slanted wipe from the right. `edge` is the x position (in %) of the top of the cut line.
  const edge = useTransform(progress, first ? [0, 0.001] : [c - WIPE_FROM, c + WIPE_TO], first ? [0, 0] : [100 + SLANT, 0]);
  const edgeLow = useTransform(edge, (v) => v - SLANT);
  const clipPath = useMotionTemplate`polygon(${edge}% 0%, 101% 0%, 101% 100%, ${edgeLow}% 100%)`;

  return (
    <motion.div className="absolute inset-0 will-change-[clip-path]" style={first ? undefined : { clipPath }}>
      <motion.div className="absolute inset-[-2%] will-change-transform" style={{ scale, x: drift }}>
        <Image src={beat.image.src} alt={beat.image.alt} fill sizes="100vw" className="cine-img object-cover" style={{ objectPosition: beat.image.position }} />
      </motion.div>
      <div className="absolute inset-0 bg-night/60 md:bg-night/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/60" />
    </motion.div>
  );
}

/** Ember hairline that rides the leading edge of a wipe. */
function WipeEdge({ i, n, progress }: { i: number; n: number; progress: MotionValue<number> }) {
  const c = i / n;
  const x = useTransform(progress, [c - WIPE_FROM, c + WIPE_TO], ["100vw", `${-SLANT}vw`]);
  const opacity = useTransform(progress, [c - WIPE_FROM, c - WIPE_FROM + 0.012, c + WIPE_TO - 0.012, c + WIPE_TO], [0, 1, 1, 0]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 will-change-transform"
      style={{
        x,
        opacity,
        width: `${SLANT}vw`,
        background: "linear-gradient(to bottom right, transparent calc(50% - 1.5px), var(--color-ember) 50%, transparent calc(50% + 1.5px))",
      }}
    />
  );
}

/** One word of a statement: rises from its mask as the beat arrives, leaves upward as the next one comes. */
function Word({ word, j, m, i, n, progress, space }: { word: string; j: number; m: number; i: number; n: number; progress: MotionValue<number>; space: boolean }) {
  const first = i === 0;
  const last = i === n - 1;
  const c = i / n;
  const next = (i + 1) / n;
  // Stagger: each word owns the second half of a window that slides with its index.
  const lag = (span: number) => (m > 1 ? (j / (m - 1)) * span * 0.5 : 0);
  const inSpan = IN_FROM + IN_TO;
  const outSpan = OUT_FROM - OUT_TO;
  const inA = c - IN_FROM + lag(inSpan);
  const inB = inA + inSpan * 0.5;
  const outA = next - OUT_FROM + lag(outSpan);
  const outB = outA + outSpan * 0.5;

  const y = useTransform(
    progress,
    first ? [0, outA, outB] : last ? [inA, inB, 1] : [inA, inB, outA, outB],
    first ? ["0%", "0%", "-118%"] : last ? ["118%", "0%", "0%"] : ["118%", "0%", "0%", "-118%"],
  );
  const rotate = useTransform(
    progress,
    first ? [0, outA, outB] : last ? [inA, inB, 1] : [inA, inB, outA, outB],
    first ? [0, 0, -4] : last ? [6, 0, 0] : [6, 0, 0, -4],
  );

  return (
    <span aria-hidden className="inline-block overflow-hidden pb-[0.14em] align-top whitespace-nowrap [margin-bottom:-0.06em]">
      {/* Time-based entrance for the opening statement only (the others are scrubbed by scroll). */}
      <motion.span
        className="inline-block origin-bottom-left will-change-transform"
        variants={
          first
            ? { hidden: { y: "118%", rotate: 6 }, show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE, delay: 0.1 + j * 0.07 } } }
            : undefined
        }
      >
        <motion.span className="inline-block origin-bottom-left will-change-transform" style={{ y, rotate }}>
          {word}
        </motion.span>
      </motion.span>
      {space ? " " : ""}
    </span>
  );
}

/** Statement + note of one beat. All beats share one grid cell so the label above never moves. */
function Copy({ beat, i, n, progress }: { beat: Beat; i: number; n: number; progress: MotionValue<number> }) {
  const first = i === 0;
  const last = i === n - 1;
  const c = i / n;
  const next = (i + 1) / n;
  const words = beat.line.split(" ");

  // The note follows the last word in and leaves with the first word out.
  const stops = first
    ? [0, next - OUT_FROM, next - OUT_FROM + 0.03]
    : last
      ? [c + 0.03, c + IN_TO + 0.015, 1]
      : [c + 0.03, c + IN_TO + 0.015, next - OUT_FROM, next - OUT_FROM + 0.03];
  const opacity = useTransform(progress, stops, first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]);
  const y = useTransform(progress, stops, first ? [0, 0, -28] : last ? [36, 0, 0] : [36, 0, 0, -28]);
  const ruleScale = useTransform(progress, stops, first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]);

  return (
    <motion.div
      className="col-start-1 row-start-1"
      initial={first ? "hidden" : undefined}
      whileInView={first ? "show" : undefined}
      viewport={{ once: true, amount: 0.3 }}
    >
      <p className="display max-w-5xl text-[clamp(2.8rem,8.4vw,8.6rem)] text-day" aria-label={beat.line}>
        {words.map((w, j) => (
          <Word key={j} word={w} j={j} m={words.length} i={i} n={n} progress={progress} space={j < words.length - 1} />
        ))}
      </p>
      <motion.div className="mt-8 flex max-w-xl gap-5" style={{ opacity, y }}>
        <motion.span aria-hidden className="mt-[0.35em] block w-px shrink-0 origin-top self-stretch bg-ember" style={{ scaleY: ruleScale }} />
        <p className="text-base leading-relaxed text-day/85 md:text-xl">{beat.note}</p>
      </motion.div>
    </motion.div>
  );
}

/** One third of the progress rail: fills while its beat is on stage. */
function RailSegment({ i, n, progress }: { i: number; n: number; progress: MotionValue<number> }) {
  const scaleX = useTransform(progress, [i / n, (i + 1) / n], [0, 1]);
  return (
    <div className="h-px flex-1 bg-day/15">
      <motion.div className="h-px origin-left bg-ember" style={{ scaleX }} />
    </div>
  );
}

/** Pinned, scroll-driven opening argument in three beats. */
export function Opportunity() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress: rawProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Arrival: the stage opens like a shutter from an inset, rounded card while it scrolls up to the pin.
  const { scrollYProgress: rawArrive } = useScroll({ target: ref, offset: ["start end", "start 0.3"] });
  // Passing progress through a function keeps every derived value on the main thread. Motion would otherwise
  // hand opacity to a native view timeline, which mistracks inside this pinned stage (notes stayed half visible).
  const scrollYProgress = useTransform(rawProgress, (v) => v);
  const arrive = useTransform(rawArrive, (v) => v);
  const n = opportunity.beats.length;

  const inset = useTransform(arrive, [0, 1], [5, 0]);
  const insetTop = useTransform(arrive, [0, 1], [7, 0]);
  const radius = useTransform(arrive, [0, 1], [28, 0]);
  const stageClip = useMotionTemplate`inset(${insetTop}% ${inset}% 0% ${inset}% round ${radius}px)`;

  // Odometer: the beat number ticks over at each cut.
  const tickStops: number[] = [0];
  const tickOut: string[] = ["0%"];
  for (let i = 1; i < n; i++) {
    tickStops.push(i / n - 0.03, i / n + 0.03);
    tickOut.push(`${(-(i - 1) / n) * 100}%`, `${(-i / n) * 100}%`);
  }
  tickStops.push(1);
  tickOut.push(`${(-(n - 1) / n) * 100}%`);
  const tick = useTransform(scrollYProgress, tickStops, tickOut);
  const ghostX = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  if (reduced) {
    return (
      <section ref={ref} id="opportunity" className="bg-night">
        {opportunity.beats.map((beat, i) => (
          <div key={beat.line} className="relative flex min-h-[80svh] items-center overflow-hidden">
            <Image src={beat.image.src} alt={beat.image.alt} fill sizes="100vw" className="cine-img object-cover" style={{ objectPosition: beat.image.position }} />
            <div className="absolute inset-0 bg-night/75" />
            <div className="relative mx-auto w-full max-w-7xl px-5 py-20 md:px-10">
              <span className="label text-ember">{String(i + 1).padStart(2, "0")}</span>
              <p className="display mt-6 max-w-5xl text-[clamp(2.8rem,8.4vw,8.6rem)] text-day">{beat.line}</p>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-day/85 md:text-xl">{beat.note}</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  const numbers = opportunity.beats.map((_, i) => String(i + 1).padStart(2, "0"));

  return (
    <section ref={ref} id="opportunity" className="relative bg-night" style={{ height: `${n * 120}svh` }} aria-label={opportunity.label}>
      <motion.div className="sticky top-0 h-[100svh] overflow-hidden" style={{ clipPath: stageClip }}>
        {opportunity.beats.map((beat, i) => (
          <Photo key={beat.line} beat={beat} i={i} n={n} progress={scrollYProgress} />
        ))}
        {opportunity.beats.map((beat, i) => (i > 0 ? <WipeEdge key={beat.line} i={i} n={n} progress={scrollYProgress} /> : null))}

        {/* Giant ghost numeral: ticks with the beat, drifts sideways with scroll. */}
        <motion.div
          aria-hidden
          className="display pointer-events-none absolute right-[3%] bottom-[9%] hidden h-[1em] overflow-hidden text-[clamp(10rem,24vw,24rem)] leading-none text-day/10 md:block"
          style={{ x: ghostX }}
        >
          <motion.div className="will-change-transform" style={{ y: tick }}>
            {numbers.map((s) => (
              <span key={s} className="block h-[1em]">{s}</span>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-5 md:px-10">
          <span className="label flex items-center gap-4 text-day">
            <span aria-hidden className="block h-[1.2em] overflow-hidden text-ember">
              <motion.span className="block will-change-transform" style={{ y: tick }}>
                {numbers.map((s) => (
                  <span key={s} className="block h-[1.2em] leading-[1.2]">{s}</span>
                ))}
              </motion.span>
            </span>
            <span className="h-px w-10 bg-day-muted/50" aria-hidden />
            {opportunity.label}
          </span>
          <div className="mt-8 grid">
            {opportunity.beats.map((beat, i) => (
              <Copy key={beat.line} beat={beat} i={i} n={n} progress={scrollYProgress} />
            ))}
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-8 mx-auto flex max-w-7xl items-center gap-3 md:inset-x-10">
          {opportunity.beats.map((beat, i) => (
            <RailSegment key={beat.line} i={i} n={n} progress={scrollYProgress} />
          ))}
          <span className="label ml-2 text-[0.6rem] text-day-muted">0{n}</span>
        </div>
      </motion.div>
    </section>
  );
}
