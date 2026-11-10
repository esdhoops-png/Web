import { Lockup } from "@/components/ui/Logos";

/** Opening curtain with both logos. Pure CSS: it lifts on its own after a beat. */
export function Intro() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-ink text-bone"
      style={{ animation: "intro-out 0.9s cubic-bezier(.76,0,.24,1) 1.25s forwards" }}
    >
      <div style={{ animation: "intro-logo 1.5s ease both" }}>
        <Lockup size={64} />
      </div>
    </div>
  );
}
