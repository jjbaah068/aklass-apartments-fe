/**
 * /reviews/new: a guest leaves a review.
 *  1. Check the booking (reference + email). Skipped when they come from the email link (?token=…).
 *  2. Stars (overall + 6 categories), trip type, review text and the name to show.
 *  3. Thank you. The review goes to the admin dashboard as "New" and appears once published.
 */
import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { EASE } from "../components/reveal";
import {
  AIRBNB,
  CATEGORIES,
  REVIEW_RULES,
  ReviewError,
  TRIP_TYPES,
  getInvite,
  submitReview,
  verifyBookingForReview,
  type CategoryKey,
  type ReviewInvite,
} from "../lib/reviews";

type Phase = "verify" | "loading" | "form" | "done";
const STAR = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z";
const WORDS = ["", "Terrible", "Poor", "OK", "Good", "Excellent"];

const formatDay = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="field-error">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" /></svg>
      {msg}
    </p>
  );
}

/* ---------- Star picker: 5 radio buttons that look like stars (keyboard: Tab, then arrow keys) ---------- */

function StarInput({
  id, label, value, onChange, size = 28, error,
}: { id: string; label: string; value: number; onChange: (n: number) => void; size?: number; error?: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset className="field-group" aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="field-label">{label}</legend>
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="cursor-pointer rounded-control p-0.5 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-1 has-[input:focus-visible]:outline-navy-700"
              onMouseEnter={() => setHover(n)}
            >
              <input
                type="radio"
                name={id}
                id={n === 1 ? id : undefined}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="sr-only"
                aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${WORDS[n]}`}
              />
              <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={`transition-colors ${n <= shown ? "text-gold-500" : "text-slate-300"}`}>
                <path d={STAR} fill="currentColor" />
              </svg>
            </label>
          ))}
        </div>
        <span className="min-w-[5rem] text-small font-semibold text-navy-900" aria-hidden="true">{WORDS[shown]}</span>
      </div>
      <Err id={`${id}-err`} msg={error} />
    </fieldset>
  );
}

/* ---------- The page ---------- */

type FormErrors = Partial<Record<"rating" | CategoryKey | "text" | "displayName" | "genuine", string>>;

export default function LeaveReview() {
  const id = useId();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [phase, setPhase] = useState<Phase>(token ? "loading" : "verify");
  const [invite, setInvite] = useState<ReviewInvite | null>(null);
  const [problem, setProblem] = useState<{ title: string; body: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Step 1: booking check
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [verifyErrors, setVerifyErrors] = useState<{ ref?: string; email?: string }>({});

  // Step 2: the review
  const [rating, setRating] = useState(0);
  const [cats, setCats] = useState<Record<CategoryKey, number>>({ cleanliness: 0, accuracy: 0, checkIn: 0, communication: 0, location: 0, value: 0 });
  const [tripType, setTripType] = useState("");
  const [text, setText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [genuine, setGenuine] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => { document.title = "Leave a review · Aklass Luxury Stay"; }, []);

  /* Came from the email link: load the invite */
  useEffect(() => {
    if (!token) return;
    getInvite(token)
      .then((inv) => { setInvite(inv); setDisplayName(inv.firstName); setPhase("form"); })
      .catch((e) => {
        setProblem(explain(e));
        setPhase("verify");
      });
  }, [token]);

  function explain(e: unknown) {
    const code = e instanceof ReviewError ? e.code : "UNKNOWN";
    const titles: Record<string, string> = {
      NOT_FOUND: "We couldn't find that booking",
      NOT_FINISHED: "Your stay hasn't finished yet",
      ALREADY_REVIEWED: "You've already left a review",
      LINK_EXPIRED: "This link has expired",
      NETWORK: "We couldn't connect",
    };
    const body =
      code === "LINK_EXPIRED" ? "Enter your booking reference and email below instead."
      : e instanceof Error ? e.message : "Please try again.";
    return { title: titles[code] ?? "Something went wrong", body };
  }

  async function onVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found: typeof verifyErrors = {};
    if (!/^[A-Za-z]{2,5}-[A-Za-z0-9]{3,}$/.test(ref.trim())) found.ref = "Enter your booking reference, for example AKL-1043. It's in your confirmation email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) found.email = "Enter the email address you booked with.";
    setVerifyErrors(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`${id}-${first}`)?.focus(); return; }

    setBusy(true);
    setProblem(null);
    try {
      const inv = await verifyBookingForReview(ref, email);
      setInvite(inv);
      setDisplayName(inv.firstName);
      setPhase("form");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setProblem(explain(err));
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!invite) return;
    const found: FormErrors = {};
    if (!rating) found.rating = "Choose an overall rating.";
    CATEGORIES.forEach((c) => { if (!cats[c.key]) found[c.key] = `Rate ${c.label.toLowerCase()}.`; });
    const len = text.trim().length;
    if (len < REVIEW_RULES.minText) found.text = `Tell us a little more: at least ${REVIEW_RULES.minText} characters.`;
    if (len > REVIEW_RULES.maxText) found.text = `Please keep it under ${REVIEW_RULES.maxText} characters.`;
    if (!displayName.trim()) found.displayName = "Enter the name to show with your review.";
    if (!genuine) found.genuine = "Please confirm this review is about your own stay.";
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`${id}-${first}`)?.focus(); return; }

    setBusy(true);
    setProblem(null);
    try {
      await submitReview(invite.token, {
        rating, categories: cats, tripType, text: text.trim(), displayName: displayName.trim(), confirmedGenuine: true, website,
      });
      setPhase("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setProblem(explain(err));
    } finally {
      setBusy(false);
    }
  }

  const textLeft = REVIEW_RULES.maxText - text.length;

  return (
    <>
      <Navbar />

      <main id="main" className="bg-stone-100">
        <div className="container-site pb-20 pt-8 md:pt-12">
          <Link to="/reviews" className="inline-flex min-h-11 items-center gap-1.5 text-small font-semibold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            All reviews
          </Link>

          <div className="mx-auto mt-4 max-w-2xl">
            <h1 className="text-h1 md:text-[52px]">
              {phase === "done" ? "Thank you!" : invite ? `How was your stay, ${invite.firstName}?` : "Leave a review"}
            </h1>

            {problem && (
              <div role="alert" className="alert mt-6" data-variant="error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" /></svg>
                <div><span className="alert__title">{problem.title}</span>{problem.body}</div>
              </div>
            )}

            <div className="card-raised mt-6 p-5 sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {/* ===== Loading the email link ===== */}
                {phase === "loading" && (
                  <motion.div key="loading" className="space-y-4" aria-busy="true" aria-label="Opening your review link" exit={{ opacity: 0 }}>
                    <div className="skeleton h-6 w-2/3" />
                    <div className="skeleton h-11 w-full" />
                    <div className="skeleton h-11 w-full" />
                  </motion.div>
                )}

                {/* ===== 1. Booking check ===== */}
                {phase === "verify" && (
                  <motion.form
                    key="verify"
                    noValidate
                    onSubmit={onVerify}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="flex flex-col gap-5"
                  >
                    <p className="text-small text-ink-subtle">
                      Stayed with us? Enter your booking details so we know the review is from a real guest.
                      You'll find your booking reference in your confirmation email.
                    </p>

                    <div className="field-group">
                      <label htmlFor={`${id}-ref`} className="field-label">Booking reference</label>
                      <input
                        id={`${id}-ref`} className="field uppercase placeholder:normal-case" placeholder="e.g. AKL-1043" autoComplete="off"
                        value={ref} onChange={(e) => { setRef(e.target.value); setVerifyErrors((x) => ({ ...x, ref: undefined })); }}
                        aria-invalid={verifyErrors.ref ? true : undefined} aria-describedby={verifyErrors.ref ? `${id}-ref-err` : undefined}
                      />
                      <Err id={`${id}-ref-err`} msg={verifyErrors.ref} />
                    </div>

                    <div className="field-group">
                      <label htmlFor={`${id}-email`} className="field-label">Email you booked with</label>
                      <input
                        id={`${id}-email`} type="email" className="field" autoComplete="email"
                        value={email} onChange={(e) => { setEmail(e.target.value); setVerifyErrors((x) => ({ ...x, email: undefined })); }}
                        aria-invalid={verifyErrors.email ? true : undefined} aria-describedby={verifyErrors.email ? `${id}-email-err` : undefined}
                      />
                      <Err id={`${id}-email-err`} msg={verifyErrors.email} />
                    </div>

                    <button type="submit" className="btn btn-primary self-start sm:px-8" disabled={busy} aria-busy={busy}>
                      {busy ? "Checking…" : "Continue"}
                    </button>

                    <p className="border-t border-line pt-5 text-[13px] text-ink-subtle">
                      Booked through Airbnb? Please leave your review on{" "}
                      <a href={AIRBNB.url} target="_blank" rel="noopener noreferrer">Airbnb</a>. It helps us a lot too.
                    </p>
                  </motion.form>
                )}

                {/* ===== 2. The review ===== */}
                {phase === "form" && invite && (
                  <motion.form
                    key="form"
                    noValidate
                    onSubmit={onSubmit}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="flex flex-col gap-6"
                  >
                    <p className="-mt-1 text-small text-ink-subtle">
                      Your stay: {formatDay(invite.stayedFrom)} – {formatDay(invite.stayedTo)}
                    </p>

                    <StarInput
                      id={`${id}-rating`} label="Overall" size={36} value={rating} error={errors.rating}
                      onChange={(n) => { setRating(n); setErrors((x) => ({ ...x, rating: undefined })); }}
                    />

                    <div className="rounded-card border border-line p-4 sm:p-5">
                      <p className="field-label">Rate each part of your stay</p>
                      <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                        {CATEGORIES.map((c) => (
                          <StarInput
                            key={c.key} id={`${id}-${c.key}`} label={c.label} size={24} value={cats[c.key]} error={errors[c.key]}
                            onChange={(n) => { setCats((x) => ({ ...x, [c.key]: n })); setErrors((x) => ({ ...x, [c.key]: undefined })); }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="field-group">
                      <label htmlFor={`${id}-trip`} className="field-label">Type of trip <span className="optional">(optional)</span></label>
                      <select id={`${id}-trip`} className="field" value={tripType} onChange={(e) => setTripType(e.target.value)}>
                        <option value="">Prefer not to say</option>
                        {TRIP_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="field-group">
                      <label htmlFor={`${id}-text`} className="field-label">Your review</label>
                      <textarea
                        id={`${id}-text`} rows={6} className="field" maxLength={REVIEW_RULES.maxText + 50}
                        placeholder="What did you enjoy? Anything we could do better?"
                        value={text} onChange={(e) => { setText(e.target.value); setErrors((x) => ({ ...x, text: undefined })); }}
                        aria-invalid={errors.text ? true : undefined} aria-describedby={`${id}-text-hint${errors.text ? ` ${id}-text-err` : ""}`}
                      />
                      <p id={`${id}-text-hint`} className={`field-hint ${textLeft < 0 ? "text-error" : ""}`}>
                        {textLeft >= 0 ? `${textLeft} characters left` : `${-textLeft} characters too long`}
                      </p>
                      <Err id={`${id}-text-err`} msg={errors.text} />
                    </div>

                    <div className="field-group">
                      <label htmlFor={`${id}-displayName`} className="field-label">Name to show</label>
                      <input
                        id={`${id}-displayName`} className="field sm:max-w-xs" autoComplete="given-name" maxLength={30}
                        value={displayName} onChange={(e) => { setDisplayName(e.target.value); setErrors((x) => ({ ...x, displayName: undefined })); }}
                        aria-invalid={errors.displayName ? true : undefined} aria-describedby={`${id}-dn-hint${errors.displayName ? ` ${id}-displayName-err` : ""}`}
                      />
                      <p id={`${id}-dn-hint`} className="field-hint">We only show your first name.</p>
                      <Err id={`${id}-displayName-err`} msg={errors.displayName} />
                    </div>

                    {/* Honeypot: hidden from people, bots fill it in and get ignored */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                      <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
                    </div>

                    <div className="rounded-control bg-stone-50 p-4">
                      <label className="check">
                        <input
                          id={`${id}-genuine`} type="checkbox" checked={genuine}
                          onChange={(e) => { setGenuine(e.target.checked); setErrors((x) => ({ ...x, genuine: undefined })); }}
                          aria-invalid={errors.genuine ? true : undefined} aria-describedby={errors.genuine ? `${id}-genuine-err` : undefined}
                        />
                        <span>This review is about my own stay and is my honest opinion. I'm happy for it to be published on this website with my first name.</span>
                      </label>
                      <Err id={`${id}-genuine-err`} msg={errors.genuine} />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[13px] text-ink-subtle">Reviews are checked before they appear, usually within a day.</p>
                      <button type="submit" className="btn btn-primary sm:px-8" disabled={busy} aria-busy={busy}>
                        {busy ? "Sending…" : "Submit review"}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* ===== 3. Thank you ===== */}
                {phase === "done" && (
                  <motion.div
                    key="done"
                    role="status"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col items-start gap-4"
                  >
                    <span className="flex size-14 items-center justify-center rounded-full bg-navy-900 text-gold-300">
                      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} fill="currentColor" /></svg>
                    </span>
                    <p className="text-h3 text-navy-900">Your review has been sent</p>
                    <p className="text-ink-muted">
                      Thank you for taking the time, {displayName.trim() || invite?.firstName}. We read every review, and yours will
                      appear on the website once it's been checked, usually within a day.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <Link to="/reviews" className="btn btn-outline">Read other reviews</Link>
                      <Link to="/" className="btn btn-ghost">Back to home</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer showCta={false} />
    </>
  );
}
