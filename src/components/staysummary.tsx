import { AnimatePresence, motion } from "motion/react";
import { EASE } from "./reveal";
import { formatDateUK, formatGBP, type Quote } from "../lib/booking";
import summaryImg from "../assets/images/livingroom3.webp";

type Props = {
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  quote: Quote | null;
  quoteLoading: boolean;
  holdSecondsLeft?: number | null;
};

function mmss(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default function StaySummary({ checkIn, checkOut, guests, quote, quoteLoading, holdSecondsLeft }: Props) {
  return (
    <div className="card-overlay overflow-hidden">
      <img src={summaryImg} alt="" className="aspect-[16/9] w-full object-cover" />
      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="eyebrow">Your stay</p>
          <p className="mt-1 font-display text-[24px] font-semibold leading-tight text-navy-900">
            Aklass Luxury Stay entire home
          </p>
          <p className="text-[13px] text-ink-subtle">Bushbury, Wolverhampton WV10</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 border-y border-line py-4 text-small">
          <div>
            <dt className="text-ink-subtle">Check-in</dt>
            <dd className="font-semibold text-navy-900">{checkIn ? formatDateUK(checkIn) : "—"}</dd>
            <dd className="text-[12px] text-ink-subtle">from 3:00 PM</dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Check-out</dt>
            <dd className="font-semibold text-navy-900">{checkOut ? formatDateUK(checkOut) : "—"}</dd>
            <dd className="text-[12px] text-ink-subtle">by 11:00 AM</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-ink-subtle">Guests</dt>
            <dd className="font-semibold text-navy-900">{guests} {guests === 1 ? "guest" : "guests"}</dd>
          </div>
        </dl>

        <div aria-live="polite">
          {quoteLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-5 w-2/3" />
            </div>
          ) : quote ? (
            <div className="quote">
              <div className="quote__row">
                <span>{formatGBP(quote.nightlyRate)} × {quote.nights} {quote.nights === 1 ? "night" : "nights"}</span>
                <span>{formatGBP(quote.accommodation)}</span>
              </div>
              <div className="quote__row"><span>Cleaning fee</span><span>{formatGBP(quote.cleaningFee)}</span></div>
              <div className="quote__divider" />
              <div className="quote__total"><span>Total (GBP)</span><span>{formatGBP(quote.total)}</span></div>
            </div>
          ) : (
            <p className="text-small text-ink-subtle">Choose your dates to see the full price.</p>
          )}
        </div>

        <AnimatePresence>
          {holdSecondsLeft != null && holdSecondsLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="alert"
              role="status"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2" /></svg>
              <div>
                <span className="alert__title">Dates held for you</span>
                <span className="tabular">{mmss(holdSecondsLeft)}</span> left to complete payment
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}