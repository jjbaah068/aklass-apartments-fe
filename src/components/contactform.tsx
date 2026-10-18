import { useId, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, EASE } from "./reveal";


const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;
const RESPONSE_TIME = "24 hours";

const TOPICS = [
  "Dates & availability",
  "Longer stay (1 week +)",
  "Group or contractor booking",
  "Early check-in / late check-out",
  "Pets",
  "An existing booking",
  "Something else",
];

type Fields = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  message: string;
  consent: boolean;
  company: string; 
};

const EMPTY: Fields = {
  name: "",
  email: "",
  phone: "",
  topic: TOPICS[0],
  checkIn: "",
  checkOut: "",
  guests: "",
  message: "",
  consent: false,
  company: "",
};

type Errors = Partial<Record<keyof Fields, string>>;
type Status = "idle" | "sending" | "sent" | "error";

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter an email address like name@example.com.";
  if (f.phone && !/^[+()\d\s-]{7,20}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number, or leave it blank.";
  if (f.checkIn && f.checkOut && f.checkOut <= f.checkIn) e.checkOut = "Check-out must be after check-in.";
  if (f.message.trim().length < 10) e.message = "Tell us a little more (at least 10 characters).";
  if (!f.consent) e.consent = "Please agree so we can reply to you.";
  return e;
}

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="field-error">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" />
      </svg>
      {children}
    </p>
  );
}

export default function ContactForm() {
  const id = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const showDates = fields.topic === TOPICS[0] || fields.topic === TOPICS[1] || fields.topic === TOPICS[2];

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      document.getElementById(`${id}-${firstBad}`)?.focus();
      return;
    }
    if (fields.company) { setStatus("sent"); return; } 

    setStatus("sending");
    try {
      const { consent, company, ...payload } = fields;
      void consent; void company;
      if (!ENDPOINT) {
        // No backend yet — simulate so the UI can be tested
        await new Promise((r) => setTimeout(r, 900));
      } else {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(String(res.status));
      }
      setStatus("sent");
      setFields(EMPTY);
    } catch {
      setStatus("error");
    }
  }

  const fid = (k: keyof Fields) => `${id}-${k}`;
  const eid = (k: keyof Fields) => `${id}-${k}-err`;
  const aria = (k: keyof Fields) => ({
    id: fid(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? eid(k) : undefined,
  });

  return (
    <section id="contact-form" aria-labelledby={`${id}-title`} className="scroll-mt-28 bg-page py-16 md:py-24">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Left: intro + other ways */}
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Send a message</p>
            <h2 id={`${id}-title`} className="mt-2 text-h2 md:text-[42px] md:leading-[1.1]">
              Tell us about your stay
            </h2>
            <p className="mt-4 text-body text-ink-muted">
              The more you tell us dates, number of guests, anything special the quicker we can
              help. We reply within {RESPONSE_TIME}.
            </p>

            {/* <div className="mt-8 flex flex-col gap-3">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-4 no-underline transition-colors hover:border-navy-300">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-50">
                  <svg viewBox="0 0 24 24" className="amenity-icon size-5" aria-hidden="true">
                    <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.4zM9 8.8c0 3.4 2.8 6.2 6.2 6.2l.9-1.6-1.9-1-1 .9a4.3 4.3 0 0 1-2.5-2.5l.9-1-1-1.9z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-navy-900">Need a quick answer?</span>
                  <span className="block text-[13px] text-ink-subtle">Message us on WhatsApp</span>
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="card flex items-center gap-3 p-4 no-underline transition-colors hover:border-navy-300">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-50">
                  <svg viewBox="0 0 24 24" className="amenity-icon size-5" aria-hidden="true">
                    <path d="M3 5h18v14H3zM3 6l9 7 9-7" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-navy-900">Email us directly</span>
                  <span className="block truncate text-[13px] text-ink-subtle">{EMAIL}</span>
                </span>
              </a>
            </div> */}

            <p className="mt-6 text-small text-ink-subtle">
              Looking for check-in times or house rules?{" "}
              <a href="/#faqs" className="font-semibold">See our FAQs</a>.
            </p>
          </div>
        </Reveal>

        {/* Right: form / success */}
        <Reveal delay={0.1} className="lg:col-span-8">
          <div className="card-overlay p-5 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  role="status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex flex-col items-start gap-4 py-8"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-success-bg">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.2" aria-hidden="true">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  </span>
                  <h3 className="text-h3">Thank you — message sent</h3>
                  <p className="max-w-md text-body text-ink-muted">
                    We've got your message and will reply to your email within {RESPONSE_TIME}. For
                    anything urgent, WhatsApp is the quickest way to reach us.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => setStatus("idle")} className="btn btn-outline">
                      Send another message
                    </button>
                    <Link to="/apartment" className="btn btn-ghost">See the apartment</Link>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="flex flex-col gap-5"
                >
                  {status === "error" && (
                    <div role="alert" className="alert" data-variant="error">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" />
                      </svg>
                      <div>
                        <span className="alert__title">Your message didn't send</span>
                        Please check your connection and try again your details are still here. Or message us on WhatsApp.
                      </div>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="field-group">
                      <label htmlFor={fid("name")} className="field-label">Full name</label>
                      <input {...aria("name")} className="field" autoComplete="name" value={fields.name} onChange={(e) => set("name", e.target.value)} />
                      <ErrorText id={eid("name")}>{errors.name}</ErrorText>
                    </div>
                    <div className="field-group">
                      <label htmlFor={fid("email")} className="field-label">Email</label>
                      <input {...aria("email")} type="email" className="field" autoComplete="email" value={fields.email} onChange={(e) => set("email", e.target.value)} />
                      <ErrorText id={eid("email")}>{errors.email}</ErrorText>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="field-group">
                      <label htmlFor={fid("phone")} className="field-label">
                        Phone <span className="optional">(optional)</span>
                      </label>
                      <input {...aria("phone")} type="tel" className="field" autoComplete="tel" placeholder="+44 7700 900123" value={fields.phone} onChange={(e) => set("phone", e.target.value)} />
                      <ErrorText id={eid("phone")}>{errors.phone}</ErrorText>
                    </div>
                    <div className="field-group">
                      <label htmlFor={fid("topic")} className="field-label">What's it about?</label>
                      <select {...aria("topic")} className="field" value={fields.topic} onChange={(e) => set("topic", e.target.value)}>
                        {TOPICS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <AnimatePresence initial={false}>
                    {showDates && (
                      <motion.fieldset
                        key="dates"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <legend className="sr-only">Your dates (optional)</legend>
                        <div className="grid gap-5 sm:grid-cols-3">
                          <div className="field-group">
                            <label htmlFor={fid("checkIn")} className="field-label">
                              Check-in <span className="optional">(optional)</span>
                            </label>
                            <input {...aria("checkIn")} type="date" className="field" value={fields.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
                          </div>
                          <div className="field-group">
                            <label htmlFor={fid("checkOut")} className="field-label">
                              Check-out <span className="optional">(optional)</span>
                            </label>
                            <input {...aria("checkOut")} type="date" className="field" min={fields.checkIn || undefined} value={fields.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
                            <ErrorText id={eid("checkOut")}>{errors.checkOut}</ErrorText>
                          </div>
                          <div className="field-group">
                            <label htmlFor={fid("guests")} className="field-label">
                              Guests <span className="optional">(optional)</span>
                            </label>
                            <select {...aria("guests")} className="field" value={fields.guests} onChange={(e) => set("guests", e.target.value)}>
                              <option value="">Select</option>
                              {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </motion.fieldset>
                    )}
                  </AnimatePresence>

                  <div className="field-group">
                    <label htmlFor={fid("message")} className="field-label">Your message</label>
                    <textarea
                      {...aria("message")}
                      rows={5}
                      className="field"
                      placeholder="e.g. We're a family of five looking at 3 nights in June — is early check-in possible?"
                      value={fields.message}
                      onChange={(e) => set("message", e.target.value)}
                    />
                    <ErrorText id={eid("message")}>{errors.message}</ErrorText>
                  </div>

                  {/* Honeypot */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor={fid("company")}>Company</label>
                    <input id={fid("company")} tabIndex={-1} autoComplete="off" value={fields.company} onChange={(e) => set("company", e.target.value)} />
                  </div>

                  <div>
                    <label className="check">
                      <input
                        id={fid("consent")}
                        type="checkbox"
                        checked={fields.consent}
                        onChange={(e) => set("consent", e.target.checked)}
                        aria-invalid={errors.consent ? true : undefined}
                        aria-describedby={errors.consent ? eid("consent") : undefined}
                      />
                      <span>
                        I'm happy for Aklass Luxury Stay to use these details to reply to me. See our{" "}
                        <Link to="/privacy">privacy notice</Link>.
                      </span>
                    </label>
                    <ErrorText id={eid("consent")}>{errors.consent}</ErrorText>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
                    <button type="submit" className="btn btn-primary min-w-44" disabled={status === "sending"} aria-busy={status === "sending"}>
                      {status === "sending" ? (
                        <>
                          <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M21 12a9 9 0 1 1-6.2-8.6" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        "Send message"
                      )}
                    </button>
                    <p className="text-[13px] text-ink-subtle">We reply within {RESPONSE_TIME}</p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}