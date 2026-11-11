"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { synergy, type Img, type Vehicle } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { DrawLine, useVelocitySkew } from "@/components/ui/Fx";
import { FadeIn, ScrollFillText, SectionLabel } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IO = [0.76, 0, 0.24, 1] as const;

/**
 * Section headline built letter by letter from masks. Same look as the shared WordsReveal, but the
 * viewport is observed on the heading itself: letters parked below their mask are fully clipped,
 * so observing them individually never fires.
 */
function Headline({ text, as = "h2", className = "", delay = 0 }: { text: string; as?: "h2" | "span"; className?: string; delay?: number }) {
  const M = motion[as];
  const words = text.split(" ");
  let n = 0;
  return (
    <M className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -12% 0px" }}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-nowrap [margin-bottom:-0.04em]">
          {Array.from(w).map((c, ci) => {
            const d = delay + n++ * 0.022;
            return (
              <motion.span
                key={ci}
                className="inline-block origin-bottom-left will-change-transform"
                variants={{
                  hidden: { y: "115%", rotate: 9, opacity: 0 },
                  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: d, opacity: { duration: 0.4, delay: d } } },
                }}
              >
                {c}
              </motion.span>
            );
          })}
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </M>
  );
}

/**
 * One giant word. The row travels sideways with scroll (odd/even rows in opposite directions),
 * leans with scroll speed, its letters rise from a mask one by one and the pill opens from a line.
 * A hollow echo of the word bleeds off the screen and travels faster, for depth.
 */
function Row({ word, img, dir, index, skew }: { word: string; img?: Img | Vehicle; dir: 1 | -1; index: number; skew: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // t is a unit-less factor; the distance itself is a CSS variable so phones travel less.
  const t = useTransform(scrollYProgress, [0, 1], [dir * 1, dir * -0.2]);
  const x = useMotionTemplate`calc(${t} * var(--syn-travel))`;
  const ghostT = useTransform(scrollYProgress, [0, 1], [dir * 1.6, dir * -1.6]);
  const ghostX = useMotionTemplate`calc(${ghostT} * var(--syn-travel))`;
  const lean = useTransform(skew, (v) => v * dir);
  const accent = index === 1;
  const chars = Array.from(word);

  const ghost = (
    <motion.span
      aria-hidden
      style={reduced ? undefined : { x: ghostX }}
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1.4, delay: 0.5 } } }}
      className={`display shrink-0 text-[clamp(2.4rem,11vw,13rem)] leading-[0.95] text-transparent [-webkit-text-stroke:1px_color-mix(in_srgb,var(--color-bone)_26%,transparent)] ${accent ? "italic" : ""}`}
    >
      {word}
    </motion.span>
  );

  return (
    <div ref={ref} className="relative overflow-hidden py-2 [--syn-travel:4vw] md:py-3 md:[--syn-travel:7vw]">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px 0% 0px" }}
        style={reduced ? undefined : { x, skewX: lean }}
        className={`flex items-center gap-[3vw] px-5 whitespace-nowrap will-change-transform md:px-10 ${dir === 1 ? "justify-start" : "justify-end"}`}
      >
        {dir === -1 && ghost}
        {dir === -1 && img && <Pill img={img} />}
        <span className={`display shrink-0 text-[clamp(2.4rem,11vw,13rem)] leading-[0.95] ${accent ? "text-signal italic" : "text-bone"}`}>
          <span className="sr-only">{word}</span>
          <span aria-hidden className="-mx-[0.08em] -mb-[0.16em] inline-block overflow-hidden px-[0.08em] pb-[0.16em] align-top">
            {chars.map((c, i) => (
              <motion.span
                key={i}
                className="inline-block origin-bottom-left"
                variants={{
                  hidden: { y: "112%", rotate: 8 },
                  show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE, delay: i * 0.035 } },
                }}
              >
                {c === " " ? " " : c}
              </motion.span>
            ))}
          </span>
        </span>
        {dir === 1 && img && <Pill img={img} />}
        <motion.span
          className="label hidden shrink-0 md:inline"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, delay: 0.7 } } }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>
        {dir === 1 && ghost}
      </motion.div>
      <DrawLine className="absolute right-0 bottom-0 left-0 text-bone/[0.14]" delay={0.1} />
    </div>
  );
}

/** The pill is drawn as a line first, then opens to its full height while the image settles. */
function Pill({ img }: { img: Img | Vehicle }) {
  const { reduced } = useMotionPrefs();
  const box = "group/pill relative inline-block h-[clamp(2.6rem,8vw,8.5rem)] w-[clamp(5rem,18vw,19rem)] shrink-0 overflow-hidden rounded-full";
  const open = "inset(0% 0% 0% 0% round 999px)";
  const variants = {
    hidden: { clipPath: reduced ? open : "inset(48% 50% 48% 50% round 999px)" },
    show: {
      clipPath: reduced ? open : ["inset(48% 50% 48% 50% round 999px)", "inset(48% 0% 48% 0% round 999px)", open],
      transition: { duration: 0.9, ease: EASE_IO, times: [0, 0.45, 1], delay: 0.1 },
    },
  };
  const inner = { hidden: { scale: 1.5 }, show: { scale: 1, transition: { duration: 1.2, ease: EASE, delay: 0.2 } } };
  if ("img" in img) {
    return (
      <motion.span variants={variants} className={`${box} bg-[radial-gradient(ellipse_at_50%_120%,#24506f_0%,#142a3d_60%)]`}>
        <motion.span variants={inner} className="absolute inset-0">
          <Image src={img.img.src} alt={img.img.alt} fill sizes="20vw" className="object-contain p-[6%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pill:scale-110" />
        </motion.span>
      </motion.span>
    );
  }
  return (
    <motion.span variants={variants} className={box}>
      <motion.span variants={inner} className="absolute inset-0">
        <Image src={img.src} alt={img.alt} fill sizes="20vw" className="cine-img object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pill:scale-110" style={{ objectPosition: img.position }} />
      </motion.span>
    </motion.span>
  );
}

export function Synergy() {
  const skew = useVelocitySkew(7);
  return (
    <section id="synergy" className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionLabel>{synergy.label}</SectionLabel>
        <h2 className="mt-8" aria-label={synergy.title.join(" ")}>
          {synergy.title.map((t, i) => (
            <Headline key={t} text={t} as="span" delay={i * 0.2} className={`display block text-[clamp(2.6rem,6vw,5.6rem)] ${i === 1 ? "text-silver italic" : "text-bone"}`} />
          ))}
        </h2>
      </div>

      <div className="relative mt-16 md:mt-24">
        <DrawLine className="absolute top-0 right-0 left-0 text-bone/[0.14]" />
        {synergy.values.map((v, i) => (
          <Row key={v} word={v} index={i} dir={i % 2 === 0 ? 1 : -1} img={synergy.inline[i % synergy.inline.length]} skew={skew} />
        ))}
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl gap-8 px-5 md:mt-28 md:grid-cols-12 md:px-10">
        <ScrollFillText text={synergy.body[0]} className="font-serif text-2xl leading-snug text-bone md:col-span-7 md:text-4xl" />
        <FadeIn as="p" delay={0.2} className="label self-end text-bone md:col-span-4 md:col-start-9">
          <span className="text-signal">—</span> {synergy.body[1]}
        </FadeIn>
      </div>
    </section>
  );
}
