import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import logo from '../assets/images/logo.webp'


const LOGO_SRC = logo;

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Apartment", to: "/apartment" },
  { label: "Contact", to: "/contact" },
] as const;

const BOOK_PATH = "/book";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const lenis = useLenis();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Soft shadow once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While open: lock page scroll (incl. Lenis), close on Escape, focus first link
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    const focusTimer = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a")?.focus(), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  // Close if the screen grows to desktop width
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header
        className={`site-header transition-shadow duration-200 ${
          scrolled || open ? "shadow-[0_4px_16px_rgb(10_19_40/0.06)]" : ""
        }`}
      >
        <div className="container-site flex h-[68px] items-center justify-between gap-4 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            aria-label="Aklass Luxury Stay — home"
            className="flex shrink-0 items-center gap-3 no-underline"
          >
            <img
              src={LOGO_SRC}
              alt=""
              width={48}
              height={48}
              className="size-10 md:size-12"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[19px] font-semibold tracking-[0.14em] text-navy-900 md:text-[23px]">
                AKLASS
              </span>
              <span className="mt-1 text-[9px] font-semibold tracking-[0.32em] text-slate-700 md:text-[10px]">
                LUXURY STAY
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.to === "/"} className="nav-link">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right side: Book Now stays visible at every width */}
          <div className="flex items-center gap-1">
            <Link to={BOOK_PATH} className="btn btn-cta h-11 px-4 md:h-12 md:px-6">
              Book Now
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              className="btn-icon md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — rendered OUTSIDE the header.
          (.site-header uses backdrop-filter, which traps `position: fixed`
          children inside the header's own 68px box, so the panel had no height.) */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            data-lenis-prevent
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-x-0 bottom-0 top-[68px] z-50 overflow-y-auto border-t border-line bg-page md:hidden"
          >
            <nav aria-label="Mobile" className="container-site flex min-h-full flex-col pb-8 pt-2">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.to}
                    className="border-b border-line"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE, delay: 0.05 + i * 0.05 }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex min-h-14 items-center justify-between font-display text-[28px] no-underline ${
                          isActive ? "font-semibold text-navy-900" : "font-medium text-navy-800"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {link.label}
                          {isActive && <span className="gold-rule w-6" aria-hidden="true" />}
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <p className="tagline text-navy-900">Your Comfort, Our Priority</p>
                <p className="mt-2 text-small text-ink-muted">
                 Bushbury, Wolverhampton
                </p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}