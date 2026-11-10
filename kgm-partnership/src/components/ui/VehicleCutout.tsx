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
