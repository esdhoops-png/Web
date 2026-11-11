"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { contact, contactSection, credits } from "@/content/site";
import { useMotionPrefs } from "@/components/Providers";
import { FadeIn, SectionLabel } from "@/components/ui/Motion";
import { Magnetic, Stagger, StaggerItem } from "@/components/ui/Fx";
import { EsdMark, KgmWordmark } from "@/components/ui/Logos";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Headline built letter by letter from a mask. The observer sits on the (unclipped) element itself. */
function Headline({
  text,
  as = "h2",
  className = "",
  stagger = 0.026,
  delay = 0,
  amount,
}: {
  text: string;
  as?: "h2" | "p";
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
}) {
  const M = motion[as];
  const { reduced } = useMotionPrefs();
  const words = text.split(" ");
  return (
    <M
      className={className}
      aria-label={text}
      key={reduced ? "still" : "motion"}
      initial={reduced ? "show" : "hidden"}
      whileInView="show"
      viewport={amount ? { once: true, amount } : { once: true, margin: "0px 0px -12% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top whitespace-nowrap [margin-bottom:-0.04em]">
          {Array.from(w).map((c, ci) => (
            <motion.span
              key={ci}
              className="inline-block origin-bottom-left will-change-transform"
              variants={{
                hidden: { y: "115%", rotate: 9, opacity: 0 },
                show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.1, ease: EASE, opacity: { duration: 0.4 } } },
              }}
            >
              {c}
            </motion.span>
          ))}
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </M>
  );
}

/**
 * The two marks assembling for the last frame: the ESD letters drop into place one by one,
 * the ball draws its own seams, the cross turns in and K · G · M rise from a mask.
 * (Same vector data as ui/Logos, split into parts so each can move.)
 */
function AssemblingLockup({ size = 72 }: { size?: number }) {
  const { reduced } = useMotionPrefs();
  const letter = (i: number) => ({
    hidden: { opacity: 0, y: -90 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT, delay: 0.1 + i * 0.12 } },
  });
  const seam = (i: number) => ({
    hidden: { pathLength: 0, opacity: 0 },
    show: { pathLength: 1, opacity: 1, transition: { duration: 1.3, ease: EASE, delay: 0.45 + i * 0.1, opacity: { duration: 0.01, delay: 0.45 + i * 0.1 } } },
  });
  const kgm = (i: number) => ({
    hidden: { y: 175 },
    show: { y: 0, transition: { duration: 1, ease: EASE, delay: 0.95 + i * 0.11 } },
  });
  return (
    <motion.div
      className="flex items-center"
      style={{ gap: size * 0.42 }}
      key={reduced ? "still" : "motion"}
      initial={reduced ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      variants={{ hidden: {}, show: {} }}
    >
      <span className="block shrink-0 text-tan" style={{ height: size, width: size * 0.675 }}>
        <svg viewBox="290 150 520 770" className="h-full w-full overflow-visible" role="img" aria-label="ESD HOOPS">
          <g fill="currentColor">
            <motion.path variants={letter(0)} d="M305,160 L448,250 V334 L398,304 V282 L356,256 V322 L432,372 L394,404 L356,380 V494 H398 V449 L448,415 V548 H305 Z" />
            <motion.path variants={letter(1)} d="M481,255 L622,160 V326 L573,305 V257 L530,285 V336 L622,372 V548 H481 V418 L530,439 V494 H573 V407 L481,372 Z" />
            <motion.path variants={letter(2)} fillRule="evenodd" d="M657,160 L795,303 L797,548 H657 Z M708,290 L748,326 V495 H708 Z" />
          </g>
          <g fill="none" stroke="currentColor" strokeWidth={25}>
            <motion.path variants={seam(0)} strokeLinejoin="round" d="M318,592 H784 V598 Q776,822 551,902 Q326,822 318,598 Z" />
            <motion.path variants={seam(1)} d="M551,592 V902" />
            <motion.path variants={seam(2)} d="M376,744 Q470,640 551,670 Q632,640 726,744" />
            <motion.path variants={seam(3)} d="M463,592 Q500,645 489,690 Q476,760 432,812" />
            <motion.path variants={seam(4)} d="M639,592 Q602,645 613,690 Q626,760 670,812" />
          </g>
        </svg>
      </span>
      <motion.span
        aria-hidden
        className="font-serif text-silver"
        style={{ fontSize: size * 0.6, lineHeight: 1 }}
        variants={{
          hidden: { opacity: 0, rotate: -90, scale: 0.4 },
          show: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.9, ease: EASE, delay: 0.8 } },
        }}
      >
        ×
      </motion.span>
      <span className="block shrink-0 overflow-hidden" style={{ height: size * 0.34, width: size * 0.34 * 5.93 }}>
        <svg viewBox="48 168 961 162" className="h-full w-full" role="img" aria-label="KGM">
          <g fill="currentColor">
            <motion.path variants={kgm(0)} d="M50,170 H128 V230 H160 Q172,230 182,224 L268,174 Q273,171 280,171 H365 L254,243 L226,235 L365,328 H280 Q273,328 268,325 L182,274 Q172,268 160,268 H128 V328 H50 Z" />
            <motion.path variants={kgm(1)} d="M405,170 H630 Q672,170 672,205 V215 H592 V205 Q592,197 582,197 H452 Q440,197 440,209 V288 Q440,300 452,300 H582 Q592,300 592,290 V268 H515 L480,240 V237 H658 Q672,237 672,250 V285 Q672,328 628,328 H405 Q362,328 362,285 V213 Q362,170 405,170 Z" />
            <motion.path variants={kgm(2)} d="M702,170 H798 L878,250 L862,222 L912,170 H1007 V328 H930 V215 L882,272 H830 L780,215 V328 H702 Z" />
          </g>
        </svg>
      </span>
    </motion.div>
  );
}

const fieldBox =
  "group relative border-b hairline pt-6 pb-2 [html[data-theme=sand]_&]:border-bone/30";
const fieldLabel =
  "label pointer-events-none absolute top-8 left-0 origin-left transition-[transform,color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] peer-focus:-translate-y-7 peer-focus:scale-[0.86] peer-focus:text-bone peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-[0.86]";

/** Underline that draws itself across the field while it has focus. */
function FocusLine() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-px block h-px origin-right scale-x-0 bg-bone transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-focus-within:origin-left group-focus-within:scale-x-100"
    />
  );
}

type Status = "idle" | "sending" | "sent" | "error" | "not-configured";

const fields = [
  { name: "name", label: "Nombre", type: "text", autoComplete: "name", required: true },
  { name: "company", label: "Empresa", type: "text", autoComplete: "organization", required: false },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
] as const;

function Field({ name, label, type, autoComplete, required }: (typeof fields)[number]) {
  return (
    <div className={fieldBox}>
      <input
        id={`f-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder=" "
        className="peer w-full bg-transparent pt-3 pb-1 text-lg text-bone outline-none"
      />
      <label
        htmlFor={`f-${name}`}
        className={fieldLabel}
      >
        {label}
        {required ? "" : " (opcional)"}
      </label>
      <FocusLine />
    </div>
  );
}

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const { reduced } = useMotionPrefs();
  // The last frame: the sign-off pushes in as the page reaches its end.
  const signRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: signRaw } = useScroll({ target: signRef, offset: ["start end", "center 0.62"] });
  const sign = useSpring(signRaw, { stiffness: 90, damping: 24, mass: 0.6 });
  const signScale = useTransform(sign, [0, 1], [0.86, 1]);
  const glow = useTransform(sign, [0.2, 1], [0, 1]);
  const endpoint = contact.formEndpoint;
  const details = [
    contact.email && { k: "Email", v: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { k: "Phone", v: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    contact.website && { k: "Web", v: contact.website.replace(/^https?:\/\//, ""), href: contact.website },
    contact.instagram && { k: "Instagram", v: contact.instagram, href: `https://instagram.com/${contact.instagram.replace("@", "")}` },
    contact.location && { k: "Location", v: contact.location },
  ].filter(Boolean) as { k: string; v: string; href?: string }[];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._gotcha) return; // honeypot
    if (!endpoint) {
      setStatus("not-configured");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, _subject: "ESD HOOPS × KGM — Consulta sobre la colaboración" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const messages: Partial<Record<Status, { tone: "ok" | "warn"; text: string }>> = {
    sent: { tone: "ok", text: "Gracias, tu mensaje se ha enviado. Te responderemos pronto." },
    error: { tone: "warn", text: "No se ha podido enviar el mensaje. Inténtalo de nuevo en unos minutos." },
    "not-configured": {
      tone: "warn",
      text: contact.email
        ? `Este formulario aún no está conectado, así que tu mensaje no se ha enviado. Escríbenos a ${contact.email}.`
        : "Este formulario aún no está conectado a un servicio de envío, así que tu mensaje no se ha enviado.",
    },
  };
  const msg = messages[status];

  return (
    <section id="contact" className="relative bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-28 md:px-10 md:py-40">
        <SectionLabel>{contactSection.label}</SectionLabel>
        <div className="mt-8 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <Headline text={contactSection.title} className="display text-[clamp(3.2rem,7.5vw,7rem)] text-bone" />
            <FadeIn as="p" className="label mt-8 text-bone" delay={0.3}>
              {contactSection.subtitle}
            </FadeIn>
            {details.length > 0 && (
              <motion.dl
                className="mt-12 max-w-md"
                key={reduced ? "still" : "motion"}
                initial={reduced ? "show" : "hidden"}
                whileInView="show"
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
              >
                {details.map((d) => (
                  <motion.div
                    key={d.k}
                    className="relative flex justify-between gap-6 py-4"
                    variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
                  >
                    <motion.span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 block h-px origin-left bg-bone/15 [html[data-theme=sand]_&]:bg-bone/25"
                      variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.3, ease: EASE } } }}
                    />
                    <dt className="label">{d.k}</dt>
                    <dd className="text-bone">
                      {d.href ? (
                        <a className="link-line" href={d.href} target={d.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                          {d.v}
                        </a>
                      ) : (
                        d.v
                      )}
                    </dd>
                  </motion.div>
                ))}
              </motion.dl>
            )}
          </div>

          <Stagger className="md:col-span-6" gap={0.11}>
            <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate={false} aria-describedby="form-status">
              {fields.map((f) => (
                <StaggerItem key={f.name}>
                  <Field {...f} />
                </StaggerItem>
              ))}
              <StaggerItem>
                <div className={fieldBox}>
                  <textarea
                    id="f-message"
                    name="message"
                    required
                    rows={5}
                    placeholder=" "
                    className="peer mt-3 block w-full resize-none bg-transparent pt-1 text-lg text-bone outline-none"
                  />
                  <label htmlFor="f-message" className={fieldLabel}>
                    Mensaje
                  </label>
                  <FocusLine />
                </div>
              </StaggerItem>
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              <StaggerItem className="mt-10 flex flex-wrap items-center justify-between gap-6">
                <Magnetic strength={0.3}>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group relative inline-flex items-center gap-5 overflow-hidden rounded-full border border-bone/30 [html[data-theme=sand]_&]:border-bone/50 py-4 pr-4 pl-8 text-bone transition-[border-color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:border-signal active:scale-[0.97] [html[data-theme=sand]_&]:hover:border-signal disabled:opacity-60"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" aria-hidden />
                  <span className="label relative text-bone [html[data-theme=sand]_&]:transition-colors [html[data-theme=sand]_&]:duration-500 [html[data-theme=sand]_&]:group-hover:text-day">{status === "sending" ? "Enviando…" : contactSection.cta}</span>
                  <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-bone text-ink transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:translate-x-[220%]">
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="absolute -translate-x-[220%] transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:translate-x-0">
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </span>
                </button>
                </Magnetic>
              </StaggerItem>
              <div id="form-status" aria-live="polite" className="min-h-[3rem]">
                <AnimatePresence>
                  {msg && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-4 border-l-2 pl-4 text-sm ${msg.tone === "ok" ? "border-bone text-bone" : "border-signal text-silver"}`}
                    >
                      {msg.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </Stagger>
        </div>
      </div>

      {/* Sign-off */}
      <footer className="relative overflow-hidden border-t hairline [html[data-theme=sand]_&]:border-bone/20">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
          <div ref={signRef} className="relative flex flex-col items-center text-center text-bone">
            {/* a low light behind the last line, breathing */}
            <motion.div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 h-[70%] w-[min(90vw,900px)] -translate-x-1/2 -translate-y-1/3" style={reduced ? { opacity: 1 } : { opacity: glow }}>
              <motion.div
                className="h-full w-full rounded-[50%] bg-signal/15 blur-3xl"
                animate={reduced ? undefined : { opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              />
            </motion.div>
            <div className="relative origin-bottom md:mb-4 md:scale-[1.3]">
              <AssemblingLockup size={72} />
            </div>
            <motion.div className="relative mt-12 w-full origin-top will-change-transform" style={reduced ? { scale: 1 } : { scale: signScale }}>
              <Headline text={contactSection.signoff} as="p" amount={0.5} stagger={0.045} delay={0.9} className="display text-[clamp(2.8rem,8.6vw,8.25rem)] text-bone" />
            </motion.div>
            <motion.div
              aria-hidden
              className="relative mt-10 flex w-full max-w-xl items-center gap-4 md:mt-14"
              key={reduced ? "still" : "motion"}
              initial={reduced ? "show" : "hidden"}
              whileInView="show"
              viewport={{ once: true }}
              variants={{ hidden: {}, show: {} }}
            >
              <motion.span className="block h-px flex-1 origin-right bg-bone/25" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.6, ease: EASE, delay: 1.6 } } }} />
              <motion.span className="block h-1.5 w-1.5 rounded-full bg-signal" variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { duration: 0.7, ease: EASE, delay: 1.5 } } }} />
              <motion.span className="block h-px flex-1 origin-left bg-bone/25" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.6, ease: EASE, delay: 1.6 } } }} />
            </motion.div>
          </div>

          <div className="mt-24 grid gap-10 border-t hairline [html[data-theme=sand]_&]:border-bone/20 pt-10 text-xs leading-relaxed text-silver/70 [html[data-theme=sand]_&]:text-silver md:grid-cols-12">
            <FadeIn className="md:col-span-5" y={16}>
              <div className="flex items-center gap-4 text-silver">
                <span className="block h-8 w-[22px]"><EsdMark className="h-full w-full" /></span>
                <span className="block h-[11px] w-[66px]"><KgmWordmark className="h-full w-full" /></span>
              </div>
              <p className="mt-6">
                Esta web es una propuesta de colaboración preparada por ESD HOOPS. Los conceptos creativos, las activaciones y los montajes son
                propuestas para debatir y no representan eventos, campañas ni acuerdos existentes entre ESD HOOPS y KGM. KGM y el logotipo de KGM
                son marcas de KG Mobility Corp. y se muestran únicamente para esta propuesta.
              </p>
            </FadeIn>
            <FadeIn className="md:col-span-7" y={16} delay={0.12}>
              <p className="label text-[0.6rem]">Créditos de imagen</p>
              <ul className="mt-4 grid gap-1">
                {credits.map((c) =>
                  c.url ? (
                    <li key={c.label}>
                      {c.label}: foto de {c.author},{" "}
                      <a className="underline decoration-silver/30 underline-offset-2 hover:text-bone" href={c.url} target="_blank" rel="noreferrer">
                        Wikimedia Commons
                      </a>
                      , {c.license} (recortada y con etalonaje).
                    </li>
                  ) : (
                    <li key={c.label}>
                      {c.label}: {c.license}.
                    </li>
                  ),
                )}
                <li>Fotografía de torneos y entrenamientos © ESD HOOPS.</li>
                <li>
                  Fotografía de pista nocturna y detalles:{" "}
                  <a className="underline decoration-silver/30 underline-offset-2 hover:text-bone" href="https://unsplash.com/license" target="_blank" rel="noreferrer">
                    licencia Unsplash
                  </a>
                  .
                </li>
              </ul>
              <p className="mt-6">© {new Date().getFullYear()} ESD HOOPS. Propuesta de colaboración estratégica.</p>
            </FadeIn>
          </div>
        </div>
      </footer>
    </section>
  );
}
