"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { images, whoWeAre } from "@/content/site";
import { CineImage, FadeIn, LetterFill, SectionLabel, WordsReveal } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function WhoWeAre() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
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
  const pillar = whoWeAre.pillars[active];

  return (
    <section id="who-we-are" className="relative bg-charcoal">
      {/* Intro — full-bleed statement */}
      <div className="relative overflow-hidden">
        <CineImage img={images.esdCamp} className="h-[70svh] min-h-[460px] w-full md:h-[86svh]" parallax={8} reveal="none" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-ink/60" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-12 md:px-10 md:pb-20">
          <SectionLabel className="text-bone">{whoWeAre.label}</SectionLabel>
          <WordsReveal text={whoWeAre.title} as="h2" className="display mt-6 max-w-5xl text-[clamp(3rem,9vw,8.5rem)] text-bone" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-32">
        <FadeIn as="p" className="max-w-3xl font-serif text-2xl leading-snug text-bone md:text-4xl">
          {whoWeAre.intro}
        </FadeIn>

        <div className="mt-20 grid gap-12 md:mt-32 md:grid-cols-12 md:gap-16">
          {/* Sticky visual that follows the active pillar */}
          <div className="hidden md:col-span-5 md:block">
            <div className="sticky top-28 h-[calc(100svh-9rem)]">
              <div className="relative h-full overflow-hidden bg-ink">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                    animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                    exit={{ opacity: 0.4 }}
                    transition={{ duration: 1.1, ease: EASE }}
                  >
                    <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: EASE }}>
                      <Image src={pillar.image.src} alt={pillar.image.alt} fill sizes="40vw" className="cine-img object-cover" style={{ objectPosition: pillar.image.position }} />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-baseline gap-3">
                  <span className="display text-6xl text-bone">{pillar.n}</span>
                  <span className="label">/ 03</span>
                </div>
              </div>
            </div>
          </div>

          <ol ref={listRef} className="md:col-span-7">
            {whoWeAre.pillars.map((p) => (
              <li key={p.n} className="border-t hairline py-14 first:border-t-0 first:pt-0 md:min-h-[80svh] md:py-20">
                <span className="label text-signal">{p.n}</span>
                <h3 className="display mt-5 text-[clamp(2.6rem,5.5vw,5rem)]">
                  <LetterFill text={p.title} />
                </h3>
                <CineImage img={p.image} className="mt-8 aspect-[16/10] md:hidden" sizes="100vw" />
                <FadeIn as="p" className="mt-8 max-w-xl text-base leading-relaxed text-silver md:text-lg">
                  {p.body}
                </FadeIn>

                {"points" in p && p.points && (
                  <ul className="mt-10 grid max-w-xl grid-cols-1 sm:grid-cols-2">
                    {p.points.map((pt, k) => (
                      <FadeIn as="li" key={pt} delay={k * 0.06} y={14} className="flex items-center gap-4 border-b hairline py-4 text-bone">
                        <span className="h-1 w-1 rounded-full bg-signal" aria-hidden />
                        {pt}
                      </FadeIn>
                    ))}
                  </ul>
                )}

                {"footnote" in p && p.footnote && (
                  <FadeIn as="p" className="mt-8 max-w-xl font-serif text-2xl text-bone italic">
                    {p.footnote}
                  </FadeIn>
                )}

                {"formats" in p && p.formats && (
                  <div className="mt-10 grid gap-px bg-bone/10 sm:grid-cols-2">
                    {p.formats.map((f, k) => (
                      <FadeIn key={f.name} delay={k * 0.12} className="bg-charcoal p-6 sm:p-8">
                        <span className="display text-5xl text-bone md:text-6xl">{f.name.split(" ")[0]}</span>
                        <span className="label mt-2 block">{f.name.split(" ").slice(1).join(" ")}</span>
                        <p className="mt-6 text-silver">{f.text}</p>
                      </FadeIn>
                    ))}
                  </div>
                )}

                <div className="mt-10 hidden max-w-sm md:block">
                  <CineImage img={p.image2} className="aspect-[16/10]" sizes="25vw" reveal="left" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
