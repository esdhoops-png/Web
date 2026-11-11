import { Lockup } from "@/components/ui/Logos";

/**
 * Opening sequence: a counter runs to 100 under both logos, then the screen splits
 * in two shutters. Pure CSS (see globals.css) so it never depends on scripts.
 */
export function Intro() {
  return (
    <div aria-hidden className="intro pointer-events-none fixed inset-0 z-[70] text-bone">
      <div className="intro-half intro-top absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div className="intro-half intro-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="intro-core absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-8">
          <div className="intro-logo">
            <Lockup size={64} />
          </div>
          <div className="flex w-56 items-center gap-4">
            <span className="intro-bar relative h-px flex-1 overflow-hidden bg-bone/15" />
            <span className="intro-count label w-8 text-right tabular-nums text-bone" />
          </div>
        </div>
      </div>
    </div>
  );
}
