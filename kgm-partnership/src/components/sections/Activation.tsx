"use client";

import Image from "next/image";
import { AnimatePresence, motion, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { activation } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { useMouseParallax } from "@/components/ui/Fx";
import { FadeIn, SectionLabel } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IO = [0.76, 0, 0.24, 1] as const;
const OPEN = "inset(0% 0% 0% 0%)";

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

export function Activation() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const { reduced } = useMotionPrefs();
  const item = activation.items[active];
  const total = String(activation.items.length).padStart(2, "0");

  // The photo drifts a few pixels against the pointer: depth inside the frame.
  const mouse = useMouseParallax();
  const px = useTransform(mouse.x, (v) => v * -14);
  const py = useTransform(mouse.y, (v) => v * -10);

  const go = (next: number) => {
    if (next === active) return;
    setDir(next > active ? 1 : -1);
    setActive(next);
    // On phones the tabs are a horizontal strip: bring the chosen one into view.
    const tab = tabsRef.current[next];
    const strip = tab?.parentElement;
    if (tab && strip && strip.scrollWidth > strip.clientWidth) {
      strip.scrollTo({ left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
    }
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = activation.items.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      go(next);
      tabsRef.current[next]?.focus();
    }
  };

  // The image opens like a shutter in the direction of travel between tabs.
  const shut = dir === 1 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";
  const shutExit = dir === 1 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)";
  const titleWords = item.title.split(" ");

  return (
    <section id="activation" className="relative bg-charcoal py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <SectionLabel>{activation.label}</SectionLabel>
            <Headline text={activation.title} className="display mt-8 text-[clamp(3.2rem,9vw,8.5rem)] text-bone" />
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
                  onClick={() => go(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  data-cursor={selected ? undefined : "Ver"}
                  className={`group relative shrink-0 border px-4 py-3 text-left transition-colors duration-500 md:border-0 md:border-b md:px-0 md:py-7 ${selected ? "border-bone/60 md:border-bone/15" : "hairline"}`}
                >
                  {/* Travelling indicator: wash + accent bar glide from tab to tab */}
                  {selected && (
                    <motion.span
                      layoutId="act-indicator"
                      aria-hidden
                      transition={{ type: "spring", stiffness: 240, damping: 30, mass: 0.9 }}
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bone/[0.07] to-transparent"
                    >
                      <span className="absolute top-0 bottom-0 left-0 hidden w-[2px] bg-signal md:block" />
                      <span className="absolute right-0 bottom-0 left-0 h-[2px] bg-signal md:hidden" />
                    </motion.span>
                  )}
                  <span className={`label relative block transition-all duration-500 ${selected ? "!text-signal md:translate-x-5" : "md:group-hover:translate-x-2"}`}>Activación {it.n}</span>
                  <span className={`display relative mt-2 block text-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:text-4xl ${selected ? "text-bone md:translate-x-5" : "text-silver/60 group-hover:text-bone md:group-hover:translate-x-2 [html[data-theme=sand]_&]:text-silver/75 [html[data-theme=sand]_&]:group-hover:text-bone"}`}>
                    {it.short}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div className="relative md:col-span-8">
            {/* Warm the cache so a tab change never wipes open onto an empty frame */}
            <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
              {activation.items.map((it) => (
                <Image key={it.n} src={it.image.src} alt="" fill loading="eager" sizes="(min-width: 1024px) 30vw, 100vw" />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                role="tabpanel"
                id={`act-panel-${active}`}
                aria-labelledby={`act-tab-${active}`}
                initial="hidden"
                whileInView="show"
                exit="exit"
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                variants={{ hidden: {}, show: {}, exit: { opacity: 0, transition: { duration: 0.32, ease: EASE_IO } } }}
                className="grid gap-8 lg:grid-cols-2"
              >
                {/* Image: shutter wipe, inner zoom settles, pointer depth */}
                <motion.div
                  className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[520px]"
                  variants={{
                    hidden: { clipPath: reduced ? OPEN : shut },
                    show: { clipPath: OPEN, transition: { duration: 0.9, ease: EASE_IO } },
                    exit: { clipPath: reduced ? OPEN : shutExit, transition: { duration: 0.32, ease: EASE_IO } },
                  }}
                >
                  <motion.div className="absolute -inset-[4%]" style={reduced ? undefined : { x: px, y: py }}>
                    <motion.div
                      className="absolute inset-0"
                      variants={{ hidden: { scale: 1.32, y: dir * 40 }, show: { scale: 1, y: 0, transition: { duration: 1.7, ease: EASE } } }}
                    >
                      <Image src={item.image.src} alt={item.image.alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="cine-img object-cover" style={{ objectPosition: item.image.position }} />
                    </motion.div>
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/10 to-transparent" />

                  {/* Index counter rolls in */}
                  <div aria-hidden className="absolute top-5 left-6 flex items-baseline gap-2 text-day">
                    <span className="display block overflow-hidden text-5xl md:text-6xl">
                      <motion.span className="block" variants={{ hidden: { y: `${dir * 105}%` }, show: { y: "0%", transition: { duration: 0.9, ease: EASE, delay: 0.35 } } }}>
                        {item.n}
                      </motion.span>
                    </span>
                    <motion.span className="label !text-day/80" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, delay: 0.6 } } }}>
                      / {total}
                    </motion.span>
                  </div>

                  <h3 className="display absolute right-6 bottom-6 left-6 text-3xl text-day md:text-4xl" aria-label={item.title}>
                    {titleWords.map((w, k) => (
                      <span key={k} aria-hidden className="inline-block overflow-hidden pb-[0.14em] align-top [margin-bottom:-0.14em]">
                        <motion.span
                          className="inline-block"
                          variants={{ hidden: { y: "115%" }, show: { y: "0%", transition: { duration: 0.9, ease: EASE, delay: 0.42 + k * 0.06 } } }}
                        >
                          {w}
                        </motion.span>
                        {k < titleWords.length - 1 ? " " : ""}
                      </span>
                    ))}
                  </h3>
                  <motion.span
                    aria-hidden
                    className="absolute right-6 bottom-3 left-6 h-px origin-left bg-day/50"
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease: EASE, delay: 0.5 } } }}
                  />
                </motion.div>

                <div className="flex flex-col">
                  <motion.p
                    className="font-serif text-2xl leading-snug text-bone md:text-3xl"
                    variants={{
                      hidden: { opacity: 0, y: 26, clipPath: reduced ? OPEN : "inset(0% 0% 100% 0%)" },
                      show: { opacity: 1, y: 0, clipPath: OPEN, transition: { duration: 0.9, ease: EASE, delay: 0.12 } },
                      exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
                    }}
                  >
                    {item.summary}
                  </motion.p>
                  <motion.span className="label mt-10 block" variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE, delay: 0.22 } } }}>
                    Posibilidades
                  </motion.span>
                  <ul className="mt-4">
                    {item.options.map((o, k) => {
                      const d = 0.28 + k * 0.055;
                      return (
                        <li key={o} className="group/opt relative flex items-baseline gap-4 py-3 text-bone/90">
                          <span className="label block w-6 overflow-hidden text-[0.6rem] transition-colors duration-500 group-hover/opt:!text-signal">
                            <motion.span className="block" variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.7, ease: EASE, delay: d } } }}>
                              {String(k + 1).padStart(2, "0")}
                            </motion.span>
                          </span>
                          <motion.span
                            className="block"
                            variants={{ hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE, delay: d + 0.04 } } }}
                          >
                            <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/opt:translate-x-2">{o}</span>
                          </motion.span>
                          <motion.span
                            aria-hidden
                            className="absolute right-0 bottom-0 left-0 h-px origin-left bg-bone/[0.14]"
                            variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE, delay: d } } }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-auto pt-10">
                    {/* Benefit: the accent line draws first, then the copy is unveiled */}
                    <div className="relative pl-5">
                      <motion.span
                        aria-hidden
                        className="absolute top-0 bottom-0 left-0 w-[2px] origin-top bg-signal"
                        variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.7, ease: EASE_IO, delay: 0.7 } } }}
                      />
                      <motion.span
                        className="label block !text-signal"
                        variants={{
                          hidden: { opacity: 0, clipPath: reduced ? OPEN : "inset(0% 100% 0% 0%)" },
                          show: { opacity: 1, clipPath: OPEN, transition: { duration: 0.7, ease: EASE, delay: 0.95 } },
                        }}
                      >
                        Beneficio para KGM
                      </motion.span>
                      <motion.p
                        className="mt-2 text-base leading-relaxed text-bone md:text-lg"
                        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 1.05 } } }}
                      >
                        {item.benefit}
                      </motion.p>
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
