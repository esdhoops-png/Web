"use client";

import { future, images } from "@/content/site";
import { CineImage, FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";
import { Lockup } from "@/components/ui/Logos";

export function Future() {
  return (
    <section id="future" className="relative overflow-hidden bg-ink">
      <div className="relative min-h-[110svh]">
        <CineImage img={images.kgmShowroomRear} className="!absolute inset-0" parallax={10} reveal="center" />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />

        <div className="relative z-10 mx-auto flex min-h-[110svh] max-w-7xl flex-col justify-center px-5 py-28 md:px-10">
          <SectionLabel className="text-bone">{future.label}</SectionLabel>
          <WordsReveal text={future.title} className="display mt-8 max-w-5xl text-[clamp(3.2rem,9vw,9rem)] text-bone" />
          <div className="mt-12 grid gap-8 md:grid-cols-12">
            <div className="space-y-6 text-base leading-relaxed text-bone/80 md:col-span-6 md:text-lg">
              {future.body.map((p, i) => (
                <FadeIn key={p} as="p" delay={i * 0.12}>
                  {p}
                </FadeIn>
              ))}
            </div>
          </div>
          <FadeIn className="mt-16 flex flex-col gap-10 border-t hairline pt-10 md:flex-row md:items-center md:justify-between">
            <p className="font-serif text-3xl text-bone italic md:text-5xl">
              {future.closing.replace("moves people.", "")}
              <span className="text-signal">moves people.</span>
            </p>
            <div className="text-bone">
              <Lockup size={64} />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
