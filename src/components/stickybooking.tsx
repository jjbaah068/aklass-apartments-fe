/**
 * Small "Check availability" card that pins to the top-right corner once the guest
 * has scrolled past the hero's booking form (like Airbnb). Clicking it goes to /book,
 * carrying over any dates and guests already picked in the hero.
 *
 * Desktop/tablet: card in the top-right corner, just under the navbar.
 * Mobile: a bar along the bottom of the screen with the price, discount chips and button.
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

          {/* ---------- Mobile: bar along the bottom with price, discounts and button ---------- */}
          <motion.aside
            key="sticky-bar"
            aria-label="Book your stay"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 pt-3 shadow-overlay md:hidden"
            style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                {priceFrom ? (
                  <p className="text-small text-ink-muted">
                    <span className="font-semibold text-navy-900">From {priceFrom}</span> a night
                  </p>
                ) : (
                  <p className="text-small font-semibold text-navy-900">
                    {hasDates ? `${short(checkIn)} – ${short(checkOut)}` : "Add dates for prices"}
                  </p>
                )}
                <p className="truncate text-[12px] text-ink-subtle">
                  {hasDates
                    ? `${short(checkIn)} – ${short(checkOut)} · ${guests} ${guests === 1 ? "guest" : "guests"}`
                    : `Entire house · up to ${maxGuests} guests`}
                </p>
              </div>
              <button type="button" onClick={onBook} className="btn btn-cta shrink-0 px-4">
                Check availability
              </button>
            </div>
            {badges.length > 0 && (
              <ul className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-0.5" aria-label="Discounts">
                {badges.map((b) => (
                  <li key={b} className="chip chip-sm shrink-0 whitespace-nowrap" data-status="confirmed">{b}</li>
                ))}
              </ul>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
