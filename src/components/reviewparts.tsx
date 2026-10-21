/**
 * Building blocks for reviews, shared by the home page section and the /reviews page:
 * star rows, the score summary (overall bars + 6 categories), a review card and the Airbnb fallback.
 */
import { useEffect, useId, useState } from "react";
import { Link } from "react-router";
import { AIRBNB, CATEGORIES, formatMonth, getReviews, type Review, type ReviewSummary } from "../lib/reviews";

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

/* ---------- Summary: overall bars + 6 categories ---------- */

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
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((cat) => (
          <li key={cat.key} className="flex items-center justify-between gap-3 bg-surface p-4 lg:flex-col lg:items-start lg:justify-start">
            <div>
              <p className="text-small font-medium text-navy-900">{cat.label}</p>
              <p className="text-small font-semibold text-ink-subtle tabular-nums">{summary.categories[cat.key].toFixed(1)}</p>
            </div>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-navy-700 lg:mt-3" aria-hidden="true">
              <path d={cat.icon} />
            </svg>
          </li>
        ))}
      </ul>
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
