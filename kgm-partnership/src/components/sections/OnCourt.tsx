"use client";

import Image from "next/image";
import { motion, useAnimationFrame, useInView, useMotionValue, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { onCourt, type Img } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { useVelocitySkew } from "@/components/ui/Fx";
import { FadeIn } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;

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

/**
 * One strip of photos. It drifts on its own, accelerates (and reverses) with the scroll speed,
 * leans into the movement, and eases to a stop when the pointer is over it so a photo can be picked.
 */
function Row({ items, reverse = false, velocity, skew, index }: { items: Img[]; reverse?: boolean; velocity: MotionValue<number>; skew: MotionValue<number>; index: number }) {
  const { reduced } = useMotionPrefs();
  const wrap = useRef<HTMLDivElement>(null);
  const inView = useInView(wrap, { margin: "20% 0px" });
  const [hovered, setHovered] = useState<number | null>(null);
  const hovering = useRef(false);
  const drift = useRef(1); // 1 = cruising, 0 = held by the pointer
  const pos = useMotionValue(reverse ? -50 : 0); // % of the track, wraps in [-50, 0)
  const x = useTransform(pos, (v) => `${v}%`);
  const dir = reverse ? 1 : -1;

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;
    const dt = Math.min(delta, 60) / 1000;
    drift.current += ((hovering.current ? 0 : 1) - drift.current) * Math.min(1, dt * 5);
    const v = velocity.get(); // px/s, signed
    const boost = Math.max(-9, Math.min(9, v / 220));
    // base: one full loop in ~70s; scrolling down pushes it along, scrolling up pulls it back
    let next = pos.get() + dir * (0.72 * drift.current + 0.72 * boost) * dt;
    if (next <= -50) next += 50;
    if (next > 0) next -= 50;
    pos.set(next);
  });

  // The list is rendered twice so the loop is seamless.
  return (
    <motion.div
      ref={wrap}
      className="flex overflow-hidden"
      initial={{ opacity: 0, x: reverse ? -120 : 120 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.6, ease: EASE, delay: index * 0.15 }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
        setHovered(null);
      }}
    >
      <motion.ul className="flex shrink-0 gap-3 pr-3 will-change-transform md:gap-4 md:pr-4" style={{ x: reduced ? 0 : x, skewX: reduced ? 0 : skew, width: "max-content" }}>
        {[...items, ...items].map((img, i) => {
          const dim = hovered !== null && hovered !== i;
          const focus = hovered === i;
          return (
            <li
              key={i}
              aria-hidden={i >= items.length}
              data-cursor="Ver"
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setHovered(i);
              }}
              className={`relative h-[38vw] max-h-[340px] min-h-[180px] shrink-0 overflow-hidden transition-opacity duration-500 ${i % 3 === 1 ? "aspect-[4/3]" : "aspect-[4/5]"} ${dim ? "opacity-30" : "opacity-100"}`}
            >
              <div className={`absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${focus ? "scale-[1.09]" : "scale-100"}`}>
                <Image src={img.src} alt={i < items.length ? img.alt : ""} fill sizes="(min-width: 768px) 30vw, 60vw" className="cine-img object-cover" style={{ objectPosition: img.position }} />
              </div>
              {/* frame that draws in on the focused photo */}
              <span aria-hidden className={`pointer-events-none absolute inset-2 border border-bone/70 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${focus ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"}`} />
            </li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

/** Moving strip of real ESD HOOPS tournament and training photography. */
export function OnCourt() {
  const { scrollY } = useScroll();
  const raw = useVelocity(scrollY);
  const velocity = useSpring(raw, { stiffness: 260, damping: 50 });
  const skew = useVelocitySkew(5);

  return (
    <section aria-labelledby="oncourt-title" className="relative overflow-hidden bg-ink py-20 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 md:px-10">
        <div>
          <FadeIn as="span" y={12} className="label flex items-center gap-4">
            <span className="h-px w-10 bg-silver/50" aria-hidden />
            {onCourt.label}
          </FadeIn>
          <MaskHeadline id="oncourt-title" text={onCourt.title} className="display mt-6 text-[clamp(2.4rem,5.4vw,5rem)] text-bone" />
        </div>
        <FadeIn as="p" delay={0.3} className="label normal-case tracking-[0.12em]">
          {onCourt.note}
        </FadeIn>
      </div>
      <div className="mt-12 flex flex-col gap-3 md:mt-16 md:gap-4">
        <Row items={onCourt.rowA} velocity={velocity} skew={skew} index={0} />
        <Row items={onCourt.rowB} velocity={velocity} skew={skew} index={1} reverse />
      </div>
    </section>
  );
}
