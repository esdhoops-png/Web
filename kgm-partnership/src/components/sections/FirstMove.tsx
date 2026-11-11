"use client";

import { motion } from "framer-motion";
import { firstMove } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { FadeIn } from "@/components/ui/Motion";
import { Magnetic, Tilt } from "@/components/ui/Fx";
import { KgmWordmark } from "@/components/ui/Logos";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IO = [0.76, 0, 0.24, 1] as const;

/** Headline built letter by letter from a mask. The observer sits on the (unclipped) heading itself. */
function Headline({ text, className = "" }: { text: string; className?: string }) {
  const { reduced } = useMotionPrefs();
  const words = text.split(" ");
  return (
    <motion.h2
      className={className}
      aria-label={text}
      key={reduced ? "still" : "motion"}
      initial={reduced ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
    >
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-nowrap [margin-bottom:-0.04em]">
          {Array.from(w).map((c, ci) => (
            <motion.span
              key={ci}
              className="inline-block origin-bottom-left will-change-transform"
              variants={{
                hidden: { y: "115%", rotate: 9, opacity: 0 },
                show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.05, ease: EASE, opacity: { duration: 0.4 } } },
              }}
            >
              {c}
            </motion.span>
          ))}
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.h2>
  );
}

/** A masked line that rises into place (child of a variants parent). */
function Rise({ children, className = "", delay }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block will-change-transform"
        variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: delay === undefined ? { duration: 1, ease: EASE } : { duration: 1, ease: EASE, delay } } }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function FirstMove() {
  const { scrollTo, reduced } = useMotionPrefs();
  const steps = firstMove.steps;
  return (
    <section id="first-move" className="relative overflow-hidden bg-bone py-28 text-ink md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <FadeIn className="label flex items-center gap-4 !text-ink/60" y={12}>
          <span className="h-px w-10 bg-ink/40" aria-hidden />
          <span>{firstMove.label}</span>
        </FadeIn>

        <div className="mt-8 grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <Headline text={firstMove.title} className="display text-[clamp(3.4rem,10vw,9.5rem)] leading-[0.86]" />
            <FadeIn as="p" className="mt-10 max-w-xl font-serif text-2xl leading-snug md:text-[2rem]" delay={0.35}>
              {firstMove.body}
            </FadeIn>
          </div>

          {/* The reserved seat: a card that swings up on its hinge, then the name is written on it */}
          <Tilt max={9} className="aspect-[4/5] max-h-[520px] self-end md:col-span-5">
            <motion.div
              className="relative h-full w-full [transform-style:preserve-3d]"
              key={reduced ? "still" : "motion"}
              initial={reduced ? "show" : "hidden"}
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              variants={{ hidden: {}, show: {} }}
            >
              {/* soft shadow the card lands on */}
              <motion.div
                aria-hidden
                className="absolute inset-x-[6%] -bottom-5 h-10 rounded-[50%] bg-ink/30 blur-xl"
                variants={{ hidden: { opacity: 0, scaleX: 0.5 }, show: { opacity: 1, scaleX: 1, transition: { duration: 1.4, ease: EASE, delay: 0.3 } } }}
              />
              <motion.div
                className="relative flex h-full w-full origin-bottom flex-col justify-between overflow-hidden bg-ink p-7 text-bone will-change-transform md:p-9"
                variants={{
                  hidden: { rotateX: -78, y: 60, opacity: 0, transformPerspective: 1200 },
                  show: {
                    rotateX: 0,
                    y: 0,
                    opacity: 1,
                    transformPerspective: 1200,
                    transition: { duration: 1.5, ease: EASE_OUT, opacity: { duration: 0.5 } },
                  },
                }}
              >
                {/* one pass of light across the card as it lands */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-[-20%] left-0 w-[45%] -skew-x-12 bg-gradient-to-r from-transparent via-bone/15 to-transparent"
                  variants={{ hidden: { x: "-140%" }, show: { x: "340%", transition: { duration: 1.5, ease: EASE_IO, delay: 0.95 } } }}
                />
                {/* frame that draws itself inside the card */}
                <motion.span aria-hidden className="pointer-events-none absolute inset-x-3 top-3 block h-px origin-left bg-bone/20" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease: EASE, delay: 0.8 } } }} />
                <motion.span aria-hidden className="pointer-events-none absolute inset-x-3 bottom-3 block h-px origin-right bg-bone/20" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease: EASE, delay: 0.8 } } }} />
                <motion.span aria-hidden className="pointer-events-none absolute inset-y-3 left-3 block w-px origin-bottom bg-bone/20" variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1.1, ease: EASE, delay: 0.8 } } }} />
                <motion.span aria-hidden className="pointer-events-none absolute inset-y-3 right-3 block w-px origin-top bg-bone/20" variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1.1, ease: EASE, delay: 0.8 } } }} />

                <div className="relative flex items-start justify-between">
                  <motion.span
                    className="label text-bone"
                    variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE, delay: 0.75 } } }}
                  >
                    Socio oficial · {firstMove.seat}
                  </motion.span>
                  <Rise className="display text-6xl text-tan md:text-7xl" delay={0.7}>
                    01
                  </Rise>
                </div>
                <div className="relative">
                  <motion.span
                    className="label block !text-signal"
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 1.05 } } }}
                  >
                    Reservado para
                  </motion.span>
                  <span className="relative mt-5 block h-[34px] w-[200px] md:h-[44px] md:w-[260px]">
                    <motion.span
                      className="block h-full w-full will-change-transform"
                      variants={{
                        hidden: { clipPath: "inset(0% 100% 0% 0%)", x: -12 },
                        show: { clipPath: "inset(0% 0% 0% 0%)", x: 0, transition: { duration: 1.25, ease: EASE_IO, delay: 1.3 } },
                      }}
                    >
                      <KgmWordmark className="h-full w-full" />
                    </motion.span>
                    {/* the leading edge of the wipe */}
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 block"
                      variants={{
                        hidden: { x: "0%", opacity: 0 },
                        show: { x: ["0%", "100%"], opacity: [0, 1, 1, 0], transition: { duration: 1.25, ease: EASE_IO, delay: 1.3 } },
                      }}
                    >
                      <span className="absolute inset-y-[-12%] left-0 block w-[2px] bg-signal" />
                    </motion.span>
                  </span>
                  <motion.span
                    aria-hidden
                    className="mt-6 block h-px origin-left bg-bone/25"
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease: EASE, delay: 1.9 } } }}
                  />
                  <motion.p
                    className="label mt-5 normal-case leading-relaxed tracking-[0.1em] text-silver/80 [html[data-theme=sand]_&]:text-silver"
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 2 } } }}
                  >
                    {firstMove.note}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </Tilt>
        </div>

        <div className="mt-24 md:mt-32">
          <FadeIn as="span" className="label block !text-ink/60" y={12}>
            {firstMove.stepsTitle}
          </FadeIn>
          <motion.ol
            className="relative mt-6 grid border-b border-ink/15 sm:grid-cols-2 lg:grid-cols-4 lg:border-b-0"
            key={reduced ? "still" : "motion"}
            initial={reduced ? "show" : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -14% 0px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.32, delayChildren: 0.1 } } }}
          >
            {steps.map((st, i) => (
              <li key={st.title} className="relative py-8 sm:pr-8 lg:px-8 lg:first:pl-0">
                <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}>
                  {/* the connecting line: each segment hands over to the next */}
                  <span aria-hidden className="absolute inset-x-0 top-0 block h-px bg-ink/15" />
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-0 top-0 block h-px origin-left bg-signal [html[data-theme=sand]_&]:bg-ember"
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.75, ease: [0.65, 0, 0.35, 1] } } }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute top-0 left-0 block h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-signal [html[data-theme=sand]_&]:bg-ember"
                    variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } } }}
                  />
                  {i < steps.length - 1 && (
                    <motion.span
                      aria-hidden
                      className="absolute top-0 right-0 bottom-0 hidden w-px origin-top bg-ink/15 lg:block"
                      variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1, ease: EASE, delay: 0.4 } } }}
                    />
                  )}
                  <motion.span
                    className="label block !text-signal [html[data-theme=sand]_&]:!text-ember"
                    variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } } }}
                  >
                    Paso {i + 1}
                  </motion.span>
                  <h3 className="display mt-4 text-4xl">
                    <Rise className="pb-[0.14em] [margin-bottom:-0.14em]">{st.title}</Rise>
                  </h3>
                  <motion.p
                    className="mt-3 text-base leading-relaxed text-ink/70"
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
                  >
                    {st.body}
                  </motion.p>
                </motion.div>
              </li>
            ))}
          </motion.ol>

          <FadeIn className="mt-14">
            <Magnetic strength={0.3}>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contact");
                }}
                className="group relative inline-flex items-center gap-5 overflow-hidden rounded-full bg-ink py-4 pr-4 pl-8 text-bone transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[0.97]"
              >
                <span className="absolute inset-0 origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" aria-hidden />
                <span className="label relative text-bone [html[data-theme=sand]_&]:transition-colors [html[data-theme=sand]_&]:duration-500 [html[data-theme=sand]_&]:group-hover:text-day">{firstMove.cta}</span>
                <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-bone text-ink transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:translate-x-[220%]">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="absolute -translate-x-[220%] transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:translate-x-0">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </span>
              </a>
            </Magnetic>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
