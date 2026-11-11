"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { activation } from "@/content/site";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Activation() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const item = activation.items[active];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = activation.items.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      setActive(next);
      tabsRef.current[next]?.focus();
    }
  };

  return (
    <section id="activation" className="relative bg-charcoal py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <SectionLabel>{activation.label}</SectionLabel>
            <WordsReveal text={activation.title} className="display mt-8 text-[clamp(3.2rem,9vw,8.5rem)] text-bone" />
          </div>
          <FadeIn as="p" className="self-end text-base text-silver md:col-span-4 md:text-lg">
            {activation.intro}
          </FadeIn>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          {/* Tabs */}
          <div role="tablist" aria-label="Líneas de activación" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-2 md:col-span-4 md:flex-col md:gap-0 md:overflow-visible md:pb-0">
            {activation.items.map((it, i) => {
              const selected = i === active;
              return (
                <button
                  key={it.n}
                  ref={(el) => {
                    tabsRef.current[i] = el;
                  }}
                  role="tab"
                  id={`act-tab-${i}`}
                  aria-selected={selected}
                  aria-controls={`act-panel-${i}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={`group relative shrink-0 border px-4 py-3 text-left transition-colors duration-500 md:border-0 md:border-b md:px-0 md:py-7 ${selected ? "border-bone/60 md:border-bone/15" : "hairline"}`}
                >
                  <span className={`label block transition-colors ${selected ? "!text-signal" : ""}`}>Activación {it.n}</span>
                  <span className={`display mt-2 block text-2xl transition-all duration-500 md:text-4xl ${selected ? "text-bone md:translate-x-3" : "text-silver/60 group-hover:text-bone [html[data-theme=sand]_&]:text-silver/75 [html[data-theme=sand]_&]:group-hover:text-bone"}`}>
                    {it.short}
                  </span>
                  {selected && <motion.span layoutId="act-indicator" className="absolute top-0 bottom-0 left-0 hidden w-px bg-signal md:block" />}
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div className="relative md:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                role="tabpanel"
                id={`act-panel-${active}`}
                aria-labelledby={`act-tab-${active}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="grid gap-8 lg:grid-cols-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[520px]">
                  <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: EASE }}>
                    <Image src={item.image.src} alt={item.image.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="cine-img object-cover" style={{ objectPosition: item.image.position }} />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/10 to-transparent" />
                  <h3 className="display absolute right-6 bottom-6 left-6 text-3xl text-day md:text-4xl">{item.title}</h3>
                </div>

                <div className="flex flex-col">
                  <p className="font-serif text-2xl leading-snug text-bone md:text-3xl">{item.summary}</p>
                  <span className="label mt-10 block">Posibilidades</span>
                  <ul className="mt-4">
                    {item.options.map((o, k) => (
                      <motion.li
                        key={o}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: EASE, delay: 0.15 + k * 0.04 }}
                        className="flex items-baseline gap-4 border-b hairline py-3 text-bone/90"
                      >
                        <span className="label w-6 text-[0.6rem]">{String(k + 1).padStart(2, "0")}</span>
                        {o}
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-10">
                    <div className="border-l-2 border-signal pl-5">
                      <span className="label !text-signal">Beneficio para KGM</span>
                      <p className="mt-2 text-base leading-relaxed text-bone md:text-lg">{item.benefit}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
