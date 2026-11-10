"use client";

import { motion } from "framer-motion";
import world from "@/data/world-dots.json";
import { globalReach, images } from "@/content/site";
import { CineImage, FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;
type Pt = [number, number];

function arc(a: Pt, b: Pt, lift = 0.35): string {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return `M${a[0]},${a[1]} Q${mx},${my - d * lift} ${b[0]},${b[1]}`;
}

export function GlobalReach() {
  const A = world.anchors as unknown as Record<string, Pt>;
  const na = A.northAmerica;
  const eu = A.europe;
  const as = A.asia;
  const arcs = [arc(na, eu), arc(eu, as), arc(na, as, 0.28)];
  const dotsPath = (world.dots as unknown as Pt[]).map(([x, y]) => `M${x},${y}h0`).join("");

  return (
    <section id="global-reach" className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <SectionLabel>{globalReach.label}</SectionLabel>
            <WordsReveal text={globalReach.title} className="display mt-8 text-[clamp(2.8rem,7vw,6.5rem)] text-bone" />
          </div>
          <FadeIn as="p" className="self-end text-base leading-relaxed text-silver md:col-span-5 md:text-lg">
            {globalReach.body}
          </FadeIn>
        </div>

        {/* Animated map */}
        <figure className="relative mt-16 md:mt-24">
          <svg viewBox={`0 0 ${world.width} ${world.height}`} className="w-full" role="img" aria-label="Map illustrating connections between North America, Europe and Asia">
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#b97a4e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#b97a4e" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="arcGrad" x1="0" x2="1">
                <stop offset="0%" stopColor="#f2e9df" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#f2e9df" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b97a4e" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <motion.path
              d={dotsPath}
              stroke="#c3b3a3"
              strokeWidth={3.2}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6 }}
            />
            {arcs.map((d, i) => (
              <g key={i}>
                <motion.path
                  d={d}
                  fill="none"
                  stroke="url(#arcGrad)"
                  strokeWidth={1.4}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-20% 0px" }}
                  transition={{ duration: 2.2, ease: EASE, delay: 0.6 + i * 0.4 }}
                />
                {/* travelling light */}
                <circle r={2.6} fill="#f2e9df">
                  <animateMotion dur={`${5 + i}s`} repeatCount="indefinite" path={d} begin={`${2 + i * 0.6}s`} />
                </circle>
              </g>
            ))}
            {globalReach.regions.map((r, i) => {
              const [x, y] = A[r.key];
              return (
                <g key={r.key}>
                  <circle cx={x} cy={y} r={46} fill="url(#glow)" />
                  <circle cx={x} cy={y} r={5} fill="none" stroke="#b97a4e" strokeWidth={1} style={{ transformOrigin: `${x}px ${y}px`, animation: `pulse-ring 2.8s ease-out ${i * 0.7}s infinite` }} />
                  <circle cx={x} cy={y} r={3.6} fill="#b97a4e" />
                  <motion.text
                    x={x}
                    y={y + 26}
                    textAnchor="middle"
                    fill="#f2e9df"
                    style={{ fontSize: 14, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.4 + i * 0.25, duration: 1 }}
                  >
                    {r.name}
                  </motion.text>
                </g>
              );
            })}
          </svg>
          <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t hairline pt-6">
            <span className="label flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-signal" aria-hidden /> {globalReach.community}
            </span>
            <span className="label text-[0.6rem] text-silver/60">Illustrative — regions of player connections, not offices or operations</span>
          </figcaption>
        </figure>

        {/* Faces of the game */}
        <div className="mt-24 grid grid-cols-2 gap-3 md:mt-32 md:grid-cols-12 md:gap-5">
          <CineImage img={images.esdProfile} className="aspect-[3/4] md:col-span-3 md:mt-24" sizes="(min-width: 768px) 25vw, 50vw" parallax={6} />
          <CineImage img={images.esdIntensity} className="aspect-[3/4] md:col-span-5 md:aspect-[4/5]" sizes="(min-width: 768px) 40vw, 50vw" delay={0.1} parallax={4} />
          <div className="col-span-2 flex flex-col justify-end md:col-span-4">
            <CineImage img={images.esdFlight} className="hidden aspect-[4/5] md:block" sizes="30vw" delay={0.2} parallax={8} />
            <FadeIn as="p" className="mt-8 font-serif text-2xl leading-snug text-bone italic md:text-3xl">
              “{globalReach.quote}”
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
