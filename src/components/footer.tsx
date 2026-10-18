import type { ReactNode } from "react";
import { Link } from "react-router";
import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { Reveal, RevealGroup, RevealItem, EASE } from "./reveal";
import logo from '../assets/images/logo.webp'

const LOGO_SRC = logo;

/* Fill in before going live */
const CONTACT = {
    email: "[EMAIL ADDRESS]",
};

/* Social links — leave `url` empty ("") to hide a platform */
type Social = { name: string; url: string; icon: ReactNode };

const SOCIALS: Social[] = [
    {
        name: "Instagram",
        url: "https://www.instagram.com/aklassluxurystay",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <path d="M17.5 6.5h.01" />
            </svg>
        ),
    },
    {
        name: "Facebook",
        url: "https://www.facebook.com/profile.php?id=61594691224067",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.1 15.6 2 14.4 2 11.9 2 10.2 3.5 10.2 6.3v2.2H7.5V12h2.7v10H14V12h2.8l.4-3.5H14z" />
            </svg>
        ),
    },
    {
        name: "TikTok",
        url: "https://www.tiktok.com/@aklassluxurystay4",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d="M16.6 2c.4 2.4 1.9 4 4.4 4.2v3.4c-1.5 0-2.9-.4-4.3-1.2v6.5a6.3 6.3 0 1 1-6.3-6.3c.3 0 .6 0 .9.1v3.5a2.9 2.9 0 1 0 2 2.7V2h3.3z" />
            </svg>
        ),
    },
    {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/aklass-luxury-stay-47216143a?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3.5 9h3v12h-3zM14.5 9c-1.6 0-2.8.9-3.3 2.1V9h-3v12h3v-6c0-1 .8-1.8 1.8-1.8s1.7.8 1.7 1.8v6h3v-6c0-2-1.7-3.7-3.7-3.7z" />
            </svg>
        ),
    },
    // {
    //     name: "WhatsApp",
    //     url: "https://wa.me/[WHATSAPP_NUMBER]",
    //     icon: (
    //         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
    //             <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.4z" />
    //             <path d="M9 8.8c0 3.4 2.8 6.2 6.2 6.2l.9-1.6-1.9-1-1 .9a4.3 4.3 0 0 1-2.5-2.5l.9-1-1-1.9z" />
    //         </svg>
    //     ),
    // },
];

const EXPLORE = [
    { label: "Home", to: "/" },
    { label: "Apartment", to: "/apartment" },
    { label: "Contact", to: "/contact" },
    { label: "Book now", to: "/book" },
];

const GUESTS = [
    { label: "Booking terms", to: "/terms" },
    { label: "Privacy notice", to: "/privacy" },
];

function ArrowUp() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
    );
}

export default function Footer({ showCta = true }: { showCta?: boolean }) {
    const lenis = useLenis();
    const year = new Date().getFullYear();

    function backToTop() {
        if (lenis) lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <footer className="on-dark relative overflow-hidden bg-navy-950 text-navy-100">
            {/* Closing call to action */}
            {showCta && (
                <div className="border-b border-navy-800">
                    <Reveal className="container-site flex flex-wrap items-end justify-between gap-6 py-14 md:py-20">
                        <div className="max-w-2xl">
                            <p className="eyebrow">Your stay in Wolverhampton</p>
                            <p className="mt-3 font-display text-[36px] font-medium leading-[1.08] text-white md:text-[56px]">
                                A whole house, just for you.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/book"
                                className="btn bg-white text-navy-950 hover:bg-navy-50 hover:text-navy-950"
                            >
                                Check availability
                            </Link>
                            <Link to="/contact" className="btn btn-outline">
                                Ask a question
                            </Link>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* Columns */}
            <RevealGroup step={0.08} className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                {/* Brand */}
                <RevealItem className="sm:col-span-2 lg:col-span-4">
                    <Link to="/" aria-label="Aklass Luxury Stay — home" className="inline-flex items-center gap-3 no-underline">
                        <img src={LOGO_SRC} alt="" width={56} height={56} className="size-14" loading="lazy" />
                        <span className="flex flex-col leading-none">
                            <span className="font-display text-[26px] font-semibold tracking-[0.14em] text-white">AKLASS</span>
                            <span className="mt-1.5 text-[10px] font-semibold tracking-[0.32em] text-navy-200">LUXURY STAY</span>
                        </span>
                    </Link>
                    <p className="tagline mt-5 text-gold-200">A home away from home</p>
                    <p className="mt-3 max-w-xs text-small text-navy-200">
                        An entire four-bedroom house for up to seven guests in Bushbury, Wolverhampton.
                    </p>
                </RevealItem>

                {/* Explore */}
                <RevealItem className="lg:col-span-2">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-200">Explore</h2>
                    <ul className="mt-4 flex flex-col">
                        {EXPLORE.map((l) => (
                            <li key={l.to}>
                                <FooterLink to={l.to}>{l.label}</FooterLink>
                            </li>
                        ))}
                    </ul>
                </RevealItem>

                {/* Guests */}
                <RevealItem className="lg:col-span-3">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-200">Guests</h2>
                    <ul className="mt-4 flex flex-col">
                        {GUESTS.map((l) => (
                            <li key={l.to}>
                                <FooterLink to={l.to} plain={"plain" in l}>{l.label}</FooterLink>
                            </li>
                        ))}
                    </ul>
                </RevealItem>

                {/* Contact */}
                <RevealItem className="lg:col-span-3">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-200">Get in touch</h2>
                    <ul className="mt-4 flex flex-col text-[15px]">
                        <li>
                            <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center gap-3 text-navy-100 no-underline transition-colors hover:text-white">
                                <svg viewBox="0 0 24 24" className="amenity-icon size-5" aria-hidden="true">
                                    <path d="M3 5h18v14H3zM3 6l9 7 9-7" />
                                </svg>
                                {CONTACT.email}
                            </a>
                        </li>
                        <li className="flex min-h-11 items-center gap-3 text-navy-200">
                            <svg viewBox="0 0 24 24" className="amenity-icon size-5" aria-hidden="true">
                                <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                            </svg>
                            Bushbury, Wolverhampton WV10
                        </li>
                    </ul>

                    {/* Social icons — one horizontal row */}
                    <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-navy-200">Follow us</p>
                    <ul className="mt-3 flex flex-wrap gap-3">
                        {SOCIALS.filter((s) => s.url).map((s) => (
                            <li key={s.name}>
                                <motion.a
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${s.name} (opens in a new tab)`}
                                    title={s.name}
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.94 }}
                                    transition={{ duration: 0.25, ease: EASE }}
                                    className="flex size-11 items-center justify-center rounded-full border border-navy-700 text-navy-100 transition-colors duration-300 hover:border-gold-300 hover:bg-gold-300 hover:text-navy-950"
                                >
                                    {s.icon}
                                </motion.a>
                            </li>
                        ))}
                    </ul>
                </RevealItem>
            </RevealGroup>

            {/* Large decorative wordmark */}
            <div aria-hidden="true" className="pointer-events-none select-none mb-5">
                <motion.p
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.2, ease: EASE }}
                    className="-mb-[0.22em] w-full whitespace-nowrap pl-[0.06em] text-center font-display text-[22vw] font-semibold leading-none tracking-[0.06em] text-navy-900 lg:text-[16rem]"
                >
                    AKLASS
                </motion.p>
            </div>

            {/* Bottom bar */}
            <div className="relative border-t border-navy-800 bg-navy-950">
                <div className="container-site flex flex-col-reverse gap-4 py-6 text-[13px] text-navy-200 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {year} Aklass Luxury Stay · Operated by Aklass Dynamic Services
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2">
                            Site by <a href="https://www.nexuxgh.com" target="_blank" rel="noopener noreferrer" className="text-navy-100 no-underline transition-colors hover:text-white">Nexux</a>
                        </span>
                        <button
                            type="button"
                            onClick={backToTop}
                            className="group inline-flex min-h-11 items-center gap-2 rounded-pill border border-navy-700 px-4 font-semibold text-white transition-colors hover:border-gold-300"
                        >
                            Back to top
                            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
                                <ArrowUp />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const footerLinkClass =
    "group inline-flex min-h-11 items-center gap-2 text-[15px] text-navy-100 no-underline transition-colors hover:text-white";

/** `plain` uses a normal <a> so links with #anchors (e.g. /#faqs) jump to the section. */
function FooterLink({ to, plain = false, children }: { to: string; plain?: boolean; children: ReactNode }) {
    const inner = (
        <>
            <span className="h-px w-0 bg-gold-300 transition-all duration-300 group-hover:w-4" aria-hidden="true" />
            {children}
        </>
    );
    return plain ? (
        <a href={to} className={footerLinkClass}>{inner}</a>
    ) : (
        <Link to={to} className={footerLinkClass}>{inner}</Link>
    );
}