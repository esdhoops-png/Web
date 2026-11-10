"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { fleet } from "@/content/site";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";
import { VehicleCutout } from "@/components/ui/VehicleCutout";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Fleet() {
  const [[active, dir], setState] = useState<[number, 1 | -1]>([0, 1]);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const item = fleet.items[active];
  const n = fleet.items.length;

  const select = (i: number) => setState(([cur]) => [i, i >= cur ? 1 : -1]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % n;
    if (e.key === "ArrowLeft") next = (i - 1 + n) % n;
    if (next >= 0) {
      e.preventDefault();
      select(next);
      tabsRef.current[next]?.focus();
    }
  };

  return (
    <section id="fleet" className="relative overflow-hidden bg-charcoal py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <SectionLabel>{fleet.label}</SectionLabel>
            <WordsReveal text={fleet.title} className="display mt-8 text-[clamp(3rem,7.5vw,7rem)] text-bone" />
          </div>
          <FadeIn as="p" className="self-end text-base text-silver md:col-span-4 md:text-lg">
            {fleet.intro}
          </FadeIn>
        </div>

        {/* Stage */}
        <div className="relative mt-14 md:mt-20">
          <div className="relative h-[clamp(300px,46vw,620px)] overflow-hidden border hairline bg-[radial-gradient(ellipse_at_50%_115%,#1c3a54_0%,#142a3d_45%,#0d1e2c_100%)]">
            {/* court lines */}
            <svg aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full opacity-[0.14]">
              <g fill="none" stroke="#d9c4b0" strokeWidth="2">
                <ellipse cx="600" cy="640" rx="520" ry="150" />
                <ellipse cx="600" cy="640" rx="190" ry="60" />
                <line x1="0" y1="560" x2="1200" y2="560" />
              </g>
            </svg>

            {/* model name behind the car */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`name-${active}`}
                aria-hidden
                className="display pointer-events-none absolute inset-x-0 top-[8%] text-center text-[clamp(4rem,14vw,13rem)] whitespace-nowrap text-transparent [-webkit-text-stroke:1px_rgba(217,196,176,0.35)]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                {item.vehicle.name}
              </motion.span>
            </AnimatePresence>

            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={item.vehicle.id}
                custom={dir}
                className="absolute bottom-[8%] left-1/2 w-[min(78%,720px)] -translate-x-1/2"
                variants={{
                  enter: (d: number) => ({ x: `${d * 60}vw`, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: `${d * -60}vw`, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <VehicleCutout vehicle={item.vehicle} sizes="(min-width: 768px) 55vw, 80vw" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Selector + copy */}
          <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-start">
            <div role="tablist" aria-label="Modelos KGM" className="flex flex-wrap gap-2 md:col-span-5">
              {fleet.items.map((it, i) => {
                const selected = i === active;
                return (
                  <button
                    key={it.vehicle.id}
                    ref={(el) => {
                      tabsRef.current[i] = el;
                    }}
                    role="tab"
                    id={`fleet-tab-${i}`}
                    aria-selected={selected}
                    aria-controls="fleet-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`rounded-full border px-5 py-2.5 text-sm transition-colors duration-500 ${selected ? "border-tan bg-tan text-ink" : "border-bone/20 text-bone hover:border-tan"}`}
                  >
                    {it.vehicle.name}
                  </button>
                );
              })}
            </div>
            <div id="fleet-panel" role="tabpanel" aria-labelledby={`fleet-tab-${active}`} className="md:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE }}>
                  <span className="label !text-signal">Papel propuesto</span>
                  <h3 className="display mt-2 text-3xl text-bone md:text-5xl">{item.role}</h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-silver md:text-lg">{item.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <p className="label mt-10 normal-case tracking-[0.12em] text-silver/60">{fleet.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
