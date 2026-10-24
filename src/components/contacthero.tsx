import { useId } from "react";
import { motion } from "motion/react";
import { EASE, fadeUp, stagger } from "./reveal";
import contactImg from "../assets/images/contacthero.webp";

/* Fill in before going live */
const EMAIL = "aklassdynamic@gmail.com";
const WHATSAPP_URL = "https://wa.me/447947377995";
const INSTAGRAM_URL = "https://www.instagram.com/aklassluxurystay";

/* The photo's studio background colour — the whole hero uses it so the photo blends in */
const PHOTO_BG = "#e2e2e2";

const QUICK = [
  {
    label: "WhatsApp",
    hint: "Fastest reply",
    href: WHATSAPP_URL,
    external: true,
    d: "M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.4zM9 8.8c0 3.4 2.8 6.2 6.2 6.2l.9-1.6-1.9-1-1 .9a4.3 4.3 0 0 1-2.5-2.5l.9-1-1-1.9z",
  },
  {
    label: "Email",
    hint: EMAIL,
    href: `mailto:${EMAIL}`,
    external: false,
    d: "M3 5h18v14H3zM3 6l9 7 9-7",
  },
  {
    label: "Instagram",
    hint: "@aklassluxurystay",
    href: INSTAGRAM_URL,
    external: true,
    d: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17.5 6.5h.01",
  },
];

export default function ContactHero() {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-title`} className="overflow-hidden" style={{ backgroundColor: PHOTO_BG }}>
      <div className="container-site grid lg:grid-cols-12 lg:gap-10">
        {/* Photo — no frame; sits on the bottom edge and melts into the background */}
        <motion.div
          className="order-2 hidden lg:flex items-end justify-center lg:order-1 lg:col-span-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <img
            src={contactImg}
            alt="Smiling woman pointing towards the contact details"
            fetchPriority="high"
            decoding="async"
            className="block h-[340px] w-full object-cover object-[30%_bottom] sm:h-[420px] lg:h-[min(72vh,600px)]"
          />
        </motion.div>

        {/* Text */}
        <motion.div
          className="order-1 py-10 sm:py-14 lg:order-2 lg:col-span-6 lg:self-center lg:py-20"
          initial="hidden"
          animate="show"
          variants={stagger(0.09, 0.15)}
        >
          <motion.p variants={fadeUp} className="eyebrow">Contact us</motion.p>

          <motion.h1 variants={fadeUp} id={`${id}-title`} className="text-display-hero mt-3 text-navy-900">
            We're here to help
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-4 max-w-[32rem] text-body-lg text-slate-800">
            Questions about dates, longer stays, group bookings or arriving early? Send us a
            message and we'll get back to you personally.
          </motion.p>

          {/* Quick contact options */}
          <motion.ul variants={stagger(0.07)} className="mt-8 grid gap-3 sm:grid-cols-3">
            {QUICK.map((q) => (
              <motion.li key={q.label} variants={fadeUp}>
                <a
                  href={q.href}
                  {...(q.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full flex-col gap-3 rounded-card bg-white p-4 no-underline shadow-raised transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-overlay"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-navy-900 transition-colors group-hover:bg-gold-400">
                    <svg viewBox="0 0 24 24" className="amenity-icon size-5 text-gold-200 transition-colors group-hover:text-navy-950" aria-hidden="true">
                      <path d={q.d} />
                    </svg>
                  </span>
                  <span>
                    <span className="block font-semibold text-navy-900">{q.label}</span>
                    <span className="block truncate text-[13px] text-slate-700">{q.hint}</span>
                  </span>
                  {q.external && <span className="sr-only">(opens in a new tab)</span>}
                </a>
              </motion.li>
            ))}
          </motion.ul>

          <motion.p variants={fadeUp} className="mt-6 text-small text-slate-700">
            Prefer to write it all down?{" "}
            <a href="#contact-form" className="font-semibold text-navy-900">
              Use the form below
            </a>
            .
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}