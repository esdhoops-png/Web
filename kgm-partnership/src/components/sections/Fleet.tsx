"use client";

import { AnimatePresence, motion, useInView, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { fleet, type Vehicle } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { Magnetic } from "@/components/ui/Fx";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";
import { VehicleCutout } from "@/components/ui/VehicleCutout";

const EASE = [0.22, 1, 0.36, 1] as const;
const BRAKE = [0.16, 1, 0.3, 1] as const;
const LAUNCH = [0.7, 0, 0.84, 0] as const;
/** When the incoming car starts moving, and when it has (nearly) stopped: everything else is timed on these. */
const ARRIVE_DELAY = 0.3;
const BRAKE_AT = 0.78;

/**
 * One car on the stage. It always drives forwards: it enters from behind its own nose,
 * brakes into place (the body pitches and settles on its suspension) and, when replaced,
 * launches off in the direction it faces, smeared by speed.
 */
function StageCar({ vehicle, shown }: { vehicle: Vehicle; shown: boolean }) {
  const f = vehicle.faces === "left" ? -1 : 1; // direction of travel on screen
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 will-change-transform"
      variants={{
        enter: { x: `${-f * 135}%`, skewX: f * 11, opacity: 0, filter: "blur(10px)" },
        center: {
          x: "0%",
          skewX: 0,
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 1.05, ease: BRAKE, delay: ARRIVE_DELAY, opacity: { duration: 0.35, delay: ARRIVE_DELAY }, filter: { duration: 0.6, delay: ARRIVE_DELAY } },
        },
        exit: { x: `${f * 150}%`, skewX: f * 14, opacity: 0, filter: "blur(9px)", transition: { duration: 0.55, ease: LAUNCH, opacity: { duration: 0.2, delay: 0.35 } } },
      }}
      initial="enter"
      animate={shown ? "center" : "enter"}
      exit="exit"
    >
      {/* suspension: nose dives under braking, rebounds, settles */}
      <motion.div
        className="origin-bottom"
        animate={shown ? { rotate: [0, f * 1.7, f * -0.6, 0], y: [0, 5, -2, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 1, times: [0, 0.3, 0.65, 1], ease: "easeInOut", delay: BRAKE_AT }}
      >
        <VehicleCutout vehicle={vehicle} sizes="(min-width: 768px) 55vw, 80vw" />
      </motion.div>
    </motion.div>
  );
}

/** The outlined model name: every letter leaves upwards and the new ones rise from a mask, one by one. */
function StageName({ name }: { name: string }) {
  const chars = Array.from(name);
  return (
    <motion.span
      className="display absolute inset-x-0 top-0 block overflow-hidden pb-[0.14em] text-center text-[clamp(4rem,14vw,13rem)] whitespace-nowrap text-transparent [-webkit-text-stroke:1px_rgba(217,196,176,0.35)]"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.18 } }, exit: { transition: { staggerChildren: 0.018 } } }}
    >
      {chars.map((c, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { y: "112%" },
            show: { y: "0%", transition: { duration: 0.95, ease: EASE } },
            exit: { y: "-112%", transition: { duration: 0.4, ease: LAUNCH } },
          }}
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function Fleet() {
  const [[active, runs], setState] = useState<[number, number]>([0, 0]);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const item = fleet.items[active];
  const n = fleet.items.length;
  const f = item.vehicle.faces === "left" ? -1 : 1;
  const shown = useInView(stageRef, { once: true, amount: 0.45 });

  const select = (i: number) => setState(([cur, r]) => (i === cur ? [cur, r] : [i, r + 1]));
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

  // Pointer over the stage: -1..1, sprung. Drives the 3D tilt of the car and the counter-drift of the layers behind it.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const mx = useSpring(rx, { stiffness: 70, damping: 16, mass: 0.6 });
  const my = useSpring(ry, { stiffness: 70, damping: 16, mass: 0.6 });
  const carRotY = useTransform(mx, (v) => v * 7);
  const carRotX = useTransform(my, (v) => v * -3);
  const carX = useTransform(mx, (v) => v * 22);
  const nameX = useTransform(mx, (v) => v * -34);
  const nameY = useTransform(my, (v) => v * -10);
  const floorX = useTransform(mx, (v) => v * -12);

  // Scroll: the stage opens like a shutter, the car grows towards the viewer, the name drifts across.
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start end", "end start"] });
  const inset = useTransform(scrollYProgress, [0, 0.36], [9, 0]);
  const clip = useMotionTemplate`inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
  const carScale = useTransform(scrollYProgress, [0, 0.42], [0.86, 1]);
  const nameDrift = useTransform(scrollYProgress, [0, 1], ["7%", "-7%"]);

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
          <motion.div
            ref={stageRef}
            data-cursor="Siguiente"
            onClick={() => select((active + 1) % n)}
            onPointerMove={(e) => {
              if (reduced || e.pointerType !== "mouse" || !stageRef.current) return;
              const r = stageRef.current.getBoundingClientRect();
              rx.set(((e.clientX - r.left) / r.width) * 2 - 1);
              ry.set(((e.clientY - r.top) / r.height) * 2 - 1);
            }}
            onPointerLeave={() => {
              rx.set(0);
              ry.set(0);
            }}
            className="relative h-[clamp(300px,46vw,620px)] overflow-hidden border hairline bg-[radial-gradient(ellipse_at_50%_115%,#1c3a54_0%,#142a3d_45%,#0d1e2c_100%)]"
            style={{ clipPath: reduced ? "none" : clip }}
          >
            {/* court lines: flash when a car arrives */}
            <motion.div aria-hidden className="absolute -inset-x-[3%] inset-y-0" style={{ x: reduced ? 0 : floorX }}>
              <motion.svg
                key={`floor-${runs}`}
                viewBox="0 0 1200 600"
                preserveAspectRatio="xMidYMax slice"
                className="absolute inset-0 h-full w-full"
                initial={{ opacity: 0.14 }}
                animate={{ opacity: runs ? [0.14, 0.5, 0.14] : 0.14 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: BRAKE_AT, times: [0, 0.18, 1] }}
              >
                <g fill="none" stroke="#d9c4b0" strokeWidth="2">
                  <ellipse cx="600" cy="640" rx="520" ry="150" />
                  <ellipse cx="600" cy="640" rx="190" ry="60" />
                  <line x1="0" y1="560" x2="1200" y2="560" />
                </g>
              </motion.svg>
            </motion.div>

            {/* floor shockwave under the braking car */}
            {shown &&
              [0, 1].map((k) => (
                <div key={`ring-${runs}-${k}`} aria-hidden className="pointer-events-none absolute bottom-[-5%] left-1/2 aspect-[4/1] w-[62%] -translate-x-1/2">
                  <motion.div
                    className="h-full w-full rounded-[50%] border border-day-tan/60"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1.65, opacity: [0, 0.75, 0] }}
                    transition={{ duration: 1.5, ease: BRAKE, delay: BRAKE_AT + 0.05 + k * 0.22, opacity: { duration: 1.5, times: [0, 0.2, 1], delay: BRAKE_AT + 0.05 + k * 0.22 } }}
                  />
                </div>
              ))}

            {/* model name behind the car */}
            <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-[8%]" style={{ x: reduced ? 0 : nameDrift }}>
              <motion.div className="relative" style={{ x: reduced ? 0 : nameX, y: reduced ? 0 : nameY }}>
                <AnimatePresence initial={false}>
                  <StageName key={`name-${active}`} name={item.vehicle.name} />
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* speed lines, in the direction the new car travels */}
            {runs > 0 && (
              <div key={`speed-${runs}`} aria-hidden className="pointer-events-none absolute inset-0">
                {[18, 34, 47, 61, 72, 84].map((top, i) => (
                  <motion.span
                    key={top}
                    className="absolute left-[30%] block h-px w-[40%] bg-gradient-to-r from-transparent via-day/70 to-transparent"
                    style={{ top: `${top}%` }}
                    initial={{ x: `${-f * 190}%`, opacity: 0, scaleX: 0.5 }}
                    animate={{ x: `${f * 190}%`, opacity: [0, 1, 1, 0], scaleX: 1.5 }}
                    transition={{ duration: 0.75, ease: [0.5, 0, 0.2, 1], delay: 0.05 + ((i * 5) % 6) * 0.05 }}
                  />
                ))}
              </div>
            )}

            {/* the car */}
            <div className="absolute bottom-[8%] left-1/2 w-[min(78%,720px)] -translate-x-1/2" style={{ perspective: 1300 }}>
              <motion.div className="relative" style={{ transformOrigin: "50% 100%", x: reduced ? 0 : carX, rotateX: reduced ? 0 : carRotX, rotateY: reduced ? 0 : carRotY, scale: reduced ? 1 : carScale }}>
                <AnimatePresence initial={false}>
                  <StageCar key={item.vehicle.id} vehicle={item.vehicle} shown={shown} />
                </AnimatePresence>
              </motion.div>
            </div>

            {/* stage HUD */}
            <div aria-hidden className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between md:inset-x-6 md:top-6">
              <span className="label flex items-baseline gap-2 text-[0.6rem] text-day-muted">
                <span className="relative inline-flex overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={active} className="inline-block text-day" initial={{ y: "110%" }} animate={{ y: "0%" }} exit={{ y: "-110%" }} transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}>
                      {String(active + 1).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span>/ {String(n).padStart(2, "0")}</span>
              </span>
              <span className="flex gap-1.5 pt-1">
                {fleet.items.map((it, i) => (
                  <span key={it.vehicle.id} className="relative block h-px w-8 bg-day/20 md:w-12">
                    {i === active && <motion.span layoutId="fleet-dash" className="absolute inset-0 bg-day" transition={{ duration: 0.7, ease: EASE }} />}
                  </span>
                ))}
              </span>
            </div>
          </motion.div>

          {/* Selector + copy */}
          <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-start">
            <div role="tablist" aria-label="Modelos KGM" className="flex flex-wrap gap-2 md:col-span-5">
              {fleet.items.map((it, i) => {
                const selected = i === active;
                return (
                  <Magnetic key={it.vehicle.id} strength={0.25}>
                  <button
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
                    className={`group relative flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm transition-colors duration-500 ${selected ? "border-tan text-ink" : "border-bone/20 text-bone hover:border-tan [html[data-theme=sand]_&]:border-bone/35 [html[data-theme=sand]_&]:hover:border-tan"}`}
                  >
                    {selected && <motion.span layoutId="fleet-pill" aria-hidden className="absolute inset-0 rounded-full bg-tan" transition={{ duration: 0.6, ease: EASE }} />}
                    <span aria-hidden className={`relative text-[0.6rem] tracking-[0.18em] transition-opacity duration-500 ${selected ? "opacity-70" : "opacity-50"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative">{it.vehicle.name}</span>
                  </button>
                  </Magnetic>
                );
              })}
            </div>
            <div id="fleet-panel" role="tabpanel" aria-labelledby={`fleet-tab-${active}`} className="md:col-span-7">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={active} initial="hidden" animate="show" exit="exit" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } }, exit: { opacity: 0, y: -10, transition: { duration: 0.22, ease: "easeIn" } } }}>
                  <motion.span className="label block !text-signal" variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } }}>
                    Papel propuesto
                  </motion.span>
                  <span className="mt-2 block overflow-hidden pb-[0.14em]">
                    <motion.h3 className="display text-3xl text-bone md:text-5xl" variants={{ hidden: { y: "112%" }, show: { y: "0%", transition: { duration: 0.9, ease: EASE } } }}>
                      {item.role}
                    </motion.h3>
                  </span>
                  <motion.p className="mt-3 max-w-xl text-base leading-relaxed text-silver md:text-lg" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}>
                    {item.body}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <p className="label mt-10 normal-case tracking-[0.12em] text-silver/60 [html[data-theme=sand]_&]:text-silver">{fleet.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
