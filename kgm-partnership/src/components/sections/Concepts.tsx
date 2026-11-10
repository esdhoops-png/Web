"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { concepts, type Img, type Vehicle } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";
import { KgmWordmark } from "@/components/ui/Logos";
import { VehicleCutout } from "@/components/ui/VehicleCutout";

type Concept = (typeof concepts.items)[number];

function Shot({ img, className = "", sizes, vehicle }: { img: Img; className?: string; sizes: string; vehicle?: Vehicle }) {
  return (
    <div className={`relative overflow-hidden bg-charcoal ${className}`}>
      <Image src={img.src} alt={img.alt} fill sizes={sizes} className="cine-img object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105" style={{ objectPosition: img.position }} />
      {vehicle && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
          <motion.div
            className={`absolute bottom-[4%] w-[min(72%,560px)] ${vehicle.faces === "left" ? "right-[4%]" : "left-[4%]"}`}
            initial={{ x: vehicle.faces === "left" ? "40%" : "-40%", opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "0px -10% 0px -10%" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <VehicleCutout vehicle={vehicle} sizes="40vw" />
          </motion.div>
          <span className="label absolute top-3 right-3 bg-ink/70 px-2 py-1 text-[0.55rem] text-bone">Concept montage</span>
        </>
      )}
    </div>
  );
}

/** Schematic 3x3 event layout — a creative proposal, drawn as a plan. */
function EventPlan() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" role="img" aria-label="Concept plan of a 3x3 event: court, KGM vehicle display, experience zone and stands">
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
        <text x="215" y="140" textAnchor="middle">3X3 COURT</text>
        <text x="65" y="98" textAnchor="middle">KGM DISPLAY</text>
        <text x="65" y="168" textAnchor="middle">EXPERIENCE ZONE</text>
        <text x="350" y="134" textAnchor="middle" transform="rotate(90 350 130)">ACTIVATION</text>
        <text x="215" y="256" textAnchor="middle" fillOpacity="0.6">STANDS</text>
      </g>
      <circle cx="65" cy="110" r="3" fill="#b97a4e" />
    </svg>
  );
}

function ConceptPanel({ c, index }: { c: Concept; index: number }) {
  const [a, b, d] = c.images;
  const m = "montage" in c && c.montage ? c.montage : undefined;
  const v = (i: number) => (m && m.on === i ? m.vehicle : undefined);
  return (
    <article className="group relative flex h-full w-full shrink-0 flex-col justify-between gap-6 md:w-[86vw] md:max-w-[1500px]" aria-labelledby={`concept-${c.n}`}>
      <div className="relative grid flex-1 grid-cols-12 grid-rows-6 gap-2 md:gap-3">
        {index === 1 ? (
          <>
            <Shot vehicle={v(0)} img={a} className="col-span-12 row-span-4 md:col-span-5 md:row-span-6" sizes="(min-width: 768px) 40vw, 100vw" />
            <div className="relative col-span-12 row-span-2 border hairline bg-ink/80 p-3 md:col-span-4 md:row-span-6 md:p-6">
              <span className="label absolute top-3 left-3 text-[0.55rem] md:top-5 md:left-5">Concept plan</span>
              <EventPlan />
            </div>
            <Shot vehicle={v(1)} img={b} className="hidden md:col-span-3 md:row-span-3 md:block" sizes="25vw" />
            <Shot vehicle={v(2)} img={d} className="hidden md:col-span-3 md:row-span-3 md:block" sizes="25vw" />
          </>
        ) : index === 2 ? (
          <>
            <Shot vehicle={v(0)} img={a} className="col-span-7 row-span-6 md:col-span-4" sizes="(min-width: 768px) 30vw, 60vw" />
            <Shot vehicle={v(1)} img={b} className="col-span-5 row-span-4 md:col-span-6 md:row-span-6" sizes="(min-width: 768px) 45vw, 40vw" />
            <Shot vehicle={v(2)} img={d} className="col-span-5 row-span-2 md:col-span-2 md:row-span-3" sizes="(min-width: 768px) 15vw, 40vw" />
            {"values" in c && c.values && (
              <ul className="hidden flex-col justify-end gap-1 md:col-span-2 md:row-span-3 md:flex">
                {c.values.map((v) => (
                  <li key={v} className="display text-2xl text-bone lg:text-3xl">{v}.</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <Shot vehicle={v(0)} img={a} className="col-span-12 row-span-4 md:col-span-8 md:row-span-6" sizes="(min-width: 768px) 60vw, 100vw" />
            <Shot vehicle={v(1)} img={b} className="col-span-6 row-span-2 md:col-span-4 md:row-span-3" sizes="(min-width: 768px) 30vw, 50vw" />
            <Shot vehicle={v(2)} img={d} className="col-span-6 row-span-2 md:col-span-4 md:row-span-3" sizes="(min-width: 768px) 30vw, 50vw" />
          </>
        )}

        {/* Campaign overlay */}
        {index !== 1 && (
          <div className="pointer-events-none absolute top-0 left-0 hidden w-[62%] p-6 md:block lg:p-10">
            <span className="block h-[14px] w-[83px] text-bone/90">
              <KgmWordmark className="h-full w-full" />
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-12 md:items-end md:gap-8">
        <div className="md:col-span-7">
          <span className="label flex items-center gap-3">
            <span className="text-signal">Concept {c.n}</span>
            <span className="text-silver/60">—</span>
            {c.kicker}
          </span>
          <h3 id={`concept-${c.n}`} className="display mt-3 text-[clamp(2rem,4.2vw,4.4rem)] text-bone">
            “{c.message}”
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-silver md:col-span-5 md:text-base">{c.body}</p>
      </div>
    </article>
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
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
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
            className={horizontal ? "flex h-[72svh] gap-[6vw] px-[7vw] pt-6" : "flex flex-col gap-24 px-5 py-20"}
            style={{ x: horizontal ? x : 0 }}
          >
            {concepts.items.map((c, i) => (
              <div key={c.n} className={horizontal ? "h-full" : "h-[110vw] max-h-[720px] min-h-[560px]"}>
                <ConceptPanel c={c} index={i} />
              </div>
            ))}
          </motion.div>
          {horizontal && (
            <div className="absolute inset-x-[7vw] bottom-5 flex items-center gap-6">
              <span className="label text-[0.6rem]">Scroll to explore</span>
              <div className="h-px flex-1 bg-bone/10">
                <motion.div className="h-px origin-left bg-bone" style={{ scaleX: progress }} />
              </div>
              <span className="label text-[0.6rem]">04 concepts</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
