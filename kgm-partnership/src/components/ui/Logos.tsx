type LogoProps = { className?: string; title?: string };

/** ESD HOOPS crest (vectorised from the official logo). Uses currentColor. */
export function EsdMark({ className, title = "ESD HOOPS" }: LogoProps) {
  return (
    <svg viewBox="290 150 520 770" className={className} role="img" aria-label={title}>
      <g fill="currentColor">
        <path d="M305,160 L448,250 V334 L398,304 V282 L356,256 V322 L432,372 L394,404 L356,380 V494 H398 V449 L448,415 V548 H305 Z" />
        <path d="M481,255 L622,160 V326 L573,305 V257 L530,285 V336 L622,372 V548 H481 V418 L530,439 V494 H573 V407 L481,372 Z" />
        <path fillRule="evenodd" d="M657,160 L795,303 L797,548 H657 Z M708,290 L748,326 V495 H708 Z" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth={25}>
        <path strokeLinejoin="round" d="M318,592 H784 V598 Q776,822 551,902 Q326,822 318,598 Z" />
        <path d="M551,592 V902" />
        <path d="M376,744 Q470,640 551,670 Q632,640 726,744" />
        <path d="M463,592 Q500,645 489,690 Q476,760 432,812" />
        <path d="M639,592 Q602,645 613,690 Q626,760 670,812" />
      </g>
    </svg>
  );
}

/** KGM wordmark (vectorised from the official logo). Uses currentColor. */
export function KgmWordmark({ className, title = "KGM" }: LogoProps) {
  return (
    <svg viewBox="48 168 961 162" className={className} role="img" aria-label={title}>
      <g fill="currentColor">
        <path d="M50,170 H128 V230 H160 Q172,230 182,224 L268,174 Q273,171 280,171 H365 L254,243 L226,235 L365,328 H280 Q273,328 268,325 L182,274 Q172,268 160,268 H128 V328 H50 Z" />
        <path d="M405,170 H630 Q672,170 672,205 V215 H592 V205 Q592,197 582,197 H452 Q440,197 440,209 V288 Q440,300 452,300 H582 Q592,300 592,290 V268 H515 L480,240 V237 H658 Q672,237 672,250 V285 Q672,328 628,328 H405 Q362,328 362,285 V213 Q362,170 405,170 Z" />
        <path d="M702,170 H798 L878,250 L862,222 L912,170 H1007 V328 H930 V215 L882,272 H830 L780,215 V328 H702 Z" />
      </g>
    </svg>
  );
}

/** Side-by-side lockup: ESD HOOPS crest × KGM wordmark. `size` sets the crest height in px. */
export function Lockup({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center ${className}`} style={{ gap: size * 0.42 }}>
      <span className="block shrink-0" style={{ height: size, width: size * 0.675 }}>
        <EsdMark className="h-full w-full" />
      </span>
      <span aria-hidden className="font-serif text-silver" style={{ fontSize: size * 0.6, lineHeight: 1 }}>
        ×
      </span>
      <span className="block shrink-0" style={{ height: size * 0.34, width: size * 0.34 * 5.93 }}>
        <KgmWordmark className="h-full w-full" />
      </span>
    </div>
  );
}
