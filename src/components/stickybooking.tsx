/**
 * Small "Check availability" card that pins to the top-right corner once the guest
 * has scrolled past the hero's booking form (like Airbnb). Clicking it goes to /book,
 * carrying over any dates and guests already picked in the hero.
 *
 * Desktop/tablet: card in the top-right corner, just under the navbar.
 * Mobile: a round-cornered button floating in the bottom-right corner (easy to reach with a thumb).
 *
 * To move it to the LEFT: change `right-4 lg:right-8` to `left-4 lg:left-8` (both places below).
 * If it overlaps your navbar, change `--header-h` (your navbar's height) in the style below.
 */
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Props = {
  visible: boolean;
  checkIn: string;
  checkOut: string;
  guests: number;
  maxGuests: number;
  /** e.g. "£160", from GET /settings/public. null = not loaded, so hidden. */
  priceFrom?: string | null;
  /** Discount badges, e.g. "5% off Mon–Thu nights" (switched-off discounts already left out). */
  badges?: string[];
  onBook: () => void;
};

const short = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function StickyBooking({ visible, checkIn, checkOut, guests, maxGuests, priceFrom, badges = [], onBook }: Props) {
  const reduce = useReducedMotion();
  const hasDates = !!checkIn && !!checkOut;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* ---------- Desktop / tablet: top-right card ---------- */}
          <motion.aside
            key="sticky-card"
            aria-label="Book your stay"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 z-40 hidden w-[300px] rounded-card border border-line bg-surface p-4 shadow-overlay md:block lg:right-8"
            style={{ top: "calc(var(--header-h, 76px) + 12px)" }}
          >
            <p className="font-semibold text-navy-900">
              {hasDates ? `${short(checkIn)} – ${short(checkOut)}` : "Add dates for prices"}
            </p>
            <p className="text-[13px] text-ink-subtle">
              {hasDates ? `${guests} ${guests === 1 ? "guest" : "guests"} · entire house` : `Entire house · up to ${maxGuests} guests`}
            </p>
            {priceFrom && (
              <p className="mt-2 text-small text-ink-muted">
                <span className="font-semibold text-navy-900">From {priceFrom}</span> a night
              </p>
            )}
            {badges.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Discounts">
                {badges.map((b) => (
                  <li key={b} className="chip chip-sm" data-status="confirmed">{b}</li>
                ))}
              </ul>
            )}
            <button type="button" onClick={onBook} className="btn btn-cta btn-block mt-3">
              Check availability
            </button>
          </motion.aside>

          {/* ---------- Mobile: floating button, bottom-right ---------- */}
          <motion.div
            key="sticky-fab"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 z-40 md:hidden"
            style={{ bottom: "calc(16px + env(safe-area-inset-bottom))" }}
          >
            <button type="button" onClick={onBook} className="btn btn-cta rounded-pill px-5 shadow-overlay">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>
              Check availability
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
