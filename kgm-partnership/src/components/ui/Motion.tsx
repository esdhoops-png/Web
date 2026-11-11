"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ElementType, type ReactNode } from "react";
import type { Img } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { palette, THEME } from "@/content/theme";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Headline that reveals word by word from behind a mask. */
export function WordsReveal({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-top">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "105%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * stagger }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Generic fade/rise on enter. */
export function FadeIn({
  children,
  className = "",
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "p" | "li" | "span";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/**
 * Scroll-driven text fill: words light up from silver to off-white as the
 * paragraph crosses the viewport (inspired by the reference's letter fill).
 */
export function ScrollFillText({ text, className = "", accentWords = [] as string[] }: { text: string; className?: string; accentWords?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <FillWord
          key={i}
          word={w}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          reduced={reduced}
          accent={accentWords.includes(w.replace(/[.,]/g, ""))}
          last={i === words.length - 1}
        />
      ))}
    </p>
  );
}

function FillWord({
  word,
  progress,
  range,
  reduced,
  accent,
  last,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  reduced: boolean;
  accent: boolean;
  last: boolean;
}) {
  const opacity = useTransform(progress, range, [THEME === "sand" ? 0.3 : 0.16, 1]);
  return (
    <span aria-hidden className="relative">
      <motion.span style={{ opacity: reduced ? 1 : opacity }} className={accent ? "text-signal" : undefined}>
        {word}
      </motion.span>
      {last ? "" : " "}
    </span>
  );
}

/**
 * Letter fill for short headings: letters turn from dim to bright with a
 * red "cursor" letter at the edge of the fill — echoing the reference video.
 */
export function LetterFill({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.4"] });
  const chars = Array.from(text);
  return (
    <span ref={ref} className={className} aria-label={text} role="text">
      {chars.map((c, i) => (
        <Letter key={i} c={c} i={i} n={chars.length} progress={scrollYProgress} reduced={reduced} />
      ))}
    </span>
  );
}

function Letter({ c, i, n, progress, reduced }: { c: string; i: number; n: number; progress: MotionValue<number>; reduced: boolean }) {
  const a = i / n;
  const b = (i + 1) / n;
  const color = useTransform(progress, [a - 0.001, a, b, Math.min(1, b + 0.12)], [palette.dim, palette.accent, palette.accent, palette.fg]);
  return (
    <motion.span aria-hidden style={{ color: reduced ? palette.fg : color }}>
      {c}
    </motion.span>
  );
}

/** Image with a cinematic clip reveal on enter and an optional parallax drift. */
export function CineImage({
  img,
  className = "",
  sizes = "100vw",
  parallax = 0,
  priority = false,
  reveal = "up",
  delay = 0,
  imgClassName = "",
}: {
  img: Img;
  className?: string;
  sizes?: string;
  parallax?: number;
  priority?: boolean;
  reveal?: "up" | "left" | "right" | "center" | "none";
  delay?: number;
  imgClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);

  const clips: Record<string, [string, string]> = {
    up: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
    left: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
    right: ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"],
    center: ["inset(0% 50% 0% 50%)", "inset(0% 0% 0% 0%)"],
    none: ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
  };
  const [from, to] = clips[reveal];

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden bg-charcoal ${className}`}
      initial={reduced ? false : { clipPath: from }}
      whileInView={{ clipPath: to }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.4, ease: EASE, delay }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ y: parallax && !reduced ? y : 0, scale: parallax ? 1 + parallax / 50 : 1 }}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { scale: 1.18 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, ease: EASE, delay }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`cine-img object-cover ${imgClassName}`}
            style={{ objectPosition: img.position ?? "50% 50%" }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Small uppercase section label with a leading rule. */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <FadeIn className={`label flex items-center gap-4 ${className}`} y={12}>
      <span className="h-px w-10 bg-silver/50" aria-hidden />
      <span>{children}</span>
    </FadeIn>
  );
}
