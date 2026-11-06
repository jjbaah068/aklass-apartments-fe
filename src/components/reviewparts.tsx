/**
 * Building blocks for reviews, shared by the home page section and the /reviews page:
 * star rows, the score summary (overall bars + 8 categories), a review card, and the Airbnb / Booking.com sections.
 */
import { useEffect, useId, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { AIRBNB, AIRBNB_REVIEWS, BOOKING_COM, BOOKING_REVIEWS, CATEGORIES, formatMonth, getReviews, type AirbnbReview, type BookingReview, type Review, type ReviewSummary } from "../lib/reviews";

/* ---------- Load reviews once per page ---------- */

export function useReviews() {
  const [data, setData] = useState<{ reviews: Review[]; summary: ReviewSummary } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getReviews()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);
  return { data, error, loading: !data && !error };
}

/* ---------- Stars ---------- */

const STAR = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z";

export function Stars({ value, size = 14, className = "" }: { value: number; size?: number; className?: string }) {
  const id = useId();
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1))); // 0, partial or 1
        return (
          <svg key={n} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`${id}-${n}`}>
                <stop offset={`${fill * 100}%`} stopColor="currentColor" />
                <stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#${id}-${n})`} />
          </svg>
        );
      })}
    </span>
  );
}

/** Big "★ 4.8 · 11 reviews" heading line */
export function ScoreHeading({ summary, as: Tag = "h2", id }: { summary: ReviewSummary; as?: "h1" | "h2"; id?: string }) {
  return (
    <Tag id={id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-h1 text-navy-900">
      <svg width="30" height="30" viewBox="0 0 24 24" className="shrink-0 text-gold-500" aria-hidden="true"><path d={STAR} fill="currentColor" /></svg>
      <span>{summary.average.toFixed(1)}</span>
      <span aria-hidden="true" className="text-slate-400">·</span>
      <span>{summary.count} {summary.count === 1 ? "review" : "reviews"}</span>
    </Tag>
  );
}

/* ---------- Summary: overall bars + 8 categories ---------- */

export function RatingSummary({ summary }: { summary: ReviewSummary }) {
  const max = Math.max(1, ...Object.values(summary.distribution));
  return (
    <div className="grid gap-6 border-y border-line py-6 sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Overall: 5 → 1 bars */}
      <div>
        <p className="text-small font-semibold text-navy-900">Overall rating</p>
        <ul className="mt-2 space-y-1.5" aria-label="How guests rated their stay">
          {([5, 4, 3, 2, 1] as const).map((n) => (
            <li key={n} className="flex items-center gap-2 text-[12px] text-ink-subtle">
              <span className="w-2 tabular-nums">{n}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-slate-200">
                <span className="block h-full rounded-pill bg-navy-900" style={{ width: `${(summary.distribution[n] / max) * 100}%` }} />
              </span>
              <span className="sr-only">{summary.distribution[n]} reviews gave {n} stars</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      {/* Every box draws its own right + bottom line; the -mr-px/-mb-px hides the ones on the outer edge */}
      <div className="overflow-hidden rounded-card bg-surface">
        <ul className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const score = summary.categories?.[cat.key];
            return (
              <li key={cat.key} className="flex items-center justify-between gap-3 border-b border-r border-line p-4 lg:flex-col lg:items-start lg:justify-start">
                <div>
                  <p className="text-small font-medium text-navy-900">{cat.label}</p>
                  <p className="text-small font-semibold text-ink-subtle tabular-nums">{score ? score.toFixed(1) : "–"}</p>
                </div>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-navy-700 lg:mt-3" aria-hidden="true">
                  <path d={cat.icon} />
                </svg>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------- One review ---------- */

const AVATAR_TONES = ["bg-navy-900 text-white", "bg-gold-200 text-navy-900", "bg-navy-100 text-navy-900", "bg-stone-200 text-navy-900"];

export function ReviewCard({ review, clamp = false, className = "" }: { review: Review; clamp?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const long = review.text.length > 180;
  const tone = AVATAR_TONES[review.name.charCodeAt(0) % AVATAR_TONES.length];

  return (
    <article className={`flex flex-col gap-3 ${className}`} aria-label={`Review by ${review.name}`}>
      <header className="flex items-center gap-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full font-semibold ${tone}`} aria-hidden="true">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy-900">{review.name}</p>
          <p className="truncate text-[13px] text-ink-subtle">{review.tripType ?? "Stayed"} · {formatMonth(review.stayedOn)}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Stars value={review.rating} className="text-gold-500" />
        <span className="inline-flex items-center gap-1 rounded-pill bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-navy-700">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
          Verified stay
        </span>
      </div>

      <p className={`text-[15px] leading-relaxed text-ink-muted ${clamp && !open ? "line-clamp-4" : ""}`}>{review.text}</p>
      {clamp && long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="self-start text-small font-semibold text-navy-900 underline underline-offset-4">
          {open ? "Show less" : "Read more"}
        </button>
      )}

      {review.reply && (
        <div className="mt-1 border-l-2 border-gold-500 pl-4">
          <p className="text-[13px] font-semibold text-navy-900">Reply from Aklass</p>
          <p className={`mt-1 text-small text-ink-muted ${clamp && !open ? "line-clamp-3" : ""}`}>{review.reply.text}</p>
        </div>
      )}
    </article>
  );
}

/* ---------- Reviews from Airbnb ---------- */

/** Airbnb's logo mark, in Airbnb's coral, so guests can see where a review came from. */
export function AirbnbLogo({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FF385C" strokeWidth="2" strokeLinejoin="round" className={`shrink-0 ${className}`} role="img" aria-label="Airbnb">
      <path d="M12 17.5c2.2 2.6 4.6 4 6.4 3.1 1.8-.9 2-3 .9-5.6L14.2 4.2C13.6 3 12.9 2.5 12 2.5s-1.6.5-2.2 1.7L4.7 15c-1.1 2.6-.9 4.7.9 5.6 1.8.9 4.2-.5 6.4-3.1z" />
      <path d="M12 17.5c-1.6-2-3-3.9-3-5.4a3 3 0 0 1 6 0c0 1.5-1.4 3.4-3 5.4z" />
    </svg>
  );
}

const AIRBNB_AVATAR_TONES = ["bg-[#FDE7D9] text-[#9A3412]", "bg-[#DCEBFB] text-[#1D4ED8]", "bg-[#E7F3E6] text-[#166534]", "bg-[#F1E6F8] text-[#6B21A8]"];

export function AirbnbReviewCard({ review, clamp = false, className = "" }: { review: AirbnbReview; clamp?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const long = review.text.length > 180;
  const tone = AIRBNB_AVATAR_TONES[review.name.charCodeAt(0) % AIRBNB_AVATAR_TONES.length];

  return (
    <article className={`flex flex-col gap-3 ${className}`} aria-label={`Airbnb review by ${review.name}`}>
      <header className="flex items-center gap-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full font-semibold ${tone}`} aria-hidden="true">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy-900">{review.name}</p>
          <p className="truncate text-[13px] text-ink-subtle">{review.memberFor}</p>
        </div>
        <AirbnbLogo size={22} />
      </header>

      <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-subtle">
        <Stars value={review.rating} size={12} className="text-navy-900" />
        <span aria-hidden="true">·</span>
        <span>{review.date}</span>
      </div>

      <p className={`text-[15px] leading-relaxed text-ink-muted ${clamp && !open ? "line-clamp-4" : ""}`}>{review.text}</p>
      {clamp && long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="self-start text-small font-semibold text-navy-900 underline underline-offset-4">
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </article>
  );
}

/* ---------- Shared layout for reviews from another site ---------- */

const ARROW = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
);

const CARD_ITEM = "w-[85%] shrink-0 snap-start rounded-card border border-line bg-surface p-5 md:w-auto";

/** Heading row (logo, title, rating line, "See all" link) and a card grid that swipes sideways on mobile. */
function PlatformSection({ logo, title, rating, url, linkLabel, count, className = "", children }: {
  logo: ReactNode; title: string; rating?: ReactNode; url: string; linkLabel: string; count: number; className?: string; children: ReactNode;
}) {
  // Match the columns to the number of cards so 1 or 2 reviews don't leave an empty gap
  const cols = count >= 3 ? "md:grid-cols-3" : count === 2 ? "md:grid-cols-2" : "md:max-w-xl md:grid-cols-1";
  return (
    <div className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {logo}
          <div>
            <p className="text-h3 text-navy-900">{title}</p>
            {rating && <p className="text-small text-ink-subtle">{rating}</p>}
          </div>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline self-start sm:self-auto">
          {linkLabel}
          {ARROW}
        </a>
      </div>

      <ul
        aria-label={title}
        className={`-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:gap-8 md:overflow-visible md:px-0 ${cols}`}
      >
        {children}
      </ul>
    </div>
  );
}

/** "From Airbnb" block: rating line, the saved Airbnb reviews and a link to review us there. */
export function AirbnbReviews({ limit, className = "" }: { limit?: number; className?: string }) {
  const list = limit ? AIRBNB_REVIEWS.slice(0, limit) : AIRBNB_REVIEWS;
  if (list.length === 0) return null;
  return (
    <PlatformSection
      logo={<AirbnbLogo size={28} />}
      title="Reviews from Airbnb"
      rating={<><span className="font-semibold text-navy-900">★ {AIRBNB.rating.toFixed(2)}</span> from {AIRBNB.count} guests on Airbnb</>}
      url={AIRBNB.url}
      linkLabel="See all on Airbnb"
      count={list.length}
      className={className}
    >
      {list.map((r) => (
        <li key={r.id} className={CARD_ITEM}>
          <AirbnbReviewCard review={r} clamp />
        </li>
      ))}
    </PlatformSection>
  );
}

/* ---------- Reviews from Booking.com ---------- */

/** Booking.com's logo mark (white "B." on their dark blue) so guests can see where a review came from. */
export function BookingLogo({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`} role="img" aria-label="Booking.com">
      <rect width="24" height="24" rx="5" fill="#003580" />
      <path d="M6.5 5.5h4.6c2.3 0 3.6 1.1 3.6 2.9 0 1.1-.6 2-1.6 2.4 1.4.4 2.2 1.4 2.2 2.8 0 2.1-1.5 3.4-4 3.4H6.5zm2.4 2v3h1.9c1 0 1.6-.6 1.6-1.5s-.6-1.5-1.6-1.5zm0 4.9v3.6h2.2c1.2 0 1.9-.7 1.9-1.8s-.7-1.8-1.9-1.8z" fill="#fff" />
      <circle cx="18.2" cy="16.2" r="1.6" fill="#009FE3" />
    </svg>
  );
}

/** Booking.com-style score badge, e.g. "9.0" in a dark blue square. */
function BookingScore({ value }: { value: number }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-[5px] rounded-bl-none bg-[#003580] px-1.5 text-[12px] font-bold tabular-nums text-white" role="img" aria-label={`Scored ${value} out of 10`}>
      {Number.isInteger(value) ? value : value.toFixed(1)}
    </span>
  );
}

export function BookingReviewCard({ review, clamp = false, className = "" }: { review: BookingReview; clamp?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const long = review.text.length > 180;
  const tone = AIRBNB_AVATAR_TONES[review.name.charCodeAt(0) % AIRBNB_AVATAR_TONES.length];

  return (
    <article className={`flex flex-col gap-3 ${className}`} aria-label={`Booking.com review by ${review.name}`}>
      <header className="flex items-center gap-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full font-semibold ${tone}`} aria-hidden="true">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy-900" title={review.name}>{review.name}</p>
          <p className="truncate text-[13px] text-ink-subtle">{review.country}</p>
        </div>
        <BookingLogo size={22} />
      </header>

      {(review.score != null || review.date) && (
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-subtle">
          {review.score != null && <BookingScore value={review.score} />}
          {review.score != null && review.date && <span aria-hidden="true">·</span>}
          {review.date && <span>{review.date}</span>}
        </div>
      )}

      {review.title && (
        <p className={`font-semibold leading-snug text-navy-900 ${clamp && !open ? "line-clamp-2" : ""}`}>{review.title}</p>
      )}
      <p className={`whitespace-pre-line text-[15px] leading-relaxed text-ink-muted ${clamp && !open ? "line-clamp-4" : ""}`}>{review.text}</p>
      {clamp && long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="self-start text-small font-semibold text-navy-900 underline underline-offset-4">
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </article>
  );
}

/** "From Booking.com" block: score line, the saved Booking.com reviews and a link to the listing. */
export function BookingReviews({ limit, className = "" }: { limit?: number; className?: string }) {
  const list = limit ? BOOKING_REVIEWS.slice(0, limit) : BOOKING_REVIEWS;
  if (list.length === 0) return null;
  const { score, label, count, url } = BOOKING_COM;
  return (
    <PlatformSection
      logo={<BookingLogo size={28} />}
      title="Reviews from Booking.com"
      rating={score != null && (
        <><span className="font-semibold text-navy-900">{score.toFixed(1)}/10{label && ` · ${label}`}</span> from {count} {count === 1 ? "guest" : "guests"} on Booking.com</>
      )}
      url={url}
      linkLabel="See all on Booking.com"
      count={list.length}
      className={className}
    >
      {list.map((r) => (
        <li key={r.id} className={CARD_ITEM}>
          <BookingReviewCard review={r} clamp />
        </li>
      ))}
    </PlatformSection>
  );
}

/* ---------- Airbnb fallback (fewer than MIN_REVIEWS_TO_SHOW direct reviews) ---------- */

export function AirbnbRating() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-card border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <svg width="40" height="40" viewBox="0 0 24 24" className="shrink-0 text-gold-500" aria-hidden="true"><path d={STAR} fill="currentColor" /></svg>
        <div>
          <p className="text-h3 text-navy-900">{AIRBNB.rating.toFixed(2)} from {AIRBNB.count} guests</p>
          <p className="text-small text-ink-subtle">Our rating on Airbnb. Reviews from direct bookings will appear here.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href={AIRBNB.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          Read them on Airbnb
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
        </a>
        <Link to="/reviews/new" className="btn btn-primary">Leave a review</Link>
      </div>
    </div>
  );
}
