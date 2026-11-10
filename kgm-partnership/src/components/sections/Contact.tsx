"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { contact, contactSection, credits } from "@/content/site";
import { FadeIn, SectionLabel, WordsReveal } from "@/components/ui/Motion";
import { EsdMark, KgmWordmark, Lockup } from "@/components/ui/Logos";

type Status = "idle" | "sending" | "sent" | "error" | "not-configured";

const fields = [
  { name: "name", label: "Name", type: "text", autoComplete: "name", required: true },
  { name: "company", label: "Company", type: "text", autoComplete: "organization", required: false },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
] as const;

function Field({ name, label, type, autoComplete, required }: (typeof fields)[number]) {
  return (
    <div className="group relative border-b hairline pt-6 pb-2 focus-within:border-bone">
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
        className="label pointer-events-none absolute top-8 left-0 origin-left transition-all duration-300 peer-focus:top-1 peer-focus:text-[0.6rem] peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[0.6rem]"
      >
        {label}
        {required ? "" : " (optional)"}
      </label>
    </div>
  );
}

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
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
        body: JSON.stringify({ ...data, _subject: "ESD HOOPS × KGM — Partnership enquiry" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const messages: Partial<Record<Status, { tone: "ok" | "warn"; text: string }>> = {
    sent: { tone: "ok", text: "Thank you — your message has been sent. We'll be in touch soon." },
    error: { tone: "warn", text: "Your message could not be sent. Please try again in a moment." },
    "not-configured": {
      tone: "warn",
      text: "This form is not connected to a delivery service yet, so your message has not been sent.",
    },
  };
  const msg = messages[status];

  return (
    <section id="contact" className="relative bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-28 md:px-10 md:py-40">
        <SectionLabel>{contactSection.label}</SectionLabel>
        <div className="mt-8 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <WordsReveal text={contactSection.title} className="display text-[clamp(3.2rem,7.5vw,7rem)] text-bone" />
            <FadeIn as="p" className="label mt-8 text-bone">
              {contactSection.subtitle}
            </FadeIn>
            {details.length > 0 && (
              <dl className="mt-12 max-w-md">
                {details.map((d) => (
                  <div key={d.k} className="flex justify-between gap-6 border-b hairline py-4">
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
                  </div>
                ))}
              </dl>
            )}
          </div>

          <FadeIn className="md:col-span-6">
            <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate={false} aria-describedby="form-status">
              {fields.map((f) => (
                <Field key={f.name} {...f} />
              ))}
              <div className="relative border-b hairline pt-6 pb-2 focus-within:border-bone">
                <label htmlFor="f-message" className="label">
                  Message
                </label>
                <textarea id="f-message" name="message" required rows={5} className="mt-3 w-full resize-none bg-transparent text-lg text-bone outline-none" />
              </div>
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group relative inline-flex items-center gap-5 overflow-hidden rounded-full border border-bone/30 py-4 pr-4 pl-8 text-bone transition-colors duration-500 hover:border-signal disabled:opacity-60"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" aria-hidden />
                  <span className="label relative text-bone">{status === "sending" ? "Sending…" : contactSection.cta}</span>
                  <span className="relative grid h-10 w-10 place-items-center rounded-full bg-bone text-ink transition-transform duration-500 group-hover:translate-x-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </span>
                </button>
              </div>
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
          </FadeIn>
        </div>
      </div>

      {/* Sign-off */}
      <footer className="border-t hairline">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
          <div className="flex flex-col items-center text-center text-bone">
            <FadeIn>
              <Lockup size={72} />
            </FadeIn>
            <WordsReveal text={contactSection.signoff} as="p" className="display mt-12 text-[clamp(2.6rem,7vw,6.5rem)] text-bone" />
          </div>

          <div className="mt-24 grid gap-10 border-t hairline pt-10 text-xs leading-relaxed text-silver/70 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-4 text-silver">
                <span className="block h-8 w-[22px]"><EsdMark className="h-full w-full" /></span>
                <span className="block h-[11px] w-[66px]"><KgmWordmark className="h-full w-full" /></span>
              </div>
              <p className="mt-6">
                This website is a partnership proposal prepared by ESD HOOPS. Creative concepts, activations and visuals are proposals for discussion
                and do not represent existing events, campaigns or agreements between ESD HOOPS and KGM. KGM and the KGM logo are trademarks of
                KG Mobility Corp., shown here for the purpose of this proposal.
              </p>
            </div>
            <div className="md:col-span-7">
              <p className="label text-[0.6rem]">Image credits</p>
              <ul className="mt-4 grid gap-1">
                {credits.map((c) => (
                  <li key={c.url}>
                    {c.label} — photo by {c.author},{" "}
                    <a className="underline decoration-silver/30 underline-offset-2 hover:text-bone" href={c.url} target="_blank" rel="noreferrer">
                      Wikimedia Commons
                    </a>
                    , {c.license} (cropped and colour graded).
                  </li>
                ))}
                <li>Tournament photography © ESD HOOPS (latest ESD HOOPS 3x3 tournament).</li>
                <li>
                  Training, night court and detail photography —{" "}
                  <a className="underline decoration-silver/30 underline-offset-2 hover:text-bone" href="https://unsplash.com/license" target="_blank" rel="noreferrer">
                    Unsplash License
                  </a>
                  .
                </li>
              </ul>
              <p className="mt-6">© {new Date().getFullYear()} ESD HOOPS. Strategic Partnership Proposal.</p>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
