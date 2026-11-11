"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useMotionPrefs } from "@/components/Providers";

/**
 * Custom cursor: a small dot with a ring that lags behind. The ring grows over links and
 * buttons, and shows a word when the hovered element (or an ancestor) has data-cursor="Ver".
 * Only on devices with a mouse; the native cursor stays visible as well.
 */
export function Cursor() {
  const { reduced } = useMotionPrefs();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"idle" | "link" | "label">("idle");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches && !reduced);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target as Element | null;
      const tagged = t?.closest?.("[data-cursor]") as HTMLElement | null;
      if (tagged) {
        setLabel(tagged.dataset.cursor || "");
        setMode("label");
      } else if (t?.closest?.("a, button, [role=tab], input, textarea, label")) {
        setMode("link");
      } else {
        setMode("idle");
      }
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const size = mode === "label" ? 92 : mode === "link" ? 56 : 30;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]" style={{ opacity: visible ? 1 : 0, transition: "opacity .3s" }}>
      <motion.div className="absolute top-0 left-0" style={{ x: rx, y: ry }}>
        <motion.div
          className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border ${mode === "label" ? "border-transparent bg-day text-night" : "border-day/70 mix-blend-difference"}`}
          animate={{ width: size, height: size }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          {mode === "label" && <span className="label !text-night text-[0.6rem]">{label}</span>}
        </motion.div>
      </motion.div>
      <motion.div className="absolute top-0 left-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-day mix-blend-difference" style={{ x, y, opacity: mode === "label" ? 0 : 1 }} />
    </div>
  );
}
