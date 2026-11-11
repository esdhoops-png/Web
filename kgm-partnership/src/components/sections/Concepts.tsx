"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { concepts, type Img, type Vehicle } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";
import { KgmWordmark } from "@/components/ui/Logos";
import { VehicleCutout } from "@/components/ui/VehicleCutout";

type Concept = (typeof concepts.items)[number];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Track context. `local` is the panel's position relative to the centre of the screen,
 * in panels: -1 = one panel to the right (arriving), 0 = in place, 1 = one panel gone.
 * `on` is true only while the horizontal, scroll-scrubbed track is active.
 */
const PanelCtx = createContext<{ local: MotionValue<number>; on: boolean } | null>(null);
function usePanel() {
  const ctx = useContext(PanelCtx);
  if (!ctx) throw new Error("PanelCtx missing");
  return ctx;
}

/**
 * One image tile. Three layers of motion while the track is scrubbed:
 * the tile itself assembles into the grid (rise), the photo inside drifts at its own rate
 * (depth) and, on montage tiles, the car glides in and brakes as the panel arrives.
 */
function Shot({ img, className = "", sizes, vehicle, depth = 6, rise = 0 }: { img: Img; className?: string; sizes: string; vehicle?: Vehicle; depth?: number; rise?: number }) {
  const { local, on } = usePanel();
  const tileY = useTransform(local, [-1, -0.22, 0.22, 1], [rise, 0, 0, -rise * 0.6]);
  const photoX = useTransform(local, [-1, 1], [`${depth}%`, `${-depth}%`]);
  const from = vehicle?.faces === "left" ? 1 : -1;
  const carX = useTransform(local, [-0.95, -0.12], [`${from * 78}%`, "0%"]);
  const carSkew = useTransform(local, [-0.95, -0.35, -0.12], [from * -7, from * -3, 0]);
  return (
    <motion.div
      data-cursor="Ver"
      className={`group/shot relative overflow-hidden bg-night-2 ${className}`}
      style={{ y: on ? tileY : 0 }}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true }}
      transition={{ duration: 1.25, ease: EASE }}
    >
      <motion.div className="absolute inset-y-0 -inset-x-[9%]" style={{ x: on ? photoX : 0 }}>
        <Image src={img.src} alt={img.alt} fill sizes={sizes} className="cine-img object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover/shot:scale-[1.07]" style={{ objectPosition: img.position }} />
      </motion.div>
      {vehicle && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent" />
          <motion.div
            className={`absolute bottom-[4%] w-[min(72%,560px)] ${vehicle.faces === "left" ? "right-[4%]" : "left-[4%]"}`}
            initial={{ x: `${from * 40}%`, opacity: 0 }}
            whileInView={{ x: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "0px -10% 0px -10%" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            <motion.div className="origin-bottom" style={{ x: on ? carX : "0%", skewX: on ? carSkew : 0 }}>
              <VehicleCutout vehicle={vehicle} sizes="40vw" />
            </motion.div>
          </motion.div>
          <span className="label absolute top-3 right-3 bg-night/70 px-2 py-1 text-[0.55rem] text-day">Montaje conceptual</span>
        </>
      )}
      {/* hover frame */}
      <span aria-hidden className="pointer-events-none absolute inset-0 border border-day/0 transition-[border-color] duration-500 group-hover/shot:border-day/40" />
    </motion.div>
  );
}

/** Schematic 3x3 event layout — a creative proposal, drawn as a plan. */
function EventPlan() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" role="img" aria-label="Plano conceptual de un evento 3x3: pista, exposición de vehículos KGM, zona de experiencia y gradas">
      <g fill="none" stroke="#f2e9df" strokeOpacity="0.7" strokeWidth="1">
        <rect x="140" y="60" width="150" height="140" />
        <path d="M140 60 h150" stroke="#b97a4e" strokeWidth="2" />
        <path d="M185 60 v40 h60 v-40" />
        <path d="M170 60 a45 45 0 0 0 90 0" transform="translate(0 0)" />
        <path d="M150 60 v20 a65 65 0 0 0 130 0 v-20" />
        <rect x="20" y="70" width="90" height="50" strokeDasharray="3 3" />
        <rect x="20" y="140" width="90" height="50" strokeDasharray="3 3" />
        <rect x="320" y="60" width="60" height="140" strokeDasharray="3 3" />
        <path d="M140 220 h150 M140 232 h150 M140 244 h150" strokeOpacity="0.35" />
      </g>
      <g fill="#f2e9df" style={{ fontFamily: "var(--font-sans)", fontSize: 7.5, letterSpacing: "0.18em" }}>
        <text x="215" y="140" textAnchor="middle">PISTA 3X3</text>
        <text x="65" y="98" textAnchor="middle">EXPOSICIÓN KGM</text>
        <text x="65" y="168" textAnchor="middle">ZONA EXPERIENCIA</text>
        <text x="350" y="134" textAnchor="middle" transform="rotate(90 350 130)">ACTIVACIÓN</text>
        <text x="215" y="256" textAnchor="middle" fillOpacity="0.6">GRADAS</text>
      </g>
      <circle cx="65" cy="110" r="3" fill="#b97a4e" />
    </svg>
  );
}

function ConceptPanel({ c, index }: { c: Concept; index: number }) {
  const { local, on } = usePanel();
  const [a, b, d] = c.images;
  const m = "montage" in c && c.montage ? c.montage : undefined;
  const v = (i: number) => (m && m.on === i ? m.vehicle : undefined);
  // Depth: the giant numeral, the headline and the body copy each travel at their own rate.
  const numeralX = useTransform(local, [-1, 1], ["26vw", "-26vw"]);
  const titleX = useTransform(local, [-1, 1], ["7vw", "-7vw"]);
  const bodyX = useTransform(local, [-1, 1], ["13vw", "-13vw"]);
  const focus = useTransform(local, [-1, -0.5, 0.5, 1], [0.4, 1, 1, 0.4]);
  return (
    <motion.article className="relative flex h-full w-full shrink-0 flex-col justify-between gap-6 md:w-[86vw] md:max-w-[1500px]" aria-labelledby={`concept-${c.n}`} style={{ opacity: on ? focus : 1 }}>
      {/* giant outlined numeral peeking from behind the tiles */}
      <motion.span
        aria-hidden
        className="display pointer-events-none absolute -top-[0.66em] right-[3%] text-[clamp(6.5rem,21svh,15rem)] leading-none text-transparent select-none [-webkit-text-stroke:1px_var(--color-silver)] md:right-[6%]"
        style={{ x: on ? numeralX : 0 }}
      >
        {c.n}
      </motion.span>

      <div className="relative grid h-[92vw] max-h-[560px] grid-cols-12 grid-rows-6 gap-2 md:h-auto md:max-h-none md:flex-1 md:gap-3">
        {index === 1 ? (
          <>
            <Shot vehicle={v(0)} img={a} rise={40} depth={7} className="col-span-12 row-span-4 md:col-span-5 md:row-span-6" sizes="(min-width: 768px) 40vw, 100vw" />
            <motion.div
              className="relative col-span-12 row-span-2 border hairline bg-night/80 p-3 [html[data-theme=sand]_&]:bg-night md:col-span-4 md:row-span-6 md:p-6"
              initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
              whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.15 }}
            >
              <span className="label absolute top-3 left-3 text-[0.55rem] text-day-muted md:top-5 md:left-5">Plano del concepto</span>
              <EventPlan />
            </motion.div>
            <Shot vehicle={v(1)} img={b} rise={-60} depth={4} className="hidden md:col-span-3 md:row-span-3 md:block" sizes="25vw" />
            <Shot vehicle={v(2)} img={d} rise={36} depth={5} className="hidden md:col-span-3 md:row-span-3 md:block" sizes="25vw" />
          </>
        ) : index === 2 ? (
          <>
            <Shot vehicle={v(0)} img={a} rise={40} depth={7} className="col-span-7 row-span-6 md:col-span-4" sizes="(min-width: 768px) 30vw, 60vw" />
            <Shot vehicle={v(1)} img={b} rise={-56} depth={5} className="col-span-5 row-span-4 md:col-span-6 md:row-span-6" sizes="(min-width: 768px) 45vw, 40vw" />
            <Shot vehicle={v(2)} img={d} rise={-90} depth={4} className="col-span-5 row-span-2 md:col-span-2 md:row-span-3" sizes="(min-width: 768px) 15vw, 40vw" />
            {"values" in c && c.values && (
              <ul className="hidden flex-col justify-end gap-1 md:col-span-2 md:row-span-3 md:flex">
                {c.values.map((v, i) => (
                  <motion.li
                    key={v}
                    className="display text-2xl text-bone lg:text-3xl"
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.35 + i * 0.12 }}
                  >
                    {v}.
                  </motion.li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <Shot vehicle={v(0)} img={a} rise={index === 0 ? 0 : 40} depth={6} className="col-span-12 row-span-4 md:col-span-8 md:row-span-6" sizes="(min-width: 768px) 60vw, 100vw" />
            <Shot vehicle={v(1)} img={b} rise={-70} depth={4} className="col-span-6 row-span-2 md:col-span-4 md:row-span-3" sizes="(min-width: 768px) 30vw, 50vw" />
            <Shot vehicle={v(2)} img={d} rise={36} depth={8} className="col-span-6 row-span-2 md:col-span-4 md:row-span-3" sizes="(min-width: 768px) 30vw, 50vw" />
          </>
        )}

        {/* Campaign overlay */}
        {index !== 1 && (
          <div className="pointer-events-none absolute top-0 left-0 hidden w-[62%] p-6 md:block lg:p-10">
            <span className="block h-[14px] w-[83px] text-day/90">
              <KgmWordmark className="h-full w-full" />
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-12 md:items-end md:gap-8">
        <motion.div className="md:col-span-7" style={{ x: on ? titleX : 0 }}>
          <span className="label flex items-center gap-3">
            <span className="text-signal">Concepto {c.n}</span>
            <span className="text-silver/60">—</span>
            {c.kicker}
          </span>
          <h3 id={`concept-${c.n}`} className="display mt-3 text-[clamp(2rem,4.2vw,4.4rem)] text-bone">
            “{c.message}”
          </h3>
        </motion.div>
        <motion.p className="text-sm leading-relaxed text-silver md:col-span-5 md:text-base" style={{ x: on ? bodyX : 0 }}>
          {c.body}
        </motion.p>
      </div>
    </motion.article>
  );
}

/** Gives one panel its own position on the track. */
function PanelSlot({ progress, index, count, on, children }: { progress: MotionValue<number>; index: number; count: number; on: boolean; children: React.ReactNode }) {
  const local = useTransform(progress, (v) => v * (count - 1) - index);
  return (
    <PanelCtx.Provider value={{ local, on }}>
      <div className={on ? "h-full" : ""}>{children}</div>
    </PanelCtx.Provider>
  );
}

/** Two digits that roll like an odometer when the value changes. */
function RollingText({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} className="inline-block whitespace-nowrap" initial={{ y: "105%" }} animate={{ y: "0%" }} exit={{ y: "-105%" }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Heads-up display of the pinned track: rolling counter, ticked progress rail with a travelling marker, current concept. */
function TrackHud({ progress, active }: { progress: MotionValue<number>; active: number }) {
  const n = concepts.items.length;
  const smooth = useSpring(progress, { stiffness: 140, damping: 26, mass: 0.4 });
  const markerX = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const hint = useTransform(progress, [0, 0.06], [1, 0]);
  return (
    <div className="absolute inset-x-[7vw] bottom-4 flex items-end gap-6" aria-hidden>
      <div className="flex items-baseline gap-2">
        <RollingText value={concepts.items[active].n} className="display text-4xl leading-none text-bone" />
        <span className="label text-[0.6rem]">/ {String(n).padStart(2, "0")}</span>
      </div>
      <div className="relative mb-[0.55rem] h-px flex-1 bg-bone/15 [html[data-theme=sand]_&]:bg-bone/25">
        <motion.span className="label absolute bottom-3 left-0 text-[0.6rem]" style={{ opacity: hint }}>
          Desliza para explorar
        </motion.span>
        <motion.div className="absolute inset-0 origin-left bg-bone" style={{ scaleX: smooth }} />
        {concepts.items.map((c, i) => (
          <span key={c.n} className={`absolute top-1/2 h-[9px] w-px -translate-y-1/2 transition-colors duration-500 ${i <= active ? "bg-bone" : "bg-bone/30"}`} style={{ left: `${(i / (n - 1)) * 100}%` }} />
        ))}
        <motion.div className="absolute inset-0" style={{ x: markerX }}>
          <span className="absolute top-1/2 left-0 block h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal ring-4 ring-signal/25" />
        </motion.div>
      </div>
      <RollingText value={concepts.items[active].kicker} className="label w-[19rem] justify-end text-[0.6rem]" />
    </div>
  );
}

export function Concepts() {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const [desktop, setDesktop] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const horizontal = desktop && !reduced;

  // Measure the track once it is laid out horizontally, and whenever it resizes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !horizontal) {
      setDistance(0);
      return;
    }
    // Not scrollWidth: the parallax transforms inside the panels would inflate it.
    // Layout offsets ignore transforms, so the distance always ends with the last panel fully on screen.
    const measure = () => {
      const first = el.firstElementChild as HTMLElement | null;
      const last = el.lastElementChild as HTMLElement | null;
      if (!first || !last) return;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const width = last.offsetLeft - first.offsetLeft + last.offsetWidth + pad * 2;
      setDistance(Math.max(0, Math.round(width - window.innerWidth)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [horizontal]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.06, 0.96], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0.06, 0.96], [0, 1]);
  const count = concepts.items.length;
  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    const next = Math.min(count - 1, Math.max(0, Math.round(v * (count - 1))));
    setActive((cur) => (cur === next ? cur : next));
  });

  return (
    <section id="concepts" className="relative bg-ink">
      <div className="mx-auto max-w-7xl px-5 pt-28 md:px-10 md:pt-40">
        <SectionLabel>{concepts.label}</SectionLabel>
        <div className="mt-8 grid gap-8 md:grid-cols-12">
          <WordsReveal text={concepts.title} className="display text-[clamp(3rem,8.5vw,8rem)] text-bone md:col-span-9" />
          <FadeIn as="p" className="label self-end leading-relaxed normal-case tracking-[0.12em] md:col-span-3">
            {concepts.disclaimer}
          </FadeIn>
        </div>
      </div>

      <div ref={ref} className="relative" style={{ height: horizontal ? `calc(100svh + ${distance}px)` : "auto" }}>
        <div className={horizontal ? "sticky top-0 flex h-[100svh] items-center overflow-hidden pb-10" : ""}>
          <motion.div
            ref={trackRef}
            className={horizontal ? "flex h-[72svh] gap-[6vw] px-[7vw] pt-6 will-change-transform" : "flex flex-col gap-28 px-5 py-24"}
            style={{ x: horizontal ? x : 0 }}
          >
            {concepts.items.map((c, i) => (
              <PanelSlot key={c.n} progress={progress} index={i} count={count} on={horizontal}>
                <ConceptPanel c={c} index={i} />
              </PanelSlot>
            ))}
          </motion.div>
          {horizontal && <TrackHud progress={progress} active={active} />}
        </div>
      </div>
    </section>
  );
}
