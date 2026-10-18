import { useId } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Reveal, RevealGroup, RevealItem, EASE } from "./reveal";
import exterior from "../assets/images/image1.webp"; 

const WHATSAPP_URL = "https://wa.me/447947377995";

const FACTS = [
  { label: "Check-in 3:00–7:00 PM", d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2" },
  { label: "Up to 7 guests", d: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { label: "Secure online payment", d: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" },
];

export default function ReadyToStay() {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-title`} className="container-site pb-20 md:pb-28">
      <Reveal>
        <div className="grid overflow-hidden rounded-card bg-navy-900 text-white shadow-overlay md:grid-cols-[1fr_1.1fr]">
          {/* Photo */}
          <div className="relative min-h-[240px] overflow-hidden md:min-h-[420px]">
            <motion.img
              src={exterior}
              alt="Front of the house with private driveway parking"
              loading="lazy"
              decoding="async"
              initial={{ scale: 1.08 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.4, ease: EASE }}
              className="absolute inset-0 size-full object-cover"
            />
            {/* Soft fade into the navy panel */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-navy-900/70 to-transparent md:bg-linear-to-r md:from-transparent md:via-transparent md:to-navy-900/60"
            />
          </div>

          {/* Content */}
          <div className="on-dark flex flex-col justify-center p-7 sm:p-10 md:p-12">
            <p className="eyebrow">Ready to stay?</p>
            <h2
              id={`${id}-title`}
              className="mt-3 font-display text-[34px] font-semibold leading-[1.1] text-white md:text-[44px]"
            >
              The whole house is waiting for you
            </h2>
            <p className="mt-4 max-w-md text-body text-navy-100">
              Pick your dates and see the full price straight away or message us first if you
              have a question about your stay.
            </p>

            <RevealGroup step={0.08} className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {FACTS.map((f) => (
                <RevealItem key={f.label} className="flex items-center gap-2 text-small font-medium text-navy-50">
                  <svg viewBox="0 0 24 24" className="amenity-icon size-5" aria-hidden="true"><path d={f.d} /></svg>
                  {f.label}
                </RevealItem>
              ))}
            </RevealGroup>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book" className="btn bg-white text-navy-950 hover:bg-navy-50 hover:text-navy-950">
                Check availability
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Message us on WhatsApp
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}