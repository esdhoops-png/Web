"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { hero, images, vehicles, type Img, type Vehicle } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { Lockup } from "@/components/ui/Logos";
import { VehicleCutout } from "@/components/ui/VehicleCutout";
import { useMouseParallax } from "@/components/ui/Fx";

const EASE = [0.22, 1, 0.36, 1] as const;
const EXPO = [0.16, 1, 0.3, 1] as const;

/** Dimmed look of the two flanking cars (same recipe as the shared Lineup). */
const SIDE = "brightness-[0.5] saturate-[0.8] [html[data-theme=sand]_&]:brightness-[0.82] [html[data-theme=sand]_&]:saturate-100";

/** True from the md breakpoint up (three panels + three cars). Starts true so the desktop presentation never flashes. */
function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

/**
 * Linear ramp of a scroll progress value, clamped. Written as a function transform on purpose:
 * range-mapped opacity straight from useScroll gets handed to a native scroll timeline and came back un-clamped.
 */
function useRamp(p: MotionValue<number>, a: number, b: number, from: number, to: number) {
  return useTransform(p, (v) => from + (to - from) * Math.min(1, Math.max(0, (v - a) / (b - a))));
}

type MV = MotionValue<number> | MotionValue<string> | number | string;

/** One photo "curtain": opens like a shutter on load, then is pushed aside / pulled forward by scroll. */
function Panel({
  img,
  className,
  delay,
  sizes,
  priority,
  mobilePosition,
  from,
  x,
  scale,
  innerX,
}: {
  img: Img;
  className: string;
  delay: number;
  sizes: string;
  priority?: boolean;
  mobilePosition?: string;
  /** clip-path the shutter opens from */
  from: string;
  x?: MV;
  scale?: MV;
  /** counter-drift of the photo inside its frame (depth) */
  innerX?: MV;
}) {
  return (
    <motion.div className={`relative ${className}`} style={{ x, scale }}>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ clipPath: from }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 1.7, ease: [0.76, 0, 0.24, 1], delay }}
      >
        <motion.div className="absolute inset-y-0 -inset-x-[6%]" style={{ x: innerX }}>
          <motion.div className="absolute inset-0" initial={{ scale: 1.3 }} animate={{ scale: 1.04 }} transition={{ duration: 3.4, ease: EASE, delay }}>
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={priority}
              sizes={sizes}
              className="cine-img object-cover [html[data-theme=sand]_&]:grayscale [html[data-theme=sand]_&]:contrast-[1.15] [html[data-theme=sand]_&]:brightness-[1.12] object-(--pos-m) md:object-(--pos)"
              style={{ "--pos": img.position ?? "50% 50%", "--pos-m": mobilePosition ?? img.position ?? "50% 50%" } as React.CSSProperties}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** One headline line, built letter by letter out of a mask. */
function TitleLine({ text, delay, className = "" }: { text: string; delay: number; className?: string }) {
  return (
    <span className="block overflow-hidden px-[0.08em] pb-[0.08em] whitespace-pre" aria-hidden>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          className={`inline-block will-change-transform ${className}`}
          initial={{ y: "115%", rotate: 7 }}
          animate={{ y: "0%", rotate: 0 }}
          transition={{ duration: 1.25, ease: EXPO, delay: delay + i * 0.045 }}
          style={{ transformOrigin: "0% 100%" }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * The hero car arrives in shadow; a band of light then travels along the body (masked to the
 * car's own silhouette) and the light bar switches on. Rests fully lit.
 */
function CarLight({ vehicle, delay }: { vehicle: Vehicle; delay: number }) {
  const mask = `url(${vehicle.img.src})`;
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }}
      >
        <motion.div
          className="absolute inset-y-0 right-0 w-[300%] bg-[linear-gradient(90deg,rgba(13,30,44,0)_0%,rgba(13,30,44,0)_30%,rgba(217,196,176,0.55)_34%,rgba(13,30,44,0.6)_38%,rgba(13,30,44,0.82)_46%,rgba(13,30,44,0.82)_100%)]"
          initial={{ x: "0%" }}
          animate={{ x: "70%" }}
          transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1], delay }}
        />
      </div>
      {/* Light bar glow: flares as the sweep reaches the nose, then settles */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[33%] left-[57%] h-[18%] w-[46%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(217,196,176,0.95)_0%,rgba(217,196,176,0.35)_38%,rgba(217,196,176,0)_70%)] mix-blend-screen blur-md [html[data-theme=sand]_&]:hidden"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 0.4], scale: [0.6, 1.5, 1] }}
        transition={{ duration: 1.6, ease: "easeOut", times: [0, 0.3, 1], delay: delay + 1.05 }}
      />
    </>
  );
}

export function Hero() {
  // Scroll ranges differ between the phone and the desktop scene: remount when the breakpoint flips
  // so every transform is built with the right values (this happens under the opening sequence).
  const wide = useWide();
  return <HeroScene key={wide ? "wide" : "narrow"} wide={wide} />;
}

function HeroScene({ wide }: { wide: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const mouse = useMouseParallax();

  // 0 → 1 while the scene is pinned.
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Curtains: side photos are pushed out, the night court is pulled towards the camera.
  const sideOut = wide ? 46 : 0;
  const leftX = useTransform(p, [0, 0.75], ["0%", `-${sideOut}%`]);
  const rightX = useTransform(p, [0, 0.75], ["0%", `${sideOut}%`]);
  const leftInnerX = useTransform(p, [0, 0.75], ["0%", wide ? "5%" : "0%"]);
  const rightInnerX = useTransform(p, [0, 0.75], ["0%", wide ? "-5%" : "0%"]);
  const centerScale = useTransform(p, [0, 1], [1, 1.42]);
  const soloScale = useTransform(p, [0, 1], [1, 1.18]); // phones: the single photo just breathes in
  const veil = useRamp(p, 0.15, 0.8, 0, 0.32);

  // Headline: the two lines track apart, grow and lift away, clearing the stage for the car.
  const spread = wide ? 22 : 16;
  const lineAX = useTransform(p, [0, 0.6], ["0vw", `-${spread}vw`]);
  const lineBX = useTransform(p, [0, 0.6], ["0vw", `${spread}vw`]);
  const titleScale = useTransform(p, [0, 0.6], [1, wide ? 1.35 : 1.15]);
  const titleY = useTransform(p, [0, 0.6], ["0svh", wide ? "-4svh" : "-3svh"]);
  const titleOpacity = useRamp(p, 0.06, 0.48, 1, 0);
  const metaOpacity = useRamp(p, 0, 0.16, 1, 0);
  const metaY = useTransform(p, [0, 0.2], [0, -36]);

  // Cars: the flanking models part, the hero model pushes towards the camera.
  const carScale = useTransform(p, [0, 0.9], [1, wide ? 1.85 : 1.1]);
  const carY = useTransform(p, [0, 0.9], ["0svh", wide ? "-9svh" : "-20svh"]);
  const sideLX = useTransform(p, [0.02, 0.55], ["0%", "-85%"]);
  const sideRX = useTransform(p, [0.02, 0.55], ["0%", "85%"]);
  const sideOpacity = useRamp(p, 0.1, 0.5, 1, 0);
  const floor = useRamp(p, 0, 0.7, 0, 1);
  const cueOpacity = useRamp(p, 0, 0.06, 1, 0);

  // Pointer depth: photos drift against the pointer, type a little with it, cars the most.
  const bgX = useTransform(mouse.x, (v) => v * -14);
  const bgY = useTransform(mouse.y, (v) => v * -8);
  const typeX = useTransform(mouse.x, (v) => v * 9);
  const typeY = useTransform(mouse.y, (v) => v * 5);
  const carsX = useTransform(mouse.x, (v) => v * 26);
  const carsY = useTransform(mouse.y, (v) => v * 7);
  const sidesX = useTransform(mouse.x, (v) => v * -12);

  const on = !reduced;

  return (
    <section
      ref={ref}
      id="top"
      className={`relative bg-ink ${on ? "h-[210svh] md:h-[235svh]" : "h-[100svh]"}`}
      aria-label="ESD HOOPS × KGM — Two worlds, one vision"
    >
      <div className="grain sticky top-0 h-[100svh] overflow-hidden">
        {/* Background: the court world (players · night court · players) */}
        <motion.div
          className="absolute -inset-x-4 -inset-y-3 isolate flex gap-[3px] md:gap-1.5 [html[data-theme=sand]_&]:opacity-80 [html[data-theme=sand]_&]:mix-blend-multiply"
          style={on ? { x: bgX, y: bgY } : undefined}
        >
          <Panel
            img={images.esdShooter}
            mobilePosition="50% 20%"
            className="flex-1 md:flex-[0.9]"
            from="inset(0% 0% 100% 0%)"
            delay={1.25}
            sizes="(min-width: 768px) 32vw, 100vw"
            priority
            x={on ? leftX : 0}
            scale={on && !wide ? soloScale : 1}
            innerX={on ? leftInnerX : 0}
          />
          <Panel
            img={images.courtNight}
            className="z-10 hidden flex-[1.4] md:block"
            from="inset(50% 0% 50% 0%)"
            delay={1.1}
            sizes="60vw"
            scale={on ? centerScale : 1}
          />
          <Panel
            img={images.esdOneOnOne}
            className="hidden flex-[0.9] md:block"
            from="inset(100% 0% 0% 0%)"
            delay={1.4}
            sizes="32vw"
            x={on ? rightX : 0}
            innerX={on ? rightInnerX : 0}
          />
        </motion.div>

        {/* Grading layers */}
        <div className="pointer-events-none absolute inset-0 bg-ink/45 [html[data-theme=sand]_&]:bg-ink/25" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(13,30,44,0.1)_0%,rgba(13,30,44,0.6)_60%,rgba(13,30,44,0.95)_100%)] [html[data-theme=sand]_&]:hidden" />
        {/* Sand theme only: a pool of clean sand behind the title so the navy type reads, photos breathing at the sides */}
        <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_62%_46%_at_50%_36%,rgba(217,196,176,0.96)_0%,rgba(217,196,176,0.88)_45%,rgba(217,196,176,0.35)_80%,rgba(217,196,176,0)_100%)] [html[data-theme=sand]_&]:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
        {/* The room darkens as the car comes forward, handing over to the next (dark) scene */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: on ? veil : 0 }} />

        {/* Title block */}
        <motion.div className="relative z-10 mx-auto max-w-7xl px-5 pt-24 md:pt-28" style={on ? { x: typeX, y: typeY } : undefined}>
          <div className="flex flex-col items-center text-center">
            <motion.div style={on ? { opacity: metaOpacity, y: metaY } : undefined}>
              <motion.div
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: EASE, delay: 2.2 }}
                className="mb-7 text-bone md:mb-8"
              >
                <Lockup size={48} />
              </motion.div>
            </motion.div>
            <motion.h1
              className="display origin-top text-[clamp(3.4rem,9.4vw,7.6rem)] text-bone"
              aria-label={`${hero.titleA} ${hero.titleB}`}
              style={on ? { scale: titleScale, y: titleY, opacity: titleOpacity } : undefined}
            >
              <motion.span className="block" style={on ? { x: lineAX } : undefined}>
                <TitleLine text={hero.titleA} delay={1.6} />
              </motion.span>
              <motion.span className="block" style={on ? { x: lineBX } : undefined}>
                <TitleLine text={hero.titleB} delay={1.85} className="text-tan italic" />
              </motion.span>
            </motion.h1>
            <motion.div style={on ? { opacity: metaOpacity, y: metaY } : undefined}>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: EASE, delay: 2.75 }}
                className="mt-5 flex flex-col items-center gap-3"
              >
                <p className="max-w-sm font-serif text-lg text-silver italic md:max-w-none md:text-2xl [html[data-theme=sand]_&]:text-bone/85">“{hero.subtitle}”</p>
                <span className="label hidden items-center text-bone md:flex">
                  ESD HOOPS × KGM
                  <motion.span
                    aria-hidden
                    className="mx-3 block h-px w-8 origin-left bg-signal"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.1, ease: EASE, delay: 3.1 }}
                  />
                  {hero.eyebrow}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* The KGM line-up drives into the scene */}
        <motion.div
          className="absolute bottom-[12svh] left-1/2 z-20 w-[min(92vw,640px)] -translate-x-1/2 md:bottom-[7svh] md:w-[min(92vw,1240px,128svh)]"
          style={on ? { x: carsX, y: carsY } : undefined}
        >
          <div className="relative flex items-end justify-center">
            {/* Left: Musso EV, rolls in from the left and waits in the shadows */}
            <motion.div className="relative z-0 -mr-[9%] hidden w-[31%] md:block" style={on ? { x: sideLX, opacity: sideOpacity } : undefined}>
              <motion.div style={on ? { x: sidesX } : undefined}>
                <motion.div
                  className={`translate-y-[-6%] ${SIDE}`}
                  initial={{ x: "-60%", opacity: 0 }}
                  animate={{ x: "0%", opacity: 1 }}
                  transition={{ duration: 1.9, ease: EXPO, delay: 2.35 }}
                >
                  <VehicleCutout vehicle={vehicles.mussoWhite} sizes="26vw" glow={false} />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Centre: Torres EVX, the hero car */}
            <motion.div className="relative z-10 w-full origin-bottom md:w-[46%]" style={on ? { scale: carScale, y: carY } : undefined}>
              <motion.div
                initial={{ x: "-85vw" }}
                animate={{ x: "0vw" }}
                transition={{ duration: 2.1, ease: EXPO, delay: 1.75 }}
              >
                {/* Floor light that builds as the car pushes forward */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-[-18%] bottom-[-9%] h-[42%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(217,196,176,0.32)_0%,rgba(217,196,176,0.1)_45%,rgba(217,196,176,0)_72%)] blur-lg [html[data-theme=sand]_&]:hidden"
                  style={{ opacity: on ? floor : 0 }}
                />
                {/* Sand theme only: floor shade so the white hero car separates from the sand ground */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-[-10%] bottom-[-5%] hidden h-[30%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(13,30,44,0.6)_0%,rgba(13,30,44,0.28)_42%,rgba(13,30,44,0)_70%)] blur-xl [html[data-theme=sand]_&]:block"
                />
                {/* Brake dive: the nose dips a touch as the car comes to rest */}
                <motion.div
                  className="relative origin-[20%_100%]"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 0, 0.9, 0] }}
                  transition={{ duration: 2.1, ease: "easeOut", times: [0, 0.3, 0.52, 1], delay: 1.75 }}
                >
                  <VehicleCutout vehicle={vehicles.torresEvx} sizes="(min-width: 768px) 80vw, 92vw" priority />
                  <CarLight vehicle={vehicles.torresEvx} delay={2.55} />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right: Actyon Hybrid faces left, so it arrives from the right */}
            <motion.div className="relative z-0 -ml-[9%] hidden w-[31%] md:block" style={on ? { x: sideRX, opacity: sideOpacity } : undefined}>
              <motion.div style={on ? { x: sidesX } : undefined}>
                <motion.div
                  className={`translate-y-[-6%] ${SIDE}`}
                  initial={{ x: "60%", opacity: 0 }}
                  animate={{ x: "0%", opacity: 1 }}
                  transition={{ duration: 1.9, ease: EXPO, delay: 2.5 }}
                >
                  <VehicleCutout vehicle={vehicles.actyon} sizes="26vw" glow={false} />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 md:bottom-4" style={{ opacity: on ? cueOpacity : 1 }}>
          <motion.a
            href="#opportunity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 3.4 }}
            className="flex flex-col items-center gap-2"
            aria-label="Seguir bajando"
            data-cursor="Baja"
          >
            <span className="label text-[0.6rem] md:hidden [html[data-theme=sand]_&]:text-bone/80">Desliza</span>
            <span className="relative block h-8 w-px overflow-hidden bg-bone/15">
              <span className="absolute inset-0 bg-bone" style={{ animation: "scroll-cue 2.2s cubic-bezier(.22,1,.36,1) infinite" }} />
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
