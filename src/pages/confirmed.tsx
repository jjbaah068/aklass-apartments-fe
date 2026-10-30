import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { EASE } from "../components/reveal";
import {
  BookingError,
  IS_DEMO,
  formatDateUK,
  formatGBP,
  getBookingStatus,
  startCheckout,
  type BookingStatusResponse,
} from "../lib/booking";
import { WAKE_UP_MESSAGE, useSlow } from "../lib/hooks";

/** While SumUp hasn't answered yet: ask again every 4 s, for about a minute. */
const POLL_EVERY_MS = 4000;
const POLL_TRIES = 15;

type View =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "error"; message: string }
  | { kind: "status"; data: BookingStatusResponse };

/** What to tell the guest for each payment/status combination (API section 2.8). */
function describe(d: BookingStatusResponse, stillWaiting: boolean) {
  if (d.payment === "paid") {
    if (d.status === "confirmed") return { tone: "success", chip: "confirmed", chipText: "Confirmed", title: "Your booking is confirmed", body: "We've emailed your confirmation. Your arrival details will follow before your stay." };
    if (d.status === "id_review") return { tone: "success", chip: "paid", chipText: "Paid · checking ID", title: "Payment received!", body: "We're checking your ID. We'll email you once it's approved (usually within a few hours)." };
    if (d.status === "needs_review") return { tone: "info", chip: "needs-review", chipText: "Paid · being reviewed", title: "Payment received", body: "We'll be in touch shortly to confirm your dates." };
    return { tone: "info", chip: "needs-review", chipText: "Paid", title: "Payment received", body: "We'll be in touch shortly about your booking. If you have any questions, please contact us." };
  }
  if (d.payment === "pending") {
    return stillWaiting
      ? { tone: "info", chip: "pending", chipText: "Checking payment", title: "Checking your payment…", body: "This usually takes a few seconds." }
      : { tone: "warning", chip: "pending", chipText: "Still checking", title: "We're still waiting to hear from SumUp", body: "Please don't pay again. Refresh this page in a minute, or contact us and quote your booking reference." };
  }
  if (d.payment === "failed") return { tone: "error", chip: "failed", chipText: "Payment failed", title: "Your payment didn't go through", body: "Nothing has been charged." };
  return { tone: "warning", chip: "unpaid", chipText: "Not paid", title: "We haven't received a payment yet", body: "This booking hasn't been paid for." };
}

export default function Confirmed() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = (params.get("ref") ?? "").trim();

  const [view, setView] = useState<View>(ref ? { kind: "loading" } : { kind: "not_found" });
  const [tries, setTries] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [holdGone, setHoldGone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slow = useSlow(view.kind === "loading");

  /* Load the status, and keep asking while the payment is "pending" (up to ~1 minute). */
  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    getBookingStatus(ref)
      .then((data) => {
        if (cancelled) return;
        setView({ kind: "status", data });
        if (data.payment === "pending" && tries < POLL_TRIES) {
          timer.current = setTimeout(() => setTries((n) => n + 1), POLL_EVERY_MS);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof BookingError && e.code === "NOT_FOUND") setView({ kind: "not_found" });
        else setView({ kind: "error", message: e instanceof Error ? e.message : "Please try again." });
      });
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ref, tries]);

  /* "Try again" after a failed payment: a new SumUp page for the same hold. */
  async function tryAgain() {
    setRetrying(true);
    setRetryError(null);
    try {
      const { checkoutUrl } = await startCheckout(ref);
      if (checkoutUrl.startsWith("/")) navigate(checkoutUrl);
      else window.location.assign(checkoutUrl);
    } catch (e) {
      const code = e instanceof BookingError ? e.code : "UNKNOWN";
      if (code === "ALREADY_PAID") { setTries((n) => n + 1); setRetrying(false); return; }
      if (code === "HOLD_EXPIRED" || code === "NOT_FOUND") setHoldGone(true);
      setRetryError(e instanceof Error ? e.message : "Please try again.");
      setRetrying(false);
    }
  }

  const data = view.kind === "status" ? view.data : null;
  const info = data ? describe(data, tries < POLL_TRIES) : null;
  const unpaid = data && (data.payment === "failed" || data.payment === "not_started");
  // A new payment page only works while the 30-minute hold is still active
  const canRetry = unpaid && data.status === "hold" && !holdGone;

  return (
    <>
      <Navbar />

      <main id="main" className="bg-stone-100">
        <div className="container-site pb-20 pt-8 md:pt-12">
          <h1 className="text-h1 md:text-[52px]">Your booking</h1>
          {IS_DEMO && (
            <p className="mt-2 inline-flex rounded-pill bg-warning-bg px-3 py-1 text-[12px] font-semibold text-warning-ink">
              Demo mode — sample booking, no payment taken
            </p>
          )}

          <motion.div
            className="card-raised mt-8 max-w-[44rem] p-5 sm:p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {view.kind === "loading" && (
              <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading your booking">
                <div className="skeleton h-7 w-2/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-1/2" />
                {slow && <p className="text-small text-ink-subtle" role="status">{WAKE_UP_MESSAGE}</p>}
              </div>
            )}

            {view.kind === "not_found" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-h3">We couldn't find that booking</h2>
                <p className="text-ink-muted">
                  {ref ? <>There's no booking with the reference <span className="ref">{ref}</span>.</> : "This link is missing a booking reference."}{" "}
                  If you've paid, don't worry: <Link to="/contact">contact us</Link> and we'll sort it out.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/contact" className="btn btn-primary">Contact us</Link>
                  <Link to="/book" className="btn btn-outline">Start a new booking</Link>
                </div>
              </div>
            )}

            {view.kind === "error" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-h3">We couldn't load your booking</h2>
                <p className="text-ink-muted">{view.message}</p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="btn btn-primary" onClick={() => { setView({ kind: "loading" }); setTries((n) => n + 1); }}>
                    Try again
                  </button>
                  <Link to="/contact" className="btn btn-outline">Contact us</Link>
                </div>
              </div>
            )}

            {data && info && (
              <div className="flex flex-col gap-6" aria-live="polite">
                <div>
                  <span className="chip" data-status={info.chip}>{info.chipText}</span>
                  <h2 className="mt-3 text-h3">{info.title}</h2>
                  <p className="mt-2 text-ink-muted">{info.body}</p>
                  {data.payment === "pending" && tries < POLL_TRIES && (
                    <div className="mt-3 skeleton h-1.5 w-40" aria-hidden="true" />
                  )}
                  {data.payment === "pending" && tries >= POLL_TRIES && (
                    <button type="button" className="btn btn-outline btn-sm mt-4" onClick={() => setTries(0)}>Check again</button>
                  )}
                </div>

                <dl className="divide-y divide-line rounded-card border border-line text-small">
                  {[
                    { k: "Booking reference", v: <span className="ref">{data.ref}</span> },
                    { k: "Check-in", v: formatDateUK(data.checkIn) },
                    { k: "Check-out", v: formatDateUK(data.checkOut) },
                    { k: "Nights", v: String(data.nights) },
                    { k: "Guests", v: String(data.guests) },
                    { k: "Total", v: formatGBP(data.total) },
                  ].map((row) => (
                    <div key={row.k} className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 p-4">
                      <dt className="text-ink-subtle">{row.k}</dt>
                      <dd className="font-semibold text-navy-900">{row.v}</dd>
                    </div>
                  ))}
                </dl>

                {unpaid && (
                  <div className="flex flex-col gap-3">
                    {retryError && (
                      <div role="alert" className="alert" data-variant="error">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" /></svg>
                        <div>{retryError}</div>
                      </div>
                    )}
                    {canRetry ? (
                      <button type="button" className="btn btn-cta btn-lg" onClick={tryAgain} disabled={retrying} aria-busy={retrying}>
                        {retrying ? "Taking you to SumUp…" : `Try again: pay ${formatGBP(data.total)}`}
                      </button>
                    ) : (
                      <>
                        <p className="text-small text-ink-subtle">Your 30-minute hold on these dates has ended, so you'll need to start again.</p>
                        <Link to="/book" className="btn btn-primary self-start">Start again</Link>
                      </>
                    )}
                  </div>
                )}

                <p className="text-[13px] text-ink-subtle">
                  Keep your booking reference handy. Questions? <Link to="/contact">Contact us</Link>.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer showCta={false} />
    </>
  );
}
