"use client";

import { future, images, kgmLifestyle, vehicles } from "@/content/site";
import { CineImage, FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";
import { Lockup } from "@/components/ui/Logos";
import { Lineup } from "@/components/ui/VehicleCutout";

export function Future() {
  const backdrop = kgmLifestyle[0];
  return (
    <section id="future" className="relative overflow-hidden bg-ink">
      <CineImage img={backdrop ?? images.courtNight} className="!absolute inset-0" parallax={8} reveal="center" />
      <div className={`absolute inset-0 ${backdrop ? "bg-ink/55" : "bg-ink/75"}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-28 md:px-10 md:pt-40">
        <SectionLabel className="text-bone">{future.label}</SectionLabel>
        <div className="mt-8 grid gap-10 md:grid-cols-12">
          <WordsReveal text={future.title} className="display text-[clamp(3.2rem,8.4vw,8.4rem)] text-bone md:col-span-7" />
          <div className="space-y-5 self-end text-base leading-relaxed text-bone/80 md:col-span-5 md:text-lg">
            {future.body.map((p, i) => (
              <FadeIn key={p} as="p" delay={i * 0.12}>
                {p}
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* The range, lined up — unless a KGM lifestyle photo is set as the backdrop */}
      {!backdrop && (
        <FadeIn className="relative z-10 mx-auto mt-14 w-[min(94vw,1280px)] md:mt-10" y={60}>
          <Lineup left={vehicles.mussoGreen} center={vehicles.torresEvxVx} right={vehicles.actyon} dimSides={false} />
        </FadeIn>
      )}

      <div className={`relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-10 md:pb-32 ${backdrop ? "mt-[38svh]" : "mt-12"}`}>
        <FadeIn className="flex flex-col gap-10 border-t hairline pt-10 md:flex-row md:items-center md:justify-between">
          <p className="font-serif text-3xl text-bone italic md:text-5xl">
            {future.closing.replace("moves people.", "")}
            <span className="text-signal">moves people.</span>
          </p>
          <div className="text-bone">
            <Lockup size={64} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
