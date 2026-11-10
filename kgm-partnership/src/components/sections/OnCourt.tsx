import Image from "next/image";
import { onCourt, type Img } from "@/content/site";

function Row({ items, reverse = false }: { items: Img[]; reverse?: boolean }) {
  // The list is rendered twice so the loop is seamless.
  return (
    <div className="group flex overflow-hidden">
      <ul
        className="flex shrink-0 gap-3 pr-3 group-hover:[animation-play-state:paused] md:gap-4 md:pr-4"
        style={{ animation: `marquee ${reverse ? 70 : 60}s linear infinite`, animationDirection: reverse ? "reverse" : "normal", width: "max-content" }}
      >
        {[...items, ...items].map((img, i) => (
          <li key={i} aria-hidden={i >= items.length} className={`relative h-[38vw] max-h-[340px] min-h-[180px] shrink-0 overflow-hidden ${i % 3 === 1 ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
            <Image src={img.src} alt={i < items.length ? img.alt : ""} fill sizes="(min-width: 768px) 30vw, 60vw" className="cine-img object-cover" style={{ objectPosition: img.position }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Moving strip of real ESD HOOPS tournament and training photography. */
export function OnCourt() {
  return (
    <section aria-labelledby="oncourt-title" className="relative overflow-hidden bg-ink py-20 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 md:px-10">
        <div>
          <span className="label flex items-center gap-4">
            <span className="h-px w-10 bg-silver/50" aria-hidden />
            {onCourt.label}
          </span>
          <h2 id="oncourt-title" className="display mt-6 text-[clamp(2.4rem,5.4vw,5rem)] text-bone">
            {onCourt.title}
          </h2>
        </div>
        <p className="label normal-case tracking-[0.12em]">{onCourt.note}</p>
      </div>
      <div className="mt-12 flex flex-col gap-3 md:mt-16 md:gap-4">
        <Row items={onCourt.rowA} />
        <Row items={onCourt.rowB} reverse />
      </div>
    </section>
  );
}
