import Image from "next/image";
import type { Vehicle } from "@/content/site";

/** KGM studio cutout with a soft floor light, for placing vehicles on dark or photographic backgrounds. */
export function VehicleCutout({
  vehicle,
  className = "",
  sizes = "60vw",
  priority = false,
  glow = true,
}: {
  vehicle: Vehicle;
  className?: string;
  sizes?: string;
  priority?: boolean;
  glow?: boolean;
}) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${vehicle.width} / ${vehicle.height}` }}>
      {glow && (
        <div
          aria-hidden
          className="absolute inset-x-[-12%] bottom-[-6%] h-[38%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(217,196,176,0.28)_0%,rgba(217,196,176,0.08)_45%,transparent_72%)] blur-md"
        />
      )}
      <Image
        src={vehicle.img.src}
        alt={vehicle.img.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]"
      />
    </div>
  );
}

/** Dark "studio court" tile holding a vehicle cutout — stands in wherever a vehicle photo is needed. */
export function StageTile({ vehicle, className = "", sizes = "40vw", caption }: { vehicle: Vehicle; className?: string; sizes?: string; caption?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_110%,#1c3a54_0%,#142a3d_48%,#0d1e2c_100%)] ${className}`}>
      <svg aria-hidden viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full opacity-[0.16]">
        <g fill="none" stroke="#d9c4b0" strokeWidth="1">
          <ellipse cx="200" cy="318" rx="210" ry="62" />
          <ellipse cx="200" cy="318" rx="80" ry="24" />
          <line x1="0" y1="282" x2="400" y2="282" />
        </g>
      </svg>
      <div className="absolute inset-x-[7%] bottom-[9%]">
        <VehicleCutout vehicle={vehicle} sizes={sizes} />
      </div>
      {caption && <span className="label absolute top-3 left-3 text-[0.55rem] text-bone/80">{caption}</span>}
    </div>
  );
}

/** Three-vehicle line-up: hero model in front, two flanking models set back in the shadows. */
export function Lineup({ left, center, right, dimSides = true, priority = false }: { left: Vehicle; center: Vehicle; right: Vehicle; dimSides?: boolean; priority?: boolean }) {
  const side = dimSides ? "brightness-[0.5] saturate-[0.8]" : "brightness-[0.85]";
  return (
    <div className="relative flex items-end justify-center">
      <div className={`relative z-0 -mr-[9%] hidden w-[31%] translate-y-[-6%] md:block ${side}`}>
        <VehicleCutout vehicle={left} sizes="26vw" glow={false} />
      </div>
      <div className="relative z-10 w-full md:w-[46%]">
        <VehicleCutout vehicle={center} sizes="(min-width: 768px) 40vw, 92vw" priority={priority} />
      </div>
      <div className={`relative z-0 -ml-[9%] hidden w-[31%] translate-y-[-6%] md:block ${side}`}>
        <VehicleCutout vehicle={right} sizes="26vw" glow={false} />
      </div>
    </div>
  );
}
