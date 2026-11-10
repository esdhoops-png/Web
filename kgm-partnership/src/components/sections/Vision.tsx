"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { images, vision } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { CineImage, FadeIn, ScrollFillText, SectionLabel, WordsReveal } from "@/components/ui/Motion";

export function Vision() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const fast = useTransform(scrollYProgress, [0, 1], ["18%", "-28%"]);
  const slow = useTransform(scrollYProgress, [0, 1], ["8%", "-10%"]);

  return (
    <section ref={ref} id="vision" className="relative overflow-hidden bg-ink py-28 md:py-44">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionLabel>{vision.label}</SectionLabel>

        <div className="mt-10 grid gap-16 md:mt-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <WordsReveal text={vision.title} className="display text-[clamp(3rem,8vw,7.5rem)] text-bone" />
            <div className="mt-12 max-w-xl space-y-6 text-base leading-relaxed text-silver md:text-lg">
              {vision.body.map((p) => (
                <FadeIn key={p} as="p">{p}</FadeIn>
              ))}
              <FadeIn as="p" className="text-bone">{vision.closing}</FadeIn>
            </div>
          </div>

          {/* Floating collage: automotive meets basketball */}
          <div className="relative h-[520px] md:col-span-5 md:h-auto md:min-h-[640px]" aria-hidden={false}>
            <motion.div style={{ y: reduced ? 0 : slow }} className="absolute top-0 right-0 w-[72%]">
              <CineImage img={images.kgmShowroomRear} className="aspect-[4/5]" sizes="(min-width: 768px) 30vw, 70vw" reveal="up" />
              <span className="label mt-3 block text-[0.6rem]">Movilidad</span>
            </motion.div>
            <motion.div style={{ y: reduced ? 0 : fast }} className="absolute bottom-0 left-0 w-[55%]">
              <CineImage img={images.esdPortrait} className="aspect-[4/5]" sizes="(min-width: 768px) 22vw, 55vw" reveal="up" delay={0.2} />
              <span className="label mt-3 block text-[0.6rem]">Deporte</span>
            </motion.div>
          </div>
        </div>

        <div className="mt-28 border-t hairline pt-16 md:mt-40 md:pt-24">
          <ScrollFillText
            text={vision.statement}
            accentWords={["moves", "people"]}
            className="display mx-auto max-w-5xl text-center text-[clamp(2.1rem,5vw,4.6rem)] leading-[1.02] text-bone"
          />
        </div>
      </div>
    </section>
  );
}
