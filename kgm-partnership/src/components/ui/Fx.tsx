"use client";

/**
 * Motion toolkit shared by every section. Everything here is transform/opacity only,
 * switches itself off for reduced motion and for touch devices where it relies on a pointer.
 */
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionPrefs } from "@/components/Providers";

const EASE = [0.22, 1, 0.36, 1] as const;

/** True on devices with a real pointer (mouse / trackpad). */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * Pointer position across the window as two sprung motion values in the range -1..1.
 * Multiply with useTransform to move layers at different depths (parallax).
 */
export function useMouseParallax(): { x: MotionValue<number>; y: MotionValue<number> } {
  const { reduced } = useMotionPrefs();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const x = useSpring(rx, { stiffness: 60, damping: 18, mass: 0.6 });
  const y = useSpring(ry, { stiffness: 60, damping: 18, mass: 0.6 });
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      rx.set((e.clientX / window.innerWidth) * 2 - 1);
      ry.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced, rx, ry]);
  return { x, y };
}

/** A layer that drifts with the pointer. depth: pixels of travel at the screen edge (negative = opposite). */
export function ParallaxLayer({ children, depth = 20, className = "" }: { children: ReactNode; depth?: number; className?: string }) {
  const { x, y } = useMouseParallax();
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth * 0.6);
  return (
    <motion.div className={className} style={{ x: tx, y: ty }}>
      {children}
    </motion.div>
  );
}

/** Wraps a button/link so it is pulled towards the pointer while hovered. */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionPrefs();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const x = useSpring(rx, { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(ry, { stiffness: 220, damping: 16, mass: 0.4 });
  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        rx.set((e.clientX - (r.left + r.width / 2)) * strength);
        ry.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/** 3D tilt that follows the pointer, with a moving sheen. Put it around cards / hero objects. */
export function Tilt({ children, max = 8, className = "", sheen = true }: { children: ReactNode; max?: number; className?: string; sheen?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 120, damping: 16 });
  const sy = useSpring(py, { stiffness: 120, damping: 16 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(sx, [0, 1], ["0%", "100%"]);
  const gy = useTransform(sy, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 55%)`;
  return (
    <div ref={ref} className={className} style={{ perspective: 1100 }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      <motion.div className="relative h-full w-full" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {children}
        {sheen && <motion.div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: glare }} />}
      </motion.div>
    </div>
  );
}

/** Skew (deg) driven by scroll velocity: gives marquees and big type a sense of speed. */
export function useVelocitySkew(max = 6): MotionValue<number> {
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const smooth = useSpring(v, { stiffness: 300, damping: 60 });
  return useTransform(smooth, [-3000, 0, 3000], [max, 0, -max], { clamp: true });
}

/**
 * A full-bleed scene that opens like a shutter as it scrolls into view:
 * it starts as an inset, rounded card and grows to the full width of the page.
 */
export function SceneReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const inset = useTransform(scrollYProgress, [0, 1], [7, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [36, 0]);
  const clip = useMotionTemplate`inset(${inset}% ${inset}% 0% ${inset}% round ${radius}px)`;
  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { clipPath: clip }}>
      {children}
    </motion.div>
  );
}

/** A hairline that draws itself from left to right when it enters the viewport. */
export function DrawLine({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className={`block h-px origin-left bg-current ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.4, ease: EASE, delay }}
    />
  );
}

/** Children appear one after another (use on lists and grids). Wrap each child in <StaggerItem>. */
export function Stagger({ children, className = "", gap = 0.08, as = "div" }: { children: ReactNode; className?: string; gap?: number; as?: "div" | "ul" | "ol" }) {
  const M = motion[as];
  return (
    <M className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}>
      {children}
    </M>
  );
}
export function StaggerItem({ children, className = "", as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const M = motion[as];
  return (
    <M className={className} variants={{ hidden: { opacity: 0, y: 34, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.95, ease: EASE } } }}>
      {children}
    </M>
  );
}
