"use client";

import { motion } from "framer-motion";
import { firstMove } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";
import { KgmWordmark } from "@/components/ui/Logos";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FirstMove() {
  const { scrollTo } = useMotionPrefs();
  return (
    <section id="first-move" className="relative overflow-hidden bg-bone py-28 text-ink md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <FadeIn className="label flex items-center gap-4 !text-ink/60" y={12}>
          <span className="h-px w-10 bg-ink/40" aria-hidden />
          <span>{firstMove.label}</span>
        </FadeIn>

        <div className="mt-8 grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <WordsReveal text={firstMove.title} className="display text-[clamp(3.4rem,10vw,9.5rem)] leading-[0.86]" />
            <FadeIn as="p" className="mt-10 max-w-xl font-serif text-2xl leading-snug md:text-[2rem]">
              {firstMove.body}
            </FadeIn>
          </div>

          {/* The reserved seat */}
          <motion.div
            className="relative flex aspect-[4/5] max-h-[520px] flex-col justify-between self-end bg-ink p-7 text-bone md:col-span-5 md:p-9"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.3, ease: EASE }}
          >
            <div className="flex items-start justify-between">
              <span className="label text-bone">Socio oficial · {firstMove.seat}</span>
              <span className="display text-6xl text-tan md:text-7xl">01</span>
            </div>
            <div>
              <span className="label !text-signal">Reservado para</span>
              <span className="mt-5 block h-[34px] w-[200px] md:h-[44px] md:w-[260px]">
                <KgmWordmark className="h-full w-full" />
              </span>
              <p className="label mt-8 normal-case leading-relaxed tracking-[0.1em] text-silver/80">{firstMove.note}</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-24 md:mt-32">
          <span className="label !text-ink/60">{firstMove.stepsTitle}</span>
          <ol className="mt-6 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4">
            {firstMove.steps.map((st, i) => (
              <motion.li
                key={st.title}
                className="border-b border-ink/15 py-8 sm:pr-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
              >
                <span className="label !text-signal">Paso {i + 1}</span>
                <h3 className="display mt-4 text-4xl">{st.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-ink/70">{st.body}</p>
              </motion.li>
            ))}
          </ol>
          <FadeIn className="mt-14">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#contact");
              }}
              className="group relative inline-flex items-center gap-5 overflow-hidden rounded-full bg-ink py-4 pr-4 pl-8 text-bone"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" aria-hidden />
              <span className="label relative text-bone">{firstMove.cta}</span>
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-bone text-ink transition-transform duration-500 group-hover:translate-x-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
            </a>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
