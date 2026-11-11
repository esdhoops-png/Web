"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import world from "@/data/world-dots.json";
import { globalReach, images } from "@/content/site";
import { palette, THEME } from "@/content/theme";
import { useMotionPrefs } from "@/components/Providers";
import { useMouseParallax } from "@/components/ui/Fx";
import { CineImage, FadeIn, ScrollFillText, SectionLabel } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;
type Pt = [number, number];

function arc(a: Pt, b: Pt, lift = 0.35): string {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return `M${a[0]},${a[1]} Q${mx},${my - d * lift} ${b[0]},${b[1]}`;
}

/**
 * Headline that builds itself letter by letter from behind a mask. The trigger sits on the
 * heading itself (never on the masked letters, which are clipped and would not be observed).
 */
function MaskHeadline({ text, className = "", id }: { text: string; className?: string; id?: string }) {
  const words = text.split(" ");
  let n = 0;
  return (
    <motion.h2 id={id} className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-nowrap [margin-bottom:-0.04em]">
          {Array.from(w).map((c, ci) => {
            const d = n++ * 0.024;
            return (
              <motion.span
                key={ci}
                className="inline-block origin-bottom-left will-change-transform"
                variants={{
                  hidden: { y: "115%", rotate: 9, opacity: 0 },
                  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.05, ease: EASE, delay: d, opacity: { duration: 0.4, delay: d } } },
                }}
              >
                {c}
              </motion.span>
            );
          })}
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </motion.h2>
  );
}

/** The scan crosses the map west to east in SWEEP seconds; everything else is timed against it. */
const SWEEP = 1.7;
const BAND = 25;
const at = (x: number) => (x / world.width) * SWEEP;

// Dots grouped into vertical bands so the continents can light up as the scan passes over them.
const bands: { x: number; d: string }[] = (() => {
  const map = new Map<number, string>();
  for (const [x, y] of world.dots as unknown as Pt[]) {
    const k = Math.floor(x / BAND);
    map.set(k, (map.get(k) ?? "") + `M${x},${y}h0`);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([k, d]) => ({ x: k * BAND, d }));
})();

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

export function GlobalReach() {
  const A = world.anchors as unknown as Record<string, Pt>;
  const na = A.northAmerica;
  const eu = A.europe;
  const as = A.asia;
  // Each arc leaves when the scan reaches its origin and lands as the destination node pings.
  const arcs = [
    { d: arc(na, eu), delay: at(na[0]) + 0.25, dur: 1.3 },
    { d: arc(eu, as), delay: at(eu[0]) + 0.35, dur: 1.3 },
    { d: arc(na, as, 0.28), delay: SWEEP + 0.25, dur: 1.7 },
  ];
  const dotOpacity = THEME === "sand" ? 0.3 : 0.5;

  const { reduced } = useMotionPrefs();
  const desktop = useDesktop();
  const live = !reduced;

  // Depth: the land and the network sit on two planes that drift apart with the pointer.
  const mouse = useMouseParallax();
  const landX = useTransform(mouse.x, (v) => v * 7);
  const landY = useTransform(mouse.y, (v) => v * 4);
  const netX = useTransform(mouse.x, (v) => v * -11);
  const netY = useTransform(mouse.y, (v) => v * -6);

  // The map settles into place as it rises into view.
  const mapRef = useRef<HTMLElement>(null);
  const { scrollYProgress: mapP } = useScroll({ target: mapRef, offset: ["start end", "end start"] });
  const mapScale = useTransform(mapP, [0, 0.45], [0.9, 1]);

  // The three portraits travel at different rates.
  const trioRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: trioP } = useScroll({ target: trioRef, offset: ["start end", "end start"] });
  const colA = useTransform(trioP, [0, 1], [70, -70]);
  const colB = useTransform(trioP, [0, 1], [-30, 30]);
  const colC = useTransform(trioP, [0, 1], [70, -110]);
  const drift = live && desktop;

  return (
    <section id="global-reach" className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <SectionLabel>{globalReach.label}</SectionLabel>
            <MaskHeadline text={globalReach.title} className="display mt-8 text-[clamp(2.8rem,7vw,6.5rem)] text-bone" />
          </div>
          <FadeIn as="p" className="self-end text-base leading-relaxed text-silver md:col-span-5 md:text-lg">
            {globalReach.body}
          </FadeIn>
        </div>

        {/* Animated map */}
        <figure ref={mapRef} className="relative mt-16 md:mt-24">
          <motion.svg
            viewBox={`0 0 ${world.width} ${world.height}`}
            className="w-full overflow-visible"
            role="img"
            aria-label="Mapa que ilustra conexiones entre Norteamérica, Europa y Asia"
            style={{ scale: live ? mapScale : 1 }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={palette.accent} stopOpacity="0.35" />
                <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
              </radialGradient>
              <linearGradient id="arcGrad" x1="0" x2="1">
                <stop offset="0%" stopColor={palette.fg} stopOpacity="0.15" />
                <stop offset="50%" stopColor={palette.fg} stopOpacity="0.9" />
                <stop offset="100%" stopColor={palette.accent} stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="scanGrad" x1="0" x2="1">
                <stop offset="0%" stopColor={palette.accent} stopOpacity="0" />
                <stop offset="100%" stopColor={palette.accent} stopOpacity="0.28" />
              </linearGradient>
            </defs>

            {/* land: lights up band by band behind the scan */}
            <motion.g style={{ x: landX, y: landY }}>
              {bands.map((b) => (
                <motion.path
                  key={b.x}
                  d={b.d}
                  stroke={palette.muted}
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: [0, 1, dotOpacity], y: 0, transition: { duration: 0.9, ease: EASE, delay: at(b.x), opacity: { duration: 0.9, times: [0, 0.25, 1], delay: at(b.x) } } },
                  }}
                />
              ))}
            </motion.g>

            {/* the scan itself: a soft wake and a bright leading edge */}
            <motion.g
              variants={{
                hidden: { x: -90, opacity: 0 },
                show: { x: world.width, opacity: [0, 1, 1, 0], transition: { x: { duration: SWEEP * 1.09, ease: "linear" }, opacity: { duration: SWEEP * 1.09, times: [0, 0.08, 0.9, 1] } } },
              }}
            >
              <rect x={0} y={0} width={90} height={world.height} fill="url(#scanGrad)" />
              <line x1={90} x2={90} y1={0} y2={world.height} stroke={palette.accent} strokeWidth={1.2} />
            </motion.g>

            <motion.g style={{ x: netX, y: netY }}>
              {arcs.map((a, i) => (
                <g key={i}>
                  <motion.path
                    d={a.d}
                    fill="none"
                    stroke="url(#arcGrad)"
                    strokeWidth={1.4}
                    variants={{
                      hidden: { pathLength: 0, opacity: 0 },
                      show: { pathLength: 1, opacity: 1, transition: { duration: a.dur, ease: [0.65, 0, 0.35, 1], delay: a.delay, opacity: { duration: 0.2, delay: a.delay } } },
                    }}
                  />
                  {/* travelling light: only switched on once its arc has been drawn */}
                  <motion.g variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, delay: a.delay + a.dur } } }}>
                    <g>
                      <circle r={8} fill={palette.accent} opacity={0.22} />
                      <circle r={2.6} fill={palette.fg} />
                      <animateMotion dur={`${5 + i}s`} repeatCount="indefinite" path={a.d} begin={`${i * 0.6}s`} />
                    </g>
                  </motion.g>
                </g>
              ))}
              {globalReach.regions.map((r, i) => {
                const [x, y] = A[r.key];
                const t = at(x) + 0.1;
                // Asia is confirmed a second time when the long arc lands.
                const land = i === 1 ? arcs[0].delay + arcs[0].dur : i === 2 ? arcs[1].delay + arcs[1].dur : t;
                return (
                  <g key={r.key}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={46}
                      fill="url(#glow)"
                      variants={{ hidden: { opacity: 0, scale: 0.2 }, show: { opacity: 1, scale: 1, transition: { duration: 1.4, ease: EASE, delay: t } } }}
                    />
                    {/* one decisive ping as the scan (and later the arc) reaches the node */}
                    {[t, land + 0.02].map((d, k) => (
                      <motion.circle
                        key={k}
                        cx={x}
                        cy={y}
                        r={6}
                        fill="none"
                        stroke={palette.accent}
                        strokeWidth={1.2}
                        vectorEffect="non-scaling-stroke"
                        variants={{ hidden: { opacity: 0, scale: 0.4 }, show: { opacity: [0, 0.95, 0], scale: 9, transition: { duration: 1.5, ease: EASE, delay: d, opacity: { duration: 1.5, times: [0, 0.12, 1], delay: d } } } }}
                      />
                    ))}
                    <motion.g variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: t + 1.2 } } }}>
                      <circle cx={x} cy={y} r={5} fill="none" stroke={palette.accent} strokeWidth={1} style={{ transformOrigin: `${x}px ${y}px`, animation: `pulse-ring 2.8s ease-out ${i * 0.7}s infinite` }} />
                    </motion.g>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={3.6}
                      fill={palette.accent}
                      variants={{ hidden: { opacity: 0, scale: 0 }, show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: t, opacity: { duration: 0.2, delay: t } } } }}
                    />
                    <motion.g variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: t + 0.2 } } }}>
                      <text
                        x={x}
                        y={y + 26}
                        textAnchor="middle"
                        fill={palette.fg}
                        {...(THEME === "sand" ? { stroke: palette.bg, strokeWidth: 5, strokeLinejoin: "round" as const, paintOrder: "stroke" } : {})}
                        style={{ fontSize: 14, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}
                      >
                        {r.name}
                      </text>
                    </motion.g>
                  </g>
                );
              })}
            </motion.g>
          </motion.svg>
          <figcaption className="relative mt-6 flex flex-wrap items-center justify-between gap-4 pt-6">
            <motion.span
              aria-hidden
              className="absolute inset-x-0 top-0 block h-px origin-left bg-bone/15"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.4 }}
            />
            <FadeIn as="span" y={10} delay={0.5} className="label flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-signal" aria-hidden /> {globalReach.community}
            </FadeIn>
            <FadeIn as="span" y={10} delay={0.65} className="label text-[0.6rem] text-silver/60 [html[data-theme=sand]_&]:text-silver/90">
              Ilustrativo: regiones de conexión con jugadores, no oficinas ni operaciones
            </FadeIn>
          </figcaption>
        </figure>

        {/* Faces of the game */}
        <div ref={trioRef} className="mt-24 grid grid-cols-2 gap-3 md:mt-32 md:grid-cols-12 md:gap-5">
          <motion.div className="md:col-span-3 md:mt-24" style={{ y: drift ? colA : 0 }}>
            <CineImage img={images.esdProfile} className="aspect-[3/4]" sizes="(min-width: 768px) 25vw, 50vw" parallax={6} reveal="up" />
          </motion.div>
          <motion.div className="md:col-span-5" style={{ y: drift ? colB : 0 }}>
            <CineImage img={images.esdIntensity} className="aspect-[3/4] md:aspect-[4/5]" sizes="(min-width: 768px) 40vw, 50vw" delay={0.18} parallax={4} reveal="center" />
          </motion.div>
          <div className="col-span-2 flex flex-col justify-end md:col-span-4">
            <motion.div className="hidden md:block" style={{ y: drift ? colC : 0 }}>
              <CineImage img={images.esdFlight} className="aspect-[4/5]" sizes="30vw" delay={0.36} parallax={8} reveal="right" />
            </motion.div>
            <ScrollFillText text={`“${globalReach.quote}”`} className="mt-8 font-serif text-2xl leading-snug text-bone italic md:text-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
