"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useState } from "react";
import { whyKgm } from "@/content/site";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function WhyKgm() {
  const [hover, setHover] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 160, damping: 22 });
  const y = useSpring(my, { stiffness: 160, damping: 22 });

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
            <h2 className="display mt-8 text-[clamp(4.5rem,15vw,14rem)] leading-[0.82]" aria-label={whyKgm.title}>
              <WordsReveal text="Why KGM" as="span" className="inline" />
              <motion.span
                aria-hidden
                className="inline-block text-signal"
                initial={{ opacity: 0, rotate: -12 }}
                whileInView={{ opacity: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
              >
                ?
              </motion.span>
            </h2>
          </div>
          <FadeIn as="p" className="self-end font-serif text-2xl leading-snug italic md:col-span-4 md:text-3xl">
            {whyKgm.subtitle}
          </FadeIn>
        </div>

        <ol className="mt-20 border-t border-ink/15 md:mt-28">
          {whyKgm.reasons.map((r, i) => (
            <li
              key={r.n}
              className="group relative grid gap-6 border-b border-ink/15 py-10 md:grid-cols-12 md:gap-10 md:py-14"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="label !text-signal md:col-span-1 md:pt-4">{r.n}</span>
              <h3 className="display text-[clamp(2.2rem,4.6vw,4.2rem)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] md:col-span-6 md:group-hover:translate-x-4">
                {r.title}
              </h3>
              <div className="md:col-span-5 md:pt-3">
                <p className="text-base leading-relaxed text-ink/70 md:text-lg">{r.body}</p>
                {r.list && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {r.list.map((l) => (
                      <li key={l} className="rounded-full border border-ink/20 px-4 py-1.5 text-sm text-ink/80 transition-colors hover:border-signal hover:text-signal">
                        {l}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="relative mt-6 aspect-[16/9] overflow-hidden md:hidden">
                  <Image src={r.image.src} alt={r.image.alt} fill sizes="100vw" className="cine-img object-cover" style={{ objectPosition: r.image.position }} />
                </div>
              </div>
              <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" aria-hidden />
            </li>
          ))}
        </ol>

        <div className="mt-24 md:mt-36">
          {whyKgm.closing.map((line, i) => (
            <WordsReveal
              key={line}
              text={line}
              as="p"
              delay={i * 0.3}
              className={`display text-[clamp(2.4rem,6.4vw,6rem)] ${i === 1 ? "text-signal italic md:pl-[16%]" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Cursor-following preview (desktop) */}
      <motion.div className="pointer-events-none fixed top-0 left-0 z-30 hidden md:block" style={{ x, y }} aria-hidden>
        <AnimatePresence>
          {hover !== null && (
            <motion.div
              key={hover}
              className="relative -mt-36 ml-8 h-56 w-80 overflow-hidden shadow-2xl"
              initial={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 1 }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <Image src={whyKgm.reasons[hover].image.src} alt="" fill sizes="320px" className="cine-img object-cover" style={{ objectPosition: whyKgm.reasons[hover].image.position }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
