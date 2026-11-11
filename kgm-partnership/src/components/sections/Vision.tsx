"use client";

import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { images, vehicles, vision } from "@/content/site";
import { THEME } from "@/content/theme";
import { StageTile } from "@/components/ui/VehicleCutout";
import { useMotionPrefs } from "@/components/Providers";
import { CineImage, FadeIn, SectionLabel } from "@/components/ui/Motion";
import { DrawLine, ParallaxLayer, Tilt } from "@/components/ui/Fx";

const EASE = [0.16, 1, 0.3, 1] as const;
const ACCENT = ["moves", "people"];

/**
 * Section headline, built letter by letter from masks (same look as the shared WordsReveal).
 * The in-view trigger sits on the heading itself and the letters follow through variants: a letter that
 * starts fully hidden behind its own mask never reports as "in view", so it cannot be its own trigger.
 */
function Headline({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  let n = 0;
  return (
    <motion.h2 className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -12% 0px" }}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-nowrap [margin-bottom:-0.04em]">
          {Array.from(w).map((c, ci) => {
            const d = n++ * 0.026;
            return (
              <motion.span
                key={ci}
                className="inline-block origin-bottom-left will-change-transform"
                variants={{
                  hidden: { y: "115%", rotate: 9, opacity: 0 },
                  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.05, ease: EASE, delay: d, opacity: { duration: 0.4, delay: d } } },
                }}
              >
                {c}
              </motion.span>
            );
          })}
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </motion.h2>
  );
}

/** One word of the title-card statement: lights up as the pinned card is scrubbed; accent words get an underline that draws itself. */
function CardWord({ word, i, n, progress, reduced, last }: { word: string; i: number; n: number; progress: MotionValue<number>; reduced: boolean; last: boolean }) {
  const accent = ACCENT.includes(word.replace(/[.,]/g, ""));
  // Fill window of the whole sentence: 0.04 → 0.72 of the pin, the rest is a hold.
  const a = 0.04 + (i / n) * 0.68;
  const b = 0.04 + ((i + 1) / n) * 0.68;
  const opacity = useTransform(progress, [a, b], [THEME === "sand" ? 0.3 : 0.16, 1]);
  const y = useTransform(progress, [a, b], ["0.12em", "0em"]);
  const line = useTransform(progress, [b, Math.min(0.98, b + 0.1)], [0, 1]);
  return (
    <span aria-hidden className="relative inline-block">
      <motion.span className={`inline-block will-change-transform ${accent ? "text-signal" : ""}`} style={reduced ? undefined : { opacity, y }}>
        {word}
      </motion.span>
      {accent && <motion.span className="absolute inset-x-0 bottom-[-0.08em] block h-[2px] origin-left bg-signal" style={{ scaleX: reduced ? 1 : line }} />}
      {last ? "" : " "}
    </span>
  );
}

/** The statement as a pinned title card: a panel opens from an inset rounded card, the sentence fills with scroll, then holds. */
function TitleCard({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawArrive } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const { scrollYProgress: rawPin } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Through a function on purpose: it keeps derived values on the main thread. Motion would otherwise hand
  // opacity to a native view timeline, which mistracks inside a pinned scene (the sentence dimmed again on exit).
  const arrive = useTransform(rawArrive, (v) => v);
  const pin = useTransform(rawPin, (v) => v);

  const insetX = useTransform(arrive, [0.1, 1], [9, 0]);
  const insetY = useTransform(arrive, [0.1, 1], [12, 0]);
  const radius = useTransform(arrive, [0.1, 1], [36, 0]);
  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;
  const scale = useTransform(arrive, [0.1, 1], [1.14, 1]);
  const rail = useTransform(pin, [0.04, 0.82], [0, 1]);
  const marks = useTransform(arrive, [0.6, 1], [0, 1]);

  const words = vision.statement.split(" ");
  const corner = "absolute h-5 w-5 border-bone/40 md:h-7 md:w-7";

  return (
    <div ref={ref} className={reduced ? "relative mt-28 md:mt-40" : "relative mt-28 h-[210svh] md:mt-40"}>
      <div className={reduced ? "relative overflow-hidden py-28 md:py-40" : "sticky top-0 h-[100svh] overflow-hidden"}>
        <motion.div aria-hidden className="absolute inset-0 bg-charcoal will-change-[clip-path]" style={reduced ? undefined : { clipPath }} />

        {/* Frame marks: the corners of a title card */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-5 md:inset-10" style={{ opacity: reduced ? 1 : marks }}>
          <span className={`${corner} top-0 left-0 border-t border-l`} />
          <span className={`${corner} top-0 right-0 border-t border-r`} />
          <span className={`${corner} bottom-0 left-0 border-b border-l`} />
          <span className={`${corner} right-0 bottom-0 border-r border-b`} />
        </motion.div>

        <div className={`relative mx-auto flex max-w-6xl flex-col items-center justify-center px-8 md:px-16 ${reduced ? "" : "h-full"}`}>
          <motion.p
            className="display text-center text-[clamp(2.1rem,6vw,5.6rem)] leading-[1.04] text-bone will-change-transform"
            style={{ scale: reduced ? 1 : scale }}
            aria-label={vision.statement}
          >
            {words.map((w, i) => (
              <CardWord key={i} word={w} i={i} n={words.length} progress={pin} reduced={reduced} last={i === words.length - 1} />
            ))}
          </motion.p>
          <div aria-hidden className="mt-12 h-px w-40 bg-bone/15 md:mt-16 md:w-64">
            <motion.div className="h-px origin-left bg-signal" style={{ scaleX: reduced ? 1 : rail }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Vision() {
  const collageRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: collageRef, offset: ["start end", "end start"] });
  // Three depths: the frame barely moves, the car tile drifts, the portrait travels fastest.
  const far = useTransform(scrollYProgress, [0, 1], ["-6%", "10%"]);
  const slow = useTransform(scrollYProgress, [0, 1], ["9%", "-9%"]);
  const fast = useTransform(scrollYProgress, [0, 1], ["26%", "-8%"]);
  // Both pieces arrive slightly rotated and settle square as they reach the middle of the screen.
  const tileRotate = useTransform(scrollYProgress, [0.05, 0.5], [5, 0]);
  const portraitRotate = useTransform(scrollYProgress, [0.1, 0.55], [-7, 0]);

  return (
    <section id="vision" className="relative overflow-x-clip bg-ink pt-28 md:pt-44">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionLabel>{vision.label}</SectionLabel>

        <div className="mt-10 grid gap-16 md:mt-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <Headline text={vision.title} className="display text-[clamp(3rem,8vw,7.5rem)] text-bone" />
            <DrawLine className="mt-10 w-28 text-signal md:mt-12" delay={0.5} />
            <div className="mt-8 max-w-xl space-y-6 text-base leading-relaxed text-silver md:mt-10 md:text-lg">
              {vision.body.map((p, i) => (
                <FadeIn key={p} as="p" delay={0.15 + i * 0.12}>{p}</FadeIn>
              ))}
              <FadeIn as="p" className="text-bone" delay={0.15 + vision.body.length * 0.12}>{vision.closing}</FadeIn>
            </div>
          </div>

          {/* Floating collage: automotive meets basketball */}
          <div ref={collageRef} className="relative h-[520px] md:col-span-5 md:h-auto md:min-h-[640px]" aria-hidden={false}>
            {/* Back plane: an empty frame, furthest away */}
            <motion.div aria-hidden style={{ y: reduced ? 0 : far }} className="absolute top-[9%] right-[13%] w-[72%]">
              <ParallaxLayer depth={6}>
                <motion.div
                  className="aspect-[5/4] origin-top-right border hairline"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
                />
              </ParallaxLayer>
            </motion.div>

            {/* Middle plane: the car on its stage */}
            <motion.div style={{ y: reduced ? 0 : slow, rotate: reduced ? 0 : tileRotate }} className="absolute top-0 right-0 w-[72%] origin-bottom-right">
              <ParallaxLayer depth={-12}>
                <Tilt max={7}>
                  <motion.div
                    className="shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
                    initial={{ clipPath: "inset(0% 0% 0% 100%)" }}
                    whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                    viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                    transition={{ duration: 1.4, ease: EASE }}
                  >
                    <motion.div
                      initial={{ scale: 1.2, x: "8%" }}
                      whileInView={{ scale: 1, x: "0%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: EASE }}
                    >
                      <StageTile vehicle={vehicles.actyon} className="aspect-[5/4]" sizes="(min-width: 768px) 30vw, 70vw" />
                    </motion.div>
                  </motion.div>
                </Tilt>
                <span className="label mt-3 block text-[0.6rem]">Movilidad</span>
              </ParallaxLayer>
            </motion.div>

            {/* Front plane: the player, closest to the viewer */}
            <motion.div style={{ y: reduced ? 0 : fast, rotate: reduced ? 0 : portraitRotate }} className="absolute bottom-0 left-0 z-10 w-[55%] origin-bottom-left">
              <ParallaxLayer depth={22}>
                <Tilt max={5} sheen={false}>
                  <CineImage
                    img={images.esdPortrait}
                    className="aspect-[4/5] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.7)]"
                    sizes="(min-width: 768px) 22vw, 55vw"
                    reveal="up"
                    delay={0.25}
                  />
                </Tilt>
                <span className="label mt-3 block text-[0.6rem]">Deporte</span>
              </ParallaxLayer>
            </motion.div>
          </div>
        </div>
      </div>

      <TitleCard reduced={reduced} />
    </section>
  );
}
