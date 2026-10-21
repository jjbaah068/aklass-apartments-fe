/**
 * /reviews: every published guest review, with the score summary, star filter and sorting.
 */
import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { AirbnbRating, RatingSummary, ReviewCard, ScoreHeading, useReviews } from "../components/reviewparts";
import { MIN_REVIEWS_TO_SHOW, sortReviews, type ReviewSort } from "../lib/reviews";

type Filter = "all" | 5 | 4 | "3-";
const PAGE_SIZE = 10;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: 5, label: "5 stars" },
  { value: 4, label: "4 stars" },
  { value: "3-", label: "3 stars and below" },
];

export default function ReviewsPage() {
  const id = useId();
  const { data, loading, error } = useReviews();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => { document.title = "Guest reviews · Aklass Luxury Stay"; }, []);
  useEffect(() => { setShown(PAGE_SIZE); }, [filter, sort]);

  const list = useMemo(() => {
    if (!data) return [];
    const filtered = data.reviews.filter((r) =>
      filter === "all" ? true : filter === "3-" ? Math.round(r.rating) <= 3 : Math.round(r.rating) === filter,
    );
    return sortReviews(filtered, sort);
  }, [data, filter, sort]);

  const countFor = (f: Filter) =>
    !data ? 0 : f === "all" ? data.summary.count : f === "3-" ? data.summary.distribution[3] + data.summary.distribution[2] + data.summary.distribution[1] : data.summary.distribution[f];

  const enough = !!data && data.summary.count >= MIN_REVIEWS_TO_SHOW;

  return (
    <>
      <Navbar />

      <main id="main" className="bg-page">
        <div className="container-site pb-20 pt-8 md:pt-12">
          <Link to="/" className="inline-flex min-h-11 items-center gap-1.5 text-small font-semibold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            Back to home
          </Link>
          <p className="eyebrow mt-4">Guest reviews</p>

          {loading && (
            <div className="mt-4 space-y-6" aria-busy="true" aria-label="Loading reviews">
              <div className="skeleton h-12 w-72" />
              <div className="skeleton h-32 w-full" />
              <div className="skeleton h-40 w-full" />
            </div>
          )}

          {error && (
            <div role="alert" className="alert mt-6" data-variant="error">
              <div><span className="alert__title">We couldn't load the reviews</span>Please refresh the page or try again later.</div>
            </div>
          )}

          {data && !enough && (
            <>
              <h1 id={`${id}-title`} className="mt-3 text-h1 text-navy-900 md:text-[52px]">What our guests say</h1>
              <div className="mt-8"><AirbnbRating /></div>
            </>
          )}

          {data && enough && (
            <>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <ScoreHeading summary={data.summary} as="h1" id={`${id}-title`} />
                <Link to="/reviews/new" className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor" /></svg>
                  Leave a review
                </Link>
              </div>
              <p className="mt-2 max-w-2xl text-small text-ink-subtle">
                Every review comes from a guest who booked and stayed with us. We publish all genuine reviews, good or bad.
              </p>

              <div className="mt-8"><RatingSummary summary={data.summary} /></div>

              {/* Filter + sort */}
              <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div role="group" aria-label="Filter by rating" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
                  {FILTERS.map((f) => {
                    const active = filter === f.value;
                    const n = countFor(f.value);
                    return (
                      <button
                        key={String(f.value)}
                        type="button"
                        aria-pressed={active}
                        disabled={n === 0 && !active}
                        onClick={() => setFilter(f.value)}
                        className={`min-h-11 shrink-0 whitespace-nowrap rounded-pill border px-4 text-small font-semibold transition-colors disabled:opacity-40 ${
                          active ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-surface text-navy-900 hover:border-navy-300"
                        }`}
                      >
                        {f.label} <span className={active ? "text-white/70" : "text-ink-subtle"}>({n})</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`${id}-sort`} className="whitespace-nowrap text-small text-ink-subtle">Sort by</label>
                  <select id={`${id}-sort`} className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value as ReviewSort)}>
                    <option value="newest">Newest</option>
                    <option value="highest">Highest rated</option>
                    <option value="lowest">Lowest rated</option>
                  </select>
                </div>
              </div>

              {/* List */}
              <p className="sr-only" aria-live="polite">{list.length} reviews shown</p>
              {list.length === 0 ? (
                <p className="mt-10 text-ink-subtle">No reviews with this rating yet.</p>
              ) : (
                <ul className="mt-8 grid gap-x-12 lg:grid-cols-2">
                  {list.slice(0, shown).map((r) => (
                    <li key={r.id} className="border-b border-line py-8">
                      <ReviewCard review={r} />
                    </li>
                  ))}
                </ul>
              )}

              {shown < list.length && (
                <div className="mt-8 flex justify-center">
                  <button type="button" className="btn btn-outline" onClick={() => setShown((s) => s + PAGE_SIZE)}>
                    Show more reviews
                  </button>
                </div>
              )}

              {/* Nudge to book */}
              <div className="mt-16 flex flex-col items-start gap-4 rounded-card bg-navy-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between md:p-8">
                <div>
                  <p className="text-h3">Ready for your own stay?</p>
                  <p className="text-small text-white/75">The whole house, up to 7 guests, with free parking.</p>
                </div>
                <Link to="/book" className="btn btn-cta">Check availability</Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
