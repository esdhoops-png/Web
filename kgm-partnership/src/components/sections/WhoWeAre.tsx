"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { images, whoWeAre } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { DrawLine, ParallaxLayer, Stagger, StaggerItem } from "@/components/ui/Fx";
import { CineImage, FadeIn, LetterFill, ScrollFillText, SectionLabel } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const WIPE = [0.76, 0, 0.24, 1] as const;

/**
 * Headline that builds itself letter by letter from behind a mask. The trigger sits on the
 * heading itself (never on the masked letters, which are clipped and would not be observed).
 */
function MaskHeadline({ text, className = "", id }: { text: string; className?: string; id?: string }) {
  const words = text.split(" ");
  let n = 0;
  return (
    <motion.h2 id={id} className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-nowrap [margin-bottom:-0.04em]">
          {Array.from(w).map((c, ci) => {
            const d = n++ * 0.024;
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

/**
 * Opening scene: the photo arrives as an inset, rounded card, opens to full bleed like a
 * shutter and keeps pushing in while it crosses the screen. The headline drifts at its own rate.
 */
function Opening() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const inset = useTransform(scrollYProgress, [0, 0.4], [10, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.4], [44, 0]);
  const clip = useMotionTemplate`inset(${inset}% ${inset}% 0% ${inset}% round ${radius}px)`;
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.26]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const textY = useTransform(scrollYProgress, [0.5, 1], [0, -110]);
  const veil = useTransform(scrollYProgress, [0.55, 1], [0, 0.55]);

  return (
    <motion.div ref={ref} className="relative overflow-hidden" style={reduced ? undefined : { clipPath: clip }}>
      <div className="relative h-[70svh] min-h-[460px] w-full overflow-hidden bg-charcoal md:h-[86svh]">
        <motion.div className="absolute inset-0 will-change-transform" style={reduced ? undefined : { scale, y: imgY }}>
          <Image
            src={images.esdCamp.src}
            alt={images.esdCamp.alt}
            fill
            sizes="100vw"
            className="cine-img object-cover"
            style={{ objectPosition: images.esdCamp.position ?? "50% 50%" }}
          />
        </motion.div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-night-2 via-night-2/40 to-night/60" />
      {/* the scene sinks into the dark as it leaves */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-night" style={{ opacity: reduced ? 0 : veil }} />
      <motion.div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-12 md:px-10 md:pb-20" style={reduced ? undefined : { y: textY }}>
        <SectionLabel className="text-day [&>span:first-child]:bg-day-muted/50">{whoWeAre.label}</SectionLabel>
        <MaskHeadline text={whoWeAre.title} className="display mt-6 max-w-5xl text-[clamp(3rem,9vw,8.5rem)] text-day" />
      </motion.div>
    </motion.div>
  );
}

/** A digit that counts up to its value by rolling a column of numbers through a mask. */
function RollDigit({ value, delay }: { value: number; delay: number }) {
  const n = value + 1;
  return (
    <span className="inline-block h-[1em] overflow-hidden align-top leading-none">
      <motion.span
        className="block will-change-transform"
        variants={{ hidden: { y: "0%" }, show: { y: `${-(value / n) * 100}%`, transition: { duration: 1.5, ease: WIPE, delay } } }}
      >
        {Array.from({ length: n }, (_, d) => (
          <span key={d} className="block h-[1em] leading-none">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** Line-art court that draws itself: half court for 3x3, full court for 5x5. */
function Court({ half, delay }: { half: boolean; delay: number }) {
  const paths = half
    ? ["M2,2H98V58H2Z", "M36,2V26H64V2", "M36,26A14,14 0 0 0 64,26", "M10,2V14A40,40 0 0 0 90,14V2", "M40,58A10,10 0 0 1 60,58"]
    : ["M2,2H98V58H2Z", "M50,2V58", "M50,22A8,8 0 1 0 50,38A8,8 0 1 0 50,22", "M2,20H18V40H2", "M98,20H82V40H98", "M18,22A8,8 0 0 1 18,38", "M82,22A8,8 0 0 0 82,38"];
  return (
    <svg aria-hidden viewBox="0 0 100 60" className="pointer-events-none absolute top-6 right-6 w-20 text-bone/30 sm:top-8 sm:right-8 sm:w-24" fill="none">
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            show: { pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: EASE, delay: delay + 0.15 + i * 0.14, opacity: { duration: 0.2, delay: delay + 0.15 + i * 0.14 } } },
          }}
        />
      ))}
    </svg>
  );
}

function FormatTile({ name, text, k }: { name: string; text: string; k: number }) {
  const [big, ...rest] = name.split(" ");
  const delay = k * 0.22;
  return (
    <motion.div
      className="group relative overflow-hidden bg-charcoal p-6 sm:p-8"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      <Court half={k === 0} delay={delay} />
      <span className="sr-only">{big}</span>
      <span aria-hidden className="display block text-5xl text-bone md:text-6xl">
        {Array.from(big).map((c, i) =>
          /\d/.test(c) ? (
            <RollDigit key={i} value={Number(c)} delay={delay + i * 0.12} />
          ) : (
            <motion.span
              key={i}
              className="inline-block align-top leading-none"
              variants={{ hidden: { opacity: 0, scale: 0.4 }, show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE, delay: delay + 0.9 } } }}
            >
              {c}
            </motion.span>
          ),
        )}
      </span>
      <motion.span
        className="label mt-2 block"
        variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE, delay: delay + 0.5 } } }}
      >
        {rest.join(" ")}
      </motion.span>
      <motion.p
        className="mt-6 text-silver"
        variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: delay + 0.65 } } }}
      >
        {text}
      </motion.p>
      {/* a hairline that closes the tile, drawn last */}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 block h-px origin-left bg-signal"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.4, ease: WIPE, delay: delay + 0.3 } } }}
      />
    </motion.div>
  );
}

export function WhoWeAre() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => {
    const items = listRef.current?.children;
    if (!items) return;
    const mid = window.innerHeight * 0.55;
    let idx = 0;
    Array.from(items).forEach((el, i) => {
      if (el.getBoundingClientRect().top < mid) idx = i;
    });
    setActive((a) => (a === idx ? a : idx));
  });
  // Progress through the three pillars, shown as a rail beside the sticky image.
  const { scrollYProgress: listProgress } = useScroll({ target: listRef, offset: ["start 0.55", "end 0.55"] });
  const pillars = whoWeAre.pillars;
  const wipe = { duration: reduced ? 0 : 1.15, ease: WIPE };

  return (
    <section id="who-we-are" className="relative bg-charcoal">
      {/* Intro — full-bleed statement */}
      <Opening />

      <div className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-32">
        <ScrollFillText text={whoWeAre.intro} className="max-w-3xl font-serif text-2xl leading-snug text-bone md:text-4xl" />

        <div className="mt-20 grid gap-12 md:mt-32 md:grid-cols-12 md:gap-16">
          {/* Sticky visual that follows the active pillar */}
          <div className="hidden md:col-span-5 md:block">
            <div className="sticky top-28 h-[calc(100svh-9rem)]">
              <motion.div
                className="relative h-full overflow-hidden bg-night"
                initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 1.5, ease: WIPE }}
              >
                {/* All three photos are stacked; each one wipes up over the previous (and back down when scrolling up). */}
                <ParallaxLayer depth={-12} className="absolute -inset-[4%]">
                  {pillars.map((p, i) => {
                    const shown = i <= active;
                    return (
                      <motion.div
                        key={p.n}
                        className="absolute inset-0"
                        style={{ zIndex: i }}
                        initial={false}
                        animate={{ clipPath: shown ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
                        transition={wipe}
                      >
                        <motion.div
                          className="absolute inset-0 will-change-transform"
                          initial={false}
                          animate={{ scale: i === active ? 1 : i < active ? 1.08 : 1.3, y: i < active ? "-7%" : "0%" }}
                          transition={{ duration: reduced ? 0 : 1.6, ease: WIPE }}
                        >
                          <Image src={p.image.src} alt={p.image.alt} fill sizes="40vw" className="cine-img object-cover" style={{ objectPosition: p.image.position }} />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </ParallaxLayer>
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-night/85 via-transparent to-transparent" />

                {/* progress rail */}
                <div aria-hidden className="absolute top-6 right-6 bottom-6 z-10 w-px bg-day/20">
                  <motion.span className="block h-full w-full origin-top bg-day" style={{ scaleY: reduced ? 1 : listProgress }} />
                </div>

                {/* big rolling numeral */}
                <div className="absolute bottom-5 left-6 z-10 flex items-end gap-4" aria-live="off">
                  <span className="sr-only">{pillars[active].n}</span>
                  <span aria-hidden className="display flex h-[1em] items-start overflow-hidden text-[clamp(6rem,10vw,10rem)] leading-none text-day">
                    <span className="block leading-none">0</span>
                    <motion.span className="block will-change-transform" initial={false} animate={{ y: `${(-active * 100) / pillars.length}%` }} transition={wipe}>
                      {pillars.map((p) => (
                        <span key={p.n} className="block h-[1em] leading-none">
                          {p.n.slice(-1)}
                        </span>
                      ))}
                    </motion.span>
                  </span>
                  <span className="label mb-3 text-day-muted">/ 03</span>
                </div>
              </motion.div>
            </div>
          </div>

          <ol ref={listRef} className="md:col-span-7">
            {pillars.map((p) => (
              <li key={p.n} className="border-t hairline py-14 first:border-t-0 first:pt-0 md:min-h-[80svh] md:py-20">
                <div className="flex items-center gap-4 text-signal">
                  <span className="label text-signal">{p.n}</span>
                  <DrawLine className="w-24" />
                </div>
                <h3 className="display mt-5 text-[clamp(2.6rem,5.5vw,5rem)]">
                  <LetterFill text={p.title} />
                </h3>
                <CineImage img={p.image} className="mt-8 aspect-[16/10] md:hidden" sizes="100vw" parallax={6} />
                <FadeIn as="p" className="mt-8 max-w-xl text-base leading-relaxed text-silver md:text-lg">
                  {p.body}
                </FadeIn>

                {"points" in p && p.points && (
                  <Stagger as="ul" gap={0.09} className="mt-10 grid max-w-xl grid-cols-1 sm:grid-cols-2">
                    {p.points.map((pt) => (
                      <StaggerItem as="li" key={pt} className="group border-b hairline py-4 text-bone">
                        <span className="flex items-center gap-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                          <span className="h-1 w-1 rounded-full bg-signal transition-transform duration-500 group-hover:scale-[2.2]" aria-hidden />
                          {pt}
                        </span>
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}

                {"footnote" in p && p.footnote && (
                  <FadeIn as="p" className="mt-8 max-w-xl font-serif text-2xl text-bone italic">
                    {p.footnote}
                  </FadeIn>
                )}

                {"formats" in p && p.formats && (
                  <div className="mt-10 grid gap-px bg-bone/10 sm:grid-cols-2">
                    {p.formats.map((f, k) => (
                      <FormatTile key={f.name} name={f.name} text={f.text} k={k} />
                    ))}
                  </div>
                )}

                <div className="mt-10 hidden max-w-sm md:block">
                  <CineImage img={p.image2} className="aspect-[16/10]" sizes="25vw" reveal="left" parallax={5} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
