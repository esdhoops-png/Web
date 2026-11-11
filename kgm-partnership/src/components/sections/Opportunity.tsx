"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { opportunity } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";

type Beat = (typeof opportunity.beats)[number];

function BeatLayer({ beat, i, n, progress }: { beat: Beat; i: number; n: number; progress: MotionValue<number> }) {
  const a = i / n;
  const b = (i + 1) / n;
  const fade = 0.06;
  // Keyframe positions must stay inside 0–1 and increase: the first beat is
  // visible from the start and the last one stays until the section ends.
  const first = i === 0;
  const last = i === n - 1;
  const stops = [first ? 0 : a - fade, first ? 0.001 : a + fade, last ? 0.999 : b - fade, last ? 1 : b + fade];
  const opacity = useTransform(progress, stops, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(progress, [a, b], ["6%", "-6%"]);
  const scale = useTransform(progress, [a, b], [1.12, 1]);
  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <motion.div className="absolute inset-0" style={{ scale }}>
        <Image src={beat.image.src} alt={beat.image.alt} fill sizes="100vw" className="cine-img object-cover" style={{ objectPosition: beat.image.position }} />
      </motion.div>
      <div className="absolute inset-0 bg-night/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/70" />
      <motion.div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-5 md:px-10" style={{ y }}>
        <span className="label flex items-center gap-4 text-day">
          <span className="text-ember">{String(i + 1).padStart(2, "0")}</span>
          <span className="h-px w-10 bg-day-muted/50" aria-hidden />
          {opportunity.label}
        </span>
        <p className="display mt-8 max-w-5xl text-[clamp(2.8rem,8.4vw,8.6rem)] text-day">{beat.line}</p>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-day/85 md:text-xl">{beat.note}</p>
      </motion.div>
    </motion.div>
  );
}

/** Pinned, scroll-driven opening argument in three beats. */
export function Opportunity() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = opportunity.beats.length;
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (reduced) {
    return (
      <section id="opportunity" className="bg-night">
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

  return (
    <section ref={ref} id="opportunity" className="relative bg-night" style={{ height: `${n * 110}svh` }} aria-label={opportunity.label}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {opportunity.beats.map((beat, i) => (
          <BeatLayer key={beat.line} beat={beat} i={i} n={n} progress={scrollYProgress} />
        ))}
        <div className="absolute inset-x-5 bottom-8 mx-auto flex max-w-7xl items-center gap-5 md:inset-x-10">
          <div className="h-px flex-1 bg-day/15">
            <motion.div className="h-px origin-left bg-ember" style={{ scaleX: bar }} />
          </div>
          <span className="label text-[0.6rem] text-day-muted">0{n}</span>
        </div>
      </div>
    </section>
  );
}
