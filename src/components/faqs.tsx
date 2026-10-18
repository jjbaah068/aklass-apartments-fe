import { useId, useMemo, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, EASE } from "./reveal";

type TopicKey = "booking" | "stay" | "rules";

type Faq = { q: string; a: string; topic: TopicKey };

const TOPICS: { key: TopicKey | "all"; label: string }[] = [
  { key: "all", label: "All questions" },
  { key: "booking", label: "Booking & payment" },
  { key: "stay", label: "Your stay" },
];

/* Anything in [SQUARE BRACKETS] still needs the owner's real answer. */
const FAQS: Faq[] = [
  // Booking & payment
  { topic: "booking", q: "What happens if I don't finish paying?", a: "Your dates are held for 30 minutes while you pay. If payment isn't completed in that time, the dates are released and nothing is charged." },
  { topic: "booking", q: "What is the cancellation policy?", a: "[CANCELLATION POLICY — e.g. full refund up to N days before check-in.] The full terms are in our booking terms." },

  // Your stay
  { topic: "stay", q: "What time is check-in and check-out?", a: "Check-in is between 3:00 and 7:00 PM, and check-out is by 11:00 AM. Early check-in or late check-out can be arranged on request, subject to availability." },
  { topic: "stay", q: "When will I get the address?", a: "The full address and arrival instructions are emailed to you once your booking is confirmed. We don't publish the exact address online for guests' privacy and security." },
  { topic: "stay", q: "Will we share the house with anyone?", a: "No. You book the entire house — there are no other paying guests during your stay." },
  { topic: "stay", q: "How many people can stay?", a: "Up to 7 guests. There are 4 private bedrooms (each with a desk), 2 bathrooms and 2 living rooms." },
  { topic: "stay", q: "Is there parking?", a: "Yes, there is designated parking at the house." },
  { topic: "stay", q: "Is there Wi-Fi and somewhere to work?", a: "Yes. There's fast Wi-Fi throughout, a desk in every bedroom and a dining/working area. Wi-Fi details are included in your arrival information." },
];

export default function FAQs() {
  const id = useId();
  const [topic, setTopic] = useState<TopicKey | "all">("all");
  const [openQ, setOpenQ] = useState<string | null>(FAQS[0].q);

  const visible = useMemo(() => FAQS.filter((f) => topic === "all" || f.topic === topic), [topic]);

  function chooseTopic(key: TopicKey | "all") {
    setTopic(key);
    const first = FAQS.find((f) => key === "all" || f.topic === key);
    setOpenQ(first ? first.q : null);
  }

  /* Rich results in Google search */
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.filter((f) => !f.a.includes("[")).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    [],
  );

  return (
    <section aria-labelledby={`${id}-title`} className="bg-page py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Left: heading + help card */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="eyebrow">FAQs</p>
              <h2 id={`${id}-title`} className="mt-2 text-h2 md:text-[46px] md:leading-[1.1]">
                Good to know
              </h2>
              <p className="mt-4 max-w-[26rem] text-body text-ink-muted">
                Everything about booking, arriving and staying at the house. Can't find your answer?
                We're happy to help.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-8 hidden lg:block">
              <HelpCard />
            </Reveal>
          </div>
        </div>

        {/* Right: topics + accordion */}
        <div className="lg:col-span-8">
          <Reveal delay={0.1}>
            <div role="group" aria-label="Filter questions" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {TOPICS.map((t) => {
                const selected = topic === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => chooseTopic(t.key)}
                    className={`relative inline-flex min-h-11 shrink-0 items-center rounded-pill border-[1.5px] px-4 text-small font-semibold transition-colors ${
                      selected ? "border-navy-900 text-white" : "border-slate-300 bg-surface text-navy-900 hover:border-navy-900"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId={`${id}-pill`}
                        className="absolute inset-0 rounded-pill bg-navy-900"
                        transition={{ duration: 0.35, ease: EASE }}
                      />
                    )}
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="border-t border-line-strong">
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((f, i) => {
                  const open = openQ === f.q;
                  const panelId = `${id}-panel-${i}`;
                  const btnId = `${id}-btn-${i}`;
                  return (
                    <motion.li
                      key={f.q}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="border-b border-line-strong"
                    >
                      <h3 className="m-0 font-sans text-[17px] font-semibold md:text-lg">
                        <button
                          id={btnId}
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => setOpenQ(open ? null : f.q)}
                          className="group flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left text-navy-900"
                        >
                          <span className="transition-colors group-hover:text-navy-600">{f.q}</span>
                          <span
                            aria-hidden="true"
                            className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                              open ? "border-navy-900 bg-navy-900 text-gold-200" : "border-slate-300 text-navy-900 group-hover:border-navy-900"
                            }`}
                          >
                            <motion.svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              animate={{ rotate: open ? 45 : 0 }}
                              transition={{ duration: 0.3, ease: EASE }}
                            >
                              <path d="M12 5v14M5 12h14" />
                            </motion.svg>
                          </span>
                        </button>
                      </h3>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            id={panelId}
                            role="region"
                            aria-labelledby={btnId}
                            key="panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <p className="max-w-[42rem] pb-5 pr-12 text-body text-ink-muted">{f.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </Reveal>

          {/* Help card moves under the list on smaller screens */}
          <Reveal className="mt-10 lg:hidden">
            <HelpCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HelpCard() {
  return (
    <div className="on-dark rounded-card bg-navy-900 p-6 text-white">
      <span className="gold-rule mb-4 w-8" aria-hidden="true" />
      <p className="font-display text-[26px] font-semibold leading-tight text-white">Still have a question?</p>
      <p className="mt-2 text-small text-navy-100">
        Message us and we'll get back to you within 24hrs.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/contact" className="btn btn-outline btn-sm">
          Contact us
        </Link>
        {/* <a
          href="https://wa.me/[WHATSAPP_NUMBER]"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm px-2"
        >
          WhatsApp
          <span className="sr-only">(opens in a new tab)</span>
        </a> */}
      </div>
    </div>
  );
}