"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { difference } from "@/content/site";
import { FadeIn, SectionLabel } from "@/components/ui/Motion";
import { DrawLine } from "@/components/ui/Fx";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_INOUT = [0.76, 0, 0.24, 1] as const;

/* Title: letters rise from a mask, triggered by the heading itself (never by a clipped letter). */
const titleLetter: Variants = {
  hidden: { y: "115%", rotate: 9 },
  show: (i: number) => ({ y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE_OUT, delay: i * 0.035 } }),
};

/* Row timeline: hairline + old phrase -> strike draws across it -> arrow travels -> new phrase rises. */
const line: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.2, ease: EASE_INOUT } },
};
const beforeCell: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};
const strike: Variants = {
  hidden: { backgroundSize: "0% 1px" },
  show: { backgroundSize: "100% 1px", transition: { duration: 0.45, ease: EASE_INOUT, delay: 0.1 } },
};
const arrowTrack: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.4, ease: EASE_INOUT, delay: 0.25 } },
};
const arrowHead: Variants = {
  hidden: { opacity: 0, x: -44 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_INOUT, delay: 0.25, opacity: { duration: 0.2, delay: 0.25 } } },
};
const afterWord: Variants = {
  hidden: { y: "115%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.7, ease: EASE_OUT, delay: 0.4 + i * 0.035 } }),
};

function Row({ before, after, request }: { before: string; after: string; request: () => number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [on, setOn] = useState(false);

  // Rows queue up: even if several arrive together, they play one after another.
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setOn(true), request());
    return () => clearTimeout(t);
  }, [inView, request]);

  return (
    <motion.div
      ref={ref}
      role="row"
      className="group relative grid grid-cols-2 items-baseline gap-6 py-6 transition-opacity duration-500 ease-out group-hover/table:opacity-40 hover:!opacity-100 md:grid-cols-12 md:gap-10 md:py-8"
      initial="hidden"
      animate={on ? "show" : "hidden"}
    >
      <motion.span
        role="cell"
        variants={beforeCell}
        className="text-base text-silver/55 [html[data-theme=sand]_&]:text-silver/85 md:col-span-5 md:text-xl"
      >
        <motion.span
          variants={strike}
          className="bg-[linear-gradient(var(--color-signal),var(--color-signal))] bg-[position:0_56%] bg-no-repeat"
        >
          {before}
        </motion.span>
      </motion.span>
      <span aria-hidden className="hidden items-center gap-1 text-signal md:col-span-1 md:flex">
        <motion.span variants={arrowTrack} className="h-px flex-1 origin-left bg-signal/50" />
        <motion.span variants={arrowHead} className="inline-block">
          <span className="inline-block transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-2">→</span>
        </motion.span>
      </span>
      <span
        role="cell"
        className="display text-2xl leading-[1.05] text-bone transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] md:col-span-6 md:text-[2.6rem] md:group-hover:translate-x-3"
      >
        <span className="sr-only">{after}</span>
        {after.split(" ").map((w, wi, all) => (
          <span key={wi} aria-hidden>
            <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.2em] align-top">
              <motion.span custom={wi} variants={afterWord} className="inline-block will-change-transform">
                {w}
              </motion.span>
            </span>
            {wi < all.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
      <motion.span variants={line} className="absolute bottom-0 left-0 h-px w-full origin-left bg-bone/15" aria-hidden />
      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" aria-hidden />
    </motion.div>
  );
}

export function Difference() {
  const last = useRef(0);
  const request = useCallback(() => {
    const now = performance.now();
    const start = Math.max(now, last.current + 110);
    last.current = start;
    return start - now;
  }, []);

  const words = difference.title.split(" ");
  let n = 0;

  return (
    <section id="difference" className="relative bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <SectionLabel>{difference.label}</SectionLabel>
            <motion.h2
              aria-label={difference.title}
              className="display mt-8 text-[clamp(3.2rem,9vw,8.5rem)] text-bone"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            >
              {words.map((w, wi) => (
                <span key={wi} aria-hidden>
                  <span className="-mb-[0.06em] inline-block overflow-hidden pb-[0.14em] align-top whitespace-nowrap">
                    {Array.from(w).map((c, ci) => (
                      <motion.span key={ci} custom={n++} variants={titleLetter} className="inline-block origin-bottom-left will-change-transform">
                        {c}
                      </motion.span>
                    ))}
                  </span>
                  {wi < words.length - 1 ? " " : ""}
                </span>
              ))}
            </motion.h2>
          </div>
          <FadeIn as="p" delay={0.35} className="self-end font-serif text-2xl leading-snug text-silver italic md:col-span-4 md:text-3xl">
            {difference.intro}
          </FadeIn>
        </div>

        <div className="group/table mt-16 md:mt-24" role="table" aria-label={difference.title}>
          <div role="row" className="relative grid grid-cols-2 gap-6 pb-5 md:grid-cols-12 md:gap-10">
            <FadeIn as="span" y={10} className="md:col-span-5">
              <span role="columnheader" className="label">{difference.left}</span>
            </FadeIn>
            <FadeIn as="span" y={10} delay={0.15} className="md:col-span-6 md:col-start-7">
              <span role="columnheader" className="label !text-tan">{difference.right}</span>
            </FadeIn>
            <DrawLine className="absolute bottom-0 left-0 w-full text-bone/15" />
          </div>
          {difference.rows.map(([before, after]) => (
            <Row key={before} before={before} after={after} request={request} />
          ))}
        </div>
      </div>
    </section>
  );
}
