import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { EASE } from "../components/reveal";
import DateRangeCalendar from "../components/daterangecalendar";
import StaySummary, { QuoteBreakdown } from "../components/staysummary";
import IdFileInput from "../components/idfileinput";
import { WAKE_UP_MESSAGE, usePublicSettings, useSlow } from "../lib/hooks";
import {
  BOOKING,
  BookingError,
  ID_RULES,
  ID_TYPES,
  IS_DEMO,
  addDays,
  createHold,
  formatDateUK,
  formatGBP,
  getBlockedNights,
  getQuote,
  formatTime,
  nightsBetween,
  rangeIsFree,
  startCheckout,
  todayISO,
  uploadId,
  type GuestDetails,
  type IdType,
  type Hold,
  type Quote,
} from "../lib/booking";

type Step = 1 | 2 | 3 | 4;

const STEPS = ["Dates & guests", "Your details", "Verify ID", "Review & pay"];

const COUNTRY_CODES = [
  { code: "+44", label: "UK +44" },
  { code: "+353", label: "Ireland +353" },
  { code: "+233", label: "Ghana +233" },
  { code: "+234", label: "Nigeria +234" },
  { code: "+1", label: "US / Canada +1" },
  { code: "+33", label: "France +33" },
  { code: "+49", label: "Germany +49" },
  { code: "other", label: "Other" },
];

const PURPOSES = ["", "Family visit", "Holiday", "Group trip", "Contract work", "Business", "Event or match", "Relocation", "Other"];
const ARRIVALS = ["3:00–4:00 PM", "4:00–5:00 PM", "5:00–6:00 PM", "6:00–7:00 PM", "After 7:00 PM (on request)", "Not sure yet"];

const EMPTY_DETAILS: GuestDetails = { fullName: "", email: "", phoneCountry: "+44", phone: "", purpose: "", arrivalTime: ARRIVALS[1] };

type DetailErrors = Partial<Record<keyof GuestDetails | "agree", string>>;

function validateDetails(d: GuestDetails, agree: boolean): DetailErrors {
  const e: DetailErrors = {};
  if (d.fullName.trim().split(/\s+/).length < 2) e.fullName = "Enter your first and last name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = "Enter an email address like name@example.com.";
  if (!/^[\d\s()-]{6,18}$/.test(d.phone.trim())) e.phone = "Enter a phone number so we can reach you about your stay.";
  if (!agree) e.agree = "You need to agree to the house rules and booking terms to continue.";
  return e;
}

type IdErrors = { type?: string; front?: string; back?: string; consent?: string };

function validateId(type: IdType | null, front: File | null, back: File | null, consent: boolean): IdErrors {
  const e: IdErrors = {};
  const rule = ID_TYPES.find((t) => t.value === type);
  if (!rule) e.type = "Choose the type of ID you're uploading.";
  if (!front) e.front = rule?.needsBack ? "Add a photo of the front." : "Add a photo of the photo page.";
  if (rule?.needsBack && !back) e.back = "Add a photo of the back.";
  if (!consent) e.consent = "You need to agree to the ID check to continue.";
  return e;
}

function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="field-error">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" /></svg>
      {msg}
    </p>
  );
}

export default function Book() {
  const id = useId();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [checkIn, setCheckIn] = useState<string | null>(params.get("checkIn"));
  const [checkOut, setCheckOut] = useState<string | null>(params.get("checkOut"));
  const [guests, setGuests] = useState(() => Math.min(BOOKING.maxGuests, Math.max(1, Number(params.get("guests")) || 2)));

  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Stay rules from the server (falls back to the built-in numbers until it loads)
  const settings = usePublicSettings();
  const minNights = settings?.minNights ?? BOOKING.minNights;
  const maxGuests = settings?.maxGuests ?? BOOKING.maxGuests;
  const checkInFrom = formatTime(settings?.checkInFrom ?? "15:00");

  const [details, setDetails] = useState<GuestDetails>(EMPTY_DETAILS);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<DetailErrors>({});

  // Step 3: ID verification (kept if the guest goes back, so they don't upload again)
  const [idType, setIdType] = useState<IdType | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [idConsent, setIdConsent] = useState(false);
  const [idErrors, setIdErrors] = useState<IdErrors>({});

  const [hold, setHold] = useState<Hold | null>(null);
  const lastHoldRef = useRef<string | null>(null); 
  const [holdLeft, setHoldLeft] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [flowError, setFlowError] = useState<{ title: string; body: string } | null>(null);
  const availabilitySlow = useSlow(availabilityLoading);
  const busySlow = useSlow(busy);

  /* ---------- Load availability ---------- */
  async function loadAvailability() {
    setAvailabilityLoading(true);
    try {
      const nights = await getBlockedNights(todayISO(), addDays(todayISO(), 365));
      setBlocked(new Set(nights));
    } catch (e) {
      setFlowError({ title: "We couldn't load availability", body: e instanceof BookingError ? e.message : "Please refresh the page." });
    } finally {
      setAvailabilityLoading(false);
    }
  }
  useEffect(() => { loadAvailability(); }, []);

  /* Drop dates from the URL that aren't valid any more */
  useEffect(() => {
    if (availabilityLoading || !checkIn || !checkOut) return;
    const ok =
      checkIn >= todayISO() &&
      checkOut > checkIn &&
      nightsBetween(checkIn, checkOut) >= minNights &&
      rangeIsFree(checkIn, checkOut, blocked);
    if (!ok) {
      setCheckIn(null);
      setCheckOut(null);
      setFlowError({ title: "Those dates aren't available", body: "Some of the nights you picked are booked or below the minimum stay. Please choose new dates." });
    }
  }, [availabilityLoading]); 

  /* ---------- Live quote (always the server's price; debounced while guests/dates change) ---------- */
  useEffect(() => {
    if (!checkIn || !checkOut) { setQuote(null); setQuoteError(null); setQuoteLoading(false); return; }
    let cancelled = false;
    setQuoteLoading(true);
    setQuoteError(null);
    const t = setTimeout(() => {
      getQuote(checkIn, checkOut, guests)
        .then((q) => { if (!cancelled) setQuote(q); })
        .catch((e) => {
          if (cancelled) return;
          setQuote(null);
          setQuoteError(e instanceof BookingError ? e.message : "We couldn't get a price. Please try again.");
        })
        .finally(() => { if (!cancelled) setQuoteLoading(false); });
    }, 300);
    // Keep the URL in sync so the page can be refreshed or shared
    setParams({ checkIn, checkOut, guests: String(guests) }, { replace: true });
    return () => { cancelled = true; clearTimeout(t); };
  }, [checkIn, checkOut, guests]);
  /* ---------- Hold countdown ---------- */
  useEffect(() => {
    if (!hold) { setHoldLeft(null); return; }
    const tick = () => setHoldLeft(Math.max(0, Math.round((new Date(hold.holdExpiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [hold]);

  const holdExpired = hold != null && holdLeft === 0;


  useEffect(() => {
    if (!holdExpired) return;
    backToStart(
      "Your hold has expired",
      `We released your dates after ${BOOKING.holdMinutes} minutes and nothing has been charged. If they're still free, you can continue with them again.`,
    );
  }, [holdExpired]); 

  function backToStart(title: string, body: string) {
    setHold(null);
    setStep(1);
    loadAvailability();
    setFlowError({ title, body });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goTo(s: Step) {
    setFlowError(null);
    setStep(s);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function changeDates(ci: string | null, co: string | null) {
    setCheckIn(ci);
    setCheckOut(co);
    setHold(null);
    setFlowError(null);
  }

  /* ---------- Step 2 → 3: check the guest's details ---------- */
  function submitDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateDetails(details, agree);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`${id}-${first}`)?.focus(); return; }
    if (!checkIn || !checkOut) { goTo(1); return; }
    goTo(3);
  }

  /* ---------- Step 3 → 4: check the ID, hold the dates, upload the ID ---------- */
  async function submitId(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateId(idType, idFront, idBack, idConsent);
    setIdErrors(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`${id}-id-${first}`)?.focus(); return; }
    if (!checkIn || !checkOut || !idType || !idFront) { goTo(1); return; }

    const needsBack = ID_TYPES.find((t) => t.value === idType)?.needsBack ?? false;
    setBusy(true);
    setFlowError(null);
    try {
      
      let h = hold && !holdExpired ? hold : null;
      if (!h) {
        setBusyLabel("Holding your dates…");
        h = await createHold({ checkIn, checkOut, guests, details, idType, agreedToTerms: true, agreedToIdCheck: true, previousRef: lastHoldRef.current ?? undefined });
        lastHoldRef.current = h.bookingRef;
        setHold(h);
      }
      setBusyLabel("Uploading your ID securely…");
      await uploadId(h.bookingRef, { type: idType, front: idFront, back: needsBack ? idBack : null, consent: true });
      goTo(4);
    } catch (err) {
      handleBookingError(err);
    } finally {
      setBusy(false);
    }
  }

  /** Server field paths ("details.email") → the field names on step 2. */
  const DETAIL_FIELDS: Record<string, keyof DetailErrors> = {
    "details.fullName": "fullName",
    "details.email": "email",
    "details.phone": "phone",
    "details.phoneCountry": "phone",
    "details.purpose": "purpose",
    "details.arrivalTime": "arrivalTime",
    agreedToTerms: "agree",
  };

  function handleBookingError(err: unknown) {
    const code = err instanceof BookingError ? err.code : "UNKNOWN";
    const message = err instanceof Error ? err.message : "Please try again.";
    const ref = hold?.bookingRef ?? lastHoldRef.current;

    switch (code) {
      case "DATES_TAKEN":
        setCheckIn(null);
        setCheckOut(null);
        backToStart("Those dates were just taken", "Another guest booked some of those nights moments ago. Nothing has been charged. Please choose new dates.");
        return;
      case "HOLD_EXPIRED":
        backToStart("Your hold has expired", `${message} Nothing has been charged. If your dates are still free, you can continue with them again.`);
        return;
      case "NOT_FOUND":
        backToStart("We couldn't find your hold", `${message} Nothing has been charged. Please continue from your dates again.`);
        return;
      case "INVALID_DATES":
      case "PAST_DATE":
      case "MIN_STAY":
      case "MAX_STAY":
      case "MAX_GUESTS":
        backToStart("Please check your dates and guests", message);
        return;
      case "INVALID": {
        const fields = err instanceof BookingError ? err.fields ?? {} : {};
        const found: DetailErrors = {};
        for (const [path, msg] of Object.entries(fields)) {
          const key = DETAIL_FIELDS[path];
          if (key) found[key] = msg;
        }
        if (Object.keys(found).length) {
          setErrors(found);
          goTo(2);
          setFlowError({ title: "Please check your details", body: message });
          return;
        }
        setFlowError({ title: "Please check your booking", body: message });
        return;
      }
      case "ID_REQUIRED":
        goTo(3);
        setFlowError({ title: "Please upload your ID", body: message });
        return;
      case "ID_INVALID":
        setFlowError({ title: "We couldn't use that ID file", body: message });
        return;
      case "ALREADY_PAID":
        if (ref) navigate(`/booking/confirmed?ref=${encodeURIComponent(ref)}`);
        return;
      case "TOO_MANY_REQUESTS":
        setFlowError({ title: "Too many attempts", body: message });
        return;
      case "PAYMENT_PROVIDER_ERROR":
        setFlowError({ title: "SumUp didn't respond", body: message });
        return;
      case "PAYMENTS_NOT_SET_UP":
        setFlowError({ title: "Card payments aren't available right now", body: message });
        return;
      case "NETWORK":
        setFlowError({ title: "We couldn't connect", body: message });
        return;
      default:
        setFlowError({ title: "Something went wrong", body: message });
    }
  }

  /* ---------- Step 4: pay (SumUp's hosted page) ---------- */
  async function pay() {
    if (!hold || holdExpired) return;
    setBusy(true);
    setBusyLabel("Taking you to SumUp…");
    setFlowError(null);
    try {
      const { checkoutUrl } = await startCheckout(hold.bookingRef);
      if (checkoutUrl.startsWith("/")) navigate(checkoutUrl); // demo mode
      else window.location.assign(checkoutUrl); 
    } catch (err) {
      handleBookingError(err);
      setBusy(false);
    }
  }

  /** The hold's quote is the final price; before that, the live quote. */
  const shownQuote = hold?.quote ?? quote;

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const canContinue = !!checkIn && !!checkOut && !!quote && !quoteLoading;

  const summary = useMemo(
    () => (
      <StaySummary
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        quote={shownQuote}
        quoteLoading={quoteLoading && !hold}
        quoteError={quoteError}
        holdSecondsLeft={step >= 3 ? holdLeft : null}
      />
    ),
    [checkIn, checkOut, guests, shownQuote, quoteLoading, quoteError, hold, step, holdLeft],
  );

  const field = (k: keyof GuestDetails | "agree") => ({
    id: `${id}-${k}`,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined,
  });

  return (
    <>
      <Navbar />

      <main id="main" className="bg-stone-100">
        <div ref={topRef} className="container-site scroll-mt-24 pb-20 pt-8 md:pt-12">
          {/* Header */}
          <div className="mb-8">
            {/* <Link to="/apartment" className="inline-flex min-h-11 items-center gap-1.5 text-small font-semibold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
              Back to the apartment
            </Link> */}
            <h1 className="mt-2 text-h1 md:text-[52px]">Book your stay</h1>
            {/* {IS_DEMO && (
              <p className="mt-2 inline-flex rounded-pill bg-warning-bg px-3 py-1 text-[12px] font-semibold text-warning-ink">
                Demo mode — sample dates and prices, no payment taken
              </p>
            )} */}
          </div>

          {/* Step indicator */}
          <ol aria-label="Booking steps" className="mb-8 grid grid-cols-4 gap-2 sm:gap-4">
            {STEPS.map((label, i) => {
              const n = (i + 1) as Step;
              const done = step > n;
              const current = step === n;
              return (
                <li key={label} aria-current={current ? "step" : undefined}>
                  <span className="block h-1 overflow-hidden rounded-pill bg-slate-200">
                    <motion.span
                      className="block h-full bg-navy-900"
                      initial={false}
                      animate={{ width: done || current ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  </span>
                  <span className={`mt-2 flex items-center gap-1.5 text-[12px] font-semibold sm:text-small ${current ? "text-navy-900" : done ? "text-navy-700" : "text-slate-500"}`}>
                    <span className="hidden sm:inline">Step {n} ·</span> {label}
                    {done && <span className="sr-only">(completed)</span>}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
            {/* ---------------- Main card ---------------- */}
            <div className="min-w-0">
              {flowError && (
                <div role="alert" className="alert mb-6" data-variant="error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" /></svg>
                  <div><span className="alert__title">{flowError.title}</span>{flowError.body}</div>
                </div>
              )}

              <div className="card-raised p-5 sm:p-8">
                <AnimatePresence mode="wait" initial={false}>
                  {/* ===== STEP 1 ===== */}
                  {step === 1 && (
                    <motion.section
                      key="s1"
                      aria-labelledby={`${id}-s1`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <h2 id={`${id}-s1`} className="text-h3">When would you like to stay?</h2>

                      <div className="mt-6">
                        {availabilityLoading ? (
                          <div className="grid gap-2" aria-busy="true" aria-label="Loading availability">
                            <div className="skeleton h-8 w-40" />
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: 35 }, (_, i) => <div key={i} className="skeleton h-11" />)}
                            </div>
                            {availabilitySlow && <p className="text-small text-ink-subtle" role="status">{WAKE_UP_MESSAGE}</p>}
                          </div>
                        ) : (
                          <DateRangeCalendar
                            checkIn={checkIn}
                            checkOut={checkOut}
                            blocked={blocked}
                            minNights={minNights}
                            onChange={changeDates}
                          />
                        )}
                      </div>

                      {/* Selected range + clear */}
                      {checkIn && (
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-control bg-stone-50 px-4 py-3">
                          <p className="text-small">
                            <span className="font-semibold text-navy-900">
                              {formatDateUK(checkIn)} {checkOut ? `– ${formatDateUK(checkOut)}` : ""}
                            </span>
                            {checkOut && <span className="text-ink-subtle"> · {nights} nights</span>}
                          </p>
                          <button type="button" className="btn-ghost min-h-11 px-2 text-small font-semibold text-navy-700 underline underline-offset-4" onClick={() => changeDates(null, null)}>
                            Clear dates
                          </button>
                        </div>
                      )}

                      {/* Guests */}
                      <div className="mt-6 flex items-center justify-between gap-4 rounded-card border border-line p-4">
                        <div>
                          <p className="font-semibold text-navy-900">Guests</p>
                          <p className={`text-[13px] ${guests >= maxGuests ? "font-semibold text-gold-700" : "text-ink-subtle"}`}>
                            {guests >= maxGuests ? `Maximum ${maxGuests} guests reached` : "Adults and children"}
                          </p>
                        </div>
                        <div className="stepper">
                          <button type="button" className="stepper-btn" aria-label="Remove a guest" disabled={guests <= 1} onClick={() => setGuests((g) => g - 1)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14" /></svg>
                          </button>
                          <output className="stepper-value" aria-live="polite">{guests}</output>
                          <button type="button" className="stepper-btn" aria-label="Add a guest" disabled={guests >= maxGuests} onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-[13px] text-ink-subtle">
                        More than {maxGuests}? <Link to="/contact">Contact us</Link> before booking.
                      </p>

                      {/* Mobile summary */}
                      <div className="mt-6 lg:hidden">{summary}</div>

                      <div className="mt-8 flex justify-end border-t border-line pt-6">
                        <button type="button" className="btn btn-primary w-full sm:w-auto sm:px-8" disabled={!canContinue} onClick={() => goTo(2)}>
                          Continue to your details
                        </button>
                      </div>
                    </motion.section>
                  )}

                  {/* ===== STEP 2 ===== */}
                  {step === 2 && (
                    <motion.form
                      key="s2"
                      noValidate
                      onSubmit={submitDetails}
                      aria-labelledby={`${id}-s2`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="flex flex-col gap-5"
                    >
                      <h2 id={`${id}-s2`} className="text-h3">Who's staying?</h2>
                      <p className="-mt-2 text-small text-ink-subtle">We'll send your confirmation and arrival details to this email.</p>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="field-group">
                          <label htmlFor={`${id}-fullName`} className="field-label">Full name</label>
                          <input {...field("fullName")} className="field" autoComplete="name" value={details.fullName} onChange={(e) => setDetails({ ...details, fullName: e.target.value })} />
                          {!errors.fullName && <p className="field-hint">Exactly as it appears on your photo ID.</p>}
                          <Err id={`${id}-fullName-err`} msg={errors.fullName} />
                        </div>
                        <div className="field-group">
                          <label htmlFor={`${id}-email`} className="field-label">Email</label>
                          <input {...field("email")} type="email" className="field" autoComplete="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} />
                          <Err id={`${id}-email-err`} msg={errors.email} />
                        </div>
                      </div>

                      <div className="field-group">
                        <label htmlFor={`${id}-phone`} className="field-label">Phone</label>
                        <div className="field-phone">
                          <select aria-label="Country code" className="field" value={details.phoneCountry} onChange={(e) => setDetails({ ...details, phoneCountry: e.target.value })}>
                            {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                          </select>
                          <input {...field("phone")} type="tel" className="field" autoComplete="tel-national" placeholder="7700 900123" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
                        </div>
                        <p className="field-hint">UK or international — we'll only use this about your stay.</p>
                        <Err id={`${id}-phone-err`} msg={errors.phone} />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="field-group">
                          <label htmlFor={`${id}-arrivalTime`} className="field-label">Expected arrival</label>
                          <select {...field("arrivalTime")} className="field" value={details.arrivalTime} onChange={(e) => setDetails({ ...details, arrivalTime: e.target.value })}>
                            {ARRIVALS.map((a) => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                        <div className="field-group">
                          <label htmlFor={`${id}-purpose`} className="field-label">Purpose of stay <span className="optional">(optional)</span></label>
                          <select {...field("purpose")} className="field" value={details.purpose} onChange={(e) => setDetails({ ...details, purpose: e.target.value })}>
                            {PURPOSES.map((p) => <option key={p} value={p}>{p || "Prefer not to say"}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="rounded-control bg-stone-50 p-4">
                        <label className="check">
                          <input {...field("agree")} type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrors((x) => ({ ...x, agree: undefined })); }} />
                          <span>
                            I agree to the <Link to="/#faqs">house rules</Link> and <Link to="/terms">booking terms</Link>, including the £50 surcharge for rule breaches and £75 plus cost for damage or missing items.
                          </span>
                        </label>
                        <Err id={`${id}-agree-err`} msg={errors.agree} />
                      </div>

                      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
                        <button type="button" className="btn btn-outline" onClick={() => goTo(1)}>Back</button>
                        <button type="submit" className="btn btn-primary sm:px-8">
                          Continue to ID check
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* ===== STEP 3: VERIFY ID ===== */}
                  {step === 3 && (
                    <motion.form
                      key="s3"
                      noValidate
                      onSubmit={submitId}
                      aria-labelledby={`${id}-s3`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="flex flex-col gap-6"
                    >
                      <div>
                        <h2 id={`${id}-s3`} className="text-h3">Verify your ID</h2>
                        <p className="mt-2 text-small text-ink-subtle">
                          For everyone's safety, the lead guest shows a photo ID before we confirm the booking.
                          We'll check the name matches <span className="font-semibold text-navy-900">{details.fullName.trim() || "the name you gave"}</span>.
                        </p>
                      </div>

                      {/* ID type */}
                      <fieldset className="field-group" aria-describedby={idErrors.type ? `${id}-id-type-err` : undefined}>
                        <legend className="field-label">Type of ID</legend>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {ID_TYPES.map((t, i) => {
                            const selected = idType === t.value;
                            return (
                              <label
                                key={t.value}
                                className={`flex cursor-pointer flex-col gap-0.5 rounded-card border p-4 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-navy-700 ${
                                  selected ? "border-navy-900 bg-navy-50 ring-1 ring-navy-900" : "border-line bg-white hover:border-navy-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`${id}-idtype`}
                                  id={i === 0 ? `${id}-id-type` : undefined}
                                  className="sr-only"
                                  checked={selected}
                                  onChange={() => {
                                    setIdType(t.value);
                                    if (!t.needsBack) setIdBack(null);
                                    setIdErrors((x) => ({ ...x, type: undefined }));
                                  }}
                                />
                                <span className="flex items-center justify-between font-semibold text-navy-900">
                                  {t.label}
                                  <span aria-hidden="true" className={`flex size-5 items-center justify-center rounded-full border ${selected ? "border-navy-900 bg-navy-900" : "border-slate-300"}`}>
                                    {selected && <span className="size-2 rounded-full bg-white" />}
                                  </span>
                                </span>
                                <span className="text-[13px] text-ink-subtle">{t.hint}</span>
                              </label>
                            );
                          })}
                        </div>
                        <Err id={`${id}-id-type-err`} msg={idErrors.type} />
                      </fieldset>

                      {/* Photos */}
                      {idType && (
                        <div className={`grid gap-5 ${ID_TYPES.find((t) => t.value === idType)?.needsBack ? "sm:grid-cols-2" : ""}`}>
                          <IdFileInput
                            id={`${id}-id-front`}
                            label={idType === "passport" ? "Passport photo page" : "Front"}
                            file={idFront}
                            onChange={(f) => { setIdFront(f); setIdErrors((x) => ({ ...x, front: undefined })); }}
                            error={idErrors.front}
                          />
                          {ID_TYPES.find((t) => t.value === idType)?.needsBack && (
                            <IdFileInput
                              id={`${id}-id-back`}
                              label="Back"
                              file={idBack}
                              onChange={(f) => { setIdBack(f); setIdErrors((x) => ({ ...x, back: undefined })); }}
                              error={idErrors.back}
                            />
                          )}
                        </div>
                      )}

                      {/* Photo tips */}
                      <ul className="grid gap-2 rounded-card bg-stone-50 p-4 text-[13px] text-ink-subtle sm:grid-cols-3">
                        {["All four corners in the photo", "No glare or blur, text readable", "Not expired"].map((tip) => (
                          <li key={tip} className="flex items-start gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="mt-px shrink-0 text-navy-700" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                            {tip}
                          </li>
                        ))}
                      </ul>

                      {/* Consent + privacy */}
                      <div className="rounded-control bg-stone-50 p-4">
                        <label className="check">
                          <input
                            id={`${id}-id-consent`}
                            type="checkbox"
                            checked={idConsent}
                            aria-invalid={idErrors.consent ? true : undefined}
                            aria-describedby={idErrors.consent ? `${id}-id-consent-err` : undefined}
                            onChange={(e) => { setIdConsent(e.target.checked); setIdErrors((x) => ({ ...x, consent: undefined })); }}
                          />
                          <span>
                            I agree to Aklass using this ID only to check the name matches my booking. It's stored encrypted and privately,
                            location data is removed from the photo, only the owner can see it, and it's deleted {ID_RULES.deleteAfterDays} days
                            after my stay (or straight away if the booking isn't paid). See our <Link to="/privacy">privacy policy</Link>.
                          </span>
                        </label>
                        <Err id={`${id}-id-consent-err`} msg={idErrors.consent} />
                      </div>

                      <div className="alert" role="note">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 11v5M12 8h.01" /></svg>
                        <div>
                          <span className="alert__title">What happens next</span>
                          After you pay, we check your ID, usually within a few hours, and email your confirmation.
                          If the ID can't be verified, we'll contact you, and if we can't confirm the booking you get a full refund.
                        </div>
                      </div>

                      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
                        {/* Going back drops the hold; the next hold sends it as previousRef so it's released */}
                        <button type="button" className="btn btn-outline" onClick={() => { setHold(null); goTo(2); }} disabled={busy}>Back</button>
                        <button type="submit" className="btn btn-primary sm:px-8" disabled={busy} aria-busy={busy}>
                          {busy ? busyLabel || "Holding your dates…" : "Review booking"}
                        </button>
                      </div>
                      {busySlow && <p className="-mt-3 text-center text-[13px] text-ink-subtle" role="status">{WAKE_UP_MESSAGE}</p>}
                    </motion.form>
                  )}

                  {/* ===== STEP 4: REVIEW & PAY ===== */}
                  {step === 4 && checkIn && checkOut && (
                    <motion.section
                      key="s4"
                      aria-labelledby={`${id}-s4`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="flex flex-col gap-6"
                    >
                      <h2 id={`${id}-s4`} className="text-h3">Check everything looks right</h2>

                      {/* When the timer reaches 0 the guest is sent back to step 1 automatically */}
                      <div className="alert" role="status">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2" /></svg>
                        <div>
                          <span className="alert__title">Your dates are held for {BOOKING.holdMinutes} minutes</span>
                          Complete payment before the timer runs out, or the dates will be released.
                        </div>
                      </div>

                      <dl className="divide-y divide-line rounded-card border border-line">
                        {[
                          { k: "Stay", v: `${formatDateUK(checkIn)} – ${formatDateUK(checkOut)}`, sub: `${nights} nights · check-in from ${checkInFrom}`, edit: 1 as Step },
                          { k: "Guests", v: `${guests} ${guests === 1 ? "guest" : "guests"}`, edit: 1 as Step },
                          { k: "Lead guest", v: details.fullName, sub: `${details.email} · ${details.phoneCountry === "other" ? "" : details.phoneCountry + " "}${details.phone}`, edit: 2 as Step },
                          { k: "Arrival", v: details.arrivalTime, edit: 2 as Step },
                          { k: "Photo ID", v: ID_TYPES.find((t) => t.value === idType)?.label ?? "", sub: "Uploaded · checked after payment", edit: 3 as Step },
                        ].map((row) => (
                          <div key={row.k} className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-start gap-3 p-4 text-small sm:grid-cols-[140px_minmax(0,1fr)_auto]">
                            <dt className="text-ink-subtle">{row.k}</dt>
                            <dd className="min-w-0">
                              <span className="block font-semibold text-navy-900">{row.v}</span>
                              {row.sub && <span className="block break-words text-ink-subtle">{row.sub}</span>}
                            </dd>
                            <dd>
                              <button type="button" className="min-h-11 px-1 font-semibold text-navy-700 underline underline-offset-4" onClick={() => { setHold(null); goTo(row.edit); }}>
                                Edit<span className="sr-only"> {row.k.toLowerCase()}</span>
                              </button>
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {/* Final price = the server's quote from the hold */}
                      {shownQuote && (
                        <div className="quote rounded-card bg-stone-50 p-4">
                          <QuoteBreakdown quote={shownQuote} totalLabel="Total to pay (GBP)" />
                        </div>
                      )}

                      <div className="flex flex-col gap-3 border-t border-line pt-6">
                        <button type="button" className="btn btn-cta btn-lg btn-block" onClick={pay} disabled={busy || holdExpired} aria-busy={busy}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" /></svg>
                          {busy ? busyLabel || "Taking you to SumUp…" : `Pay ${shownQuote ? formatGBP(shownQuote.total) : ""} securely with SumUp`}
                        </button>
                        {busySlow && <p className="text-center text-[13px] text-ink-subtle" role="status">{WAKE_UP_MESSAGE}</p>}
                        <p className="text-center text-[13px] text-ink-subtle">
                          You'll be taken to SumUp's secure checkout. We never see or store your card details.
                          {hold && <> Booking reference <span className="ref">{hold.bookingRef}</span>.</>}
                        </p>
                        <button type="button" className="btn btn-ghost self-center" onClick={() => { setHold(null); goTo(3); }}>Back</button>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/*  */}
            <aside className="hidden lg:block" aria-label="Booking summary">
              <div className="sticky top-28">{summary}</div>
            </aside>
          </div>
        </div>
      </main>

      <Footer showCta={false} />
    </>
  );
}