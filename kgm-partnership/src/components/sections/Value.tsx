"use client";

import { motion } from "framer-motion";
import { value, vehicles } from "@/content/site";
import { StageTile } from "@/components/ui/VehicleCutout";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Value() {
  return (
    <section id="value" className="relative bg-charcoal py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <SectionLabel>{value.label}</SectionLabel>
              <WordsReveal text={value.title} className="display mt-8 text-[clamp(3.2rem,8vw,7.5rem)] text-bone" />
              <StageTile vehicle={vehicles.mussoWhite} className="mt-10 hidden aspect-[4/3] md:block" sizes="35vw" />
              <FadeIn as="p" className="label mt-6 normal-case tracking-[0.12em] text-silver/70">
                {value.note}
              </FadeIn>
            </div>
          </div>

          {/* Strategy board */}
          <ol className="grid border-t hairline sm:grid-cols-2 md:col-span-7">
            {value.items.map((it, i) => (
              <motion.li
                key={it.title}
                className={`group relative flex min-h-[260px] flex-col justify-between border-b hairline p-6 md:min-h-[300px] md:p-8 ${i % 2 === 0 ? "sm:border-r" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 1, ease: EASE, delay: (i % 2) * 0.12 }}
              >
                <div className="flex items-start justify-between">
                  <span className="display text-7xl text-bone/15 transition-colors duration-700 group-hover:text-signal md:text-8xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-3 h-2 w-2 rounded-full border border-silver/50 transition-colors duration-500 group-hover:border-signal group-hover:bg-signal" aria-hidden />
                </div>
                <div>
                  <h3 className="display text-3xl leading-[1.02] text-bone md:text-[2.4rem]">{it.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-silver md:text-base">{it.body}</p>
                </div>
                <span className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-700 group-hover:scale-x-100" aria-hidden />
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
