"use client";

import { motion } from "framer-motion";
import { difference } from "@/content/site";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Difference() {
  return (
    <section id="difference" className="relative bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <SectionLabel>{difference.label}</SectionLabel>
            <WordsReveal text={difference.title} className="display mt-8 text-[clamp(3.2rem,9vw,8.5rem)] text-bone" />
          </div>
          <FadeIn as="p" className="self-end font-serif text-2xl leading-snug text-silver italic md:col-span-4 md:text-3xl">
            {difference.intro}
          </FadeIn>
        </div>

        <div className="mt-16 md:mt-24" role="table" aria-label={difference.title}>
          <div role="row" className="grid grid-cols-2 gap-6 border-b hairline pb-5 md:grid-cols-12 md:gap-10">
            <span role="columnheader" className="label md:col-span-5">{difference.left}</span>
            <span role="columnheader" className="label !text-tan md:col-span-6 md:col-start-7">{difference.right}</span>
          </div>
          {difference.rows.map(([before, after], i) => (
            <motion.div
              key={before}
              role="row"
              className="group relative grid grid-cols-2 items-baseline gap-6 border-b hairline py-6 md:grid-cols-12 md:gap-10 md:py-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.05 }}
            >
              <span role="cell" className="text-base text-silver/55 line-through decoration-silver/30 [html[data-theme=sand]_&]:text-silver/85 [html[data-theme=sand]_&]:decoration-silver/55 md:col-span-5 md:text-xl">
                {before}
              </span>
              <span aria-hidden className="hidden text-signal md:col-span-1 md:block">
                →
              </span>
              <span role="cell" className="display text-2xl leading-[1.05] text-bone transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] md:col-span-6 md:text-[2.6rem] md:group-hover:translate-x-3">
                {after}
              </span>
              <span className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-700 group-hover:scale-x-100" aria-hidden />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
