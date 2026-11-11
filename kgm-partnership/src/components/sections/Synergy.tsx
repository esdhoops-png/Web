"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { synergy, type Img, type Vehicle } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";

function Row({ word, img, dir, index }: { word: string; img?: Img | Vehicle; dir: 1 | -1; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [`${dir * 3}%`, `${dir * -3}%`]);
  const accent = index === 1;

  return (
    <div ref={ref} className="overflow-hidden border-b hairline py-2 md:py-3">
      <motion.div style={{ x: reduced ? 0 : x }} className={`flex items-center gap-[3vw] whitespace-nowrap ${dir === 1 ? "justify-start" : "justify-end"}`}>
        {dir === -1 && img && <Pill img={img} />}
        <span className={`display text-[clamp(2.4rem,11vw,13rem)] leading-[0.95] ${accent ? "text-signal italic" : "text-bone"}`}>{word}</span>
        {dir === 1 && img && <Pill img={img} />}
        <span className="label hidden shrink-0 md:inline">{String(index + 1).padStart(2, "0")}</span>
      </motion.div>
    </div>
  );
}

function Pill({ img }: { img: Img | Vehicle }) {
  const box = "relative inline-block h-[clamp(2.6rem,8vw,8.5rem)] w-[clamp(5rem,18vw,19rem)] shrink-0 overflow-hidden rounded-full";
  if ("img" in img) {
    return (
      <span className={`${box} bg-[radial-gradient(ellipse_at_50%_120%,#24506f_0%,#142a3d_60%)]`}>
        <Image src={img.img.src} alt={img.img.alt} fill sizes="20vw" className="object-contain p-[6%]" />
      </span>
    );
  }
  return (
    <span className={box}>
      <Image src={img.src} alt={img.alt} fill sizes="20vw" className="cine-img object-cover" style={{ objectPosition: img.position }} />
    </span>
  );
}

export function Synergy() {
  return (
    <section id="synergy" className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionLabel>{synergy.label}</SectionLabel>
        <h2 className="mt-8" aria-label={synergy.title.join(" ")}>
          {synergy.title.map((t, i) => (
            <WordsReveal key={t} text={t} as="span" delay={i * 0.2} className={`display block text-[clamp(2.6rem,6vw,5.6rem)] ${i === 1 ? "text-silver italic" : "text-bone"}`} />
          ))}
        </h2>
      </div>

      <div className="mt-16 border-t hairline md:mt-24">
        {synergy.values.map((v, i) => (
          <Row key={v} word={v} index={i} dir={i % 2 === 0 ? 1 : -1} img={synergy.inline[i % synergy.inline.length]} />
        ))}
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl gap-8 px-5 md:mt-28 md:grid-cols-12 md:px-10">
        <FadeIn as="p" className="font-serif text-2xl leading-snug text-bone md:col-span-7 md:text-4xl">
          {synergy.body[0]}
        </FadeIn>
        <FadeIn as="p" delay={0.2} className="label self-end text-bone md:col-span-4 md:col-start-9">
          <span className="text-signal">—</span> {synergy.body[1]}
        </FadeIn>
      </div>
    </section>
  );
}
