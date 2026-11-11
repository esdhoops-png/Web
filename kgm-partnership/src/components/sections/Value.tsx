"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { value, vehicles } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { StageTile } from "@/components/ui/VehicleCutout";
import { DrawLine, Tilt } from "@/components/ui/Fx";
import { FadeIn, SectionLabel } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IO = [0.76, 0, 0.24, 1] as const;
const LINE = "bg-bone/[0.14]";

/**
 * Section headline built letter by letter from masks. Same look as the shared WordsReveal, but the
 * viewport is observed on the heading itself: letters parked below their mask are fully clipped,
 * so observing them individually never fires.
 */
function Headline({ text, as = "h2", className = "", delay = 0 }: { text: string; as?: "h2" | "span"; className?: string; delay?: number }) {
  const M = motion[as];
  const words = text.split(" ");
  let n = 0;
  return (
    <M className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -12% 0px" }}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-nowrap [margin-bottom:-0.04em]">
          {Array.from(w).map((c, ci) => {
            const d = delay + n++ * 0.022;
            return (
              <motion.span
                key={ci}
                className="inline-block origin-bottom-left will-change-transform"
                variants={{
                  hidden: { y: "115%", rotate: 9, opacity: 0 },
                  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: d, opacity: { duration: 0.4, delay: d } } },
                }}
              >
                {c}
              </motion.span>
            );
          })}
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </M>
  );
}

export function Value() {
  const { reduced } = useMotionPrefs();
  const boardRef = useRef<HTMLOListElement>(null);
  const total = value.items.length;
  const [seen, setSeen] = useState(1);

  // The sticky column keeps score of the board as it scrolls past.
  const { scrollYProgress } = useScroll({ target: boardRef, offset: ["start 0.75", "end 0.75"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const rows = Math.ceil(total / 2);
    const row = Math.min(rows, Math.max(1, Math.ceil(v * rows + 0.001)));
    setSeen(Math.min(total, row * 2));
  });
  const shown = reduced ? total : seen;

  return (
    <section id="value" className="relative bg-charcoal py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <SectionLabel>{value.label}</SectionLabel>
              <Headline text={value.title} className="display mt-8 text-[clamp(3.2rem,8vw,7.5rem)] text-bone" />
              <motion.div
                className="mt-10 hidden md:block"
                initial={reduced ? false : { clipPath: "inset(0% 0% 100% 0%)" }}
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 1.3, ease: EASE_IO, delay: 0.15 }}
              >
                <Tilt max={7}>
                  <motion.div initial={{ scale: 1.14 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: EASE, delay: 0.15 }}>
                    <StageTile vehicle={vehicles.mussoWhite} className="aspect-[4/3]" sizes="35vw" />
                  </motion.div>
                </Tilt>
              </motion.div>

              {/* Board progress */}
              <div aria-hidden className="mt-6 hidden items-center gap-4 md:flex">
                <span className="label flex overflow-hidden !text-bone">
                  <motion.span key={shown} className="block" initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 0.6, ease: EASE }}>
                    {String(shown).padStart(2, "0")}
                  </motion.span>
                </span>
                <span className={`relative block h-px flex-1 ${LINE}`}>
                  <motion.span className="absolute inset-0 origin-left bg-signal" style={{ scaleX: reduced ? 1 : progress }} />
                </span>
                <span className="label">{String(total).padStart(2, "0")}</span>
              </div>

              <FadeIn as="p" className="label mt-6 normal-case tracking-[0.12em] text-silver/70">
                {value.note}
              </FadeIn>
            </div>
          </div>

          {/* Strategy board */}
          <ol ref={boardRef} className="relative grid sm:grid-cols-2 md:col-span-7">
            <li aria-hidden className="absolute top-0 right-0 left-0 list-none">
              <DrawLine className="text-bone/[0.14]" />
            </li>
            {value.items.map((it, i) => {
              const d = (i % 2) * 0.14;
              const words = it.title.split(" ");
              return (
                <motion.li
                  key={it.title}
                  className="group relative flex min-h-[260px] flex-col justify-between p-6 md:min-h-[300px] md:p-8"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                >
                  {/* Hover wash rises from the floor of the cell */}
                  <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-t from-bone/[0.08] to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />

                  {/* Hairlines draw themselves */}
                  <motion.span
                    aria-hidden
                    className={`absolute right-0 bottom-0 left-0 h-px origin-left ${LINE}`}
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.3, ease: EASE_IO, delay: d } } }}
                  />
                  {i % 2 === 0 && (
                    <motion.span
                      aria-hidden
                      className={`absolute top-0 right-0 bottom-0 hidden w-px origin-top sm:block ${LINE}`}
                      variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1.3, ease: EASE_IO, delay: d + 0.1 } } }}
                    />
                  )}

                  <div className="relative flex items-start justify-between">
                    {/* Numeral rolls up from behind a mask; on hover it lights and slides */}
                    <span className="display block overflow-hidden text-7xl text-bone/15 transition-[color,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 group-hover:text-signal md:text-8xl [html[data-theme=sand]_&]:text-bone/20 [html[data-theme=sand]_&]:group-hover:text-signal">
                      <motion.span
                        className="block"
                        variants={{ hidden: { y: "105%" }, show: { y: "0%", transition: { duration: 1.2, ease: EASE, delay: d + 0.15 } } }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </motion.span>
                    </span>
                    <motion.span
                      className="mt-3 block"
                      aria-hidden
                      variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { duration: 0.7, ease: EASE, delay: d + 0.6 } } }}
                    >
                      <span className="block h-2 w-2 rounded-full border border-silver/50 transition-all duration-500 group-hover:scale-150 group-hover:border-signal group-hover:bg-signal" />
                    </motion.span>
                  </div>
                  <div className="relative transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5">
                    <h3 className="display text-3xl leading-[1.02] text-bone md:text-[2.4rem]" aria-label={it.title}>
                      {words.map((w, k) => (
                        <span key={k} aria-hidden className="inline-block overflow-hidden pb-[0.16em] align-top [margin-bottom:-0.16em]">
                          <motion.span
                            className="inline-block"
                            variants={{ hidden: { y: "115%" }, show: { y: "0%", transition: { duration: 1, ease: EASE, delay: d + 0.3 + k * 0.05 } } }}
                          >
                            {w}
                          </motion.span>
                          {k < words.length - 1 ? " " : ""}
                        </span>
                      ))}
                    </h3>
                    <motion.p
                      className="mt-4 text-sm leading-relaxed text-silver md:text-base"
                      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: d + 0.55 } } }}
                    >
                      {it.body}
                    </motion.p>
                  </div>
                  <span aria-hidden className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
