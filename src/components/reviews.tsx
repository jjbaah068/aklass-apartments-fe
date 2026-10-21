/**
 * Home page: guest reviews section.
 * Score summary + the 3 newest reviews (swipe sideways on mobile) + "Show all reviews".
 * Fewer than 3 direct reviews? Shows the Airbnb rating instead.
 */
import { useId } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { fadeUp, stagger } from "./reveal";
import { MIN_REVIEWS_TO_SHOW } from "../lib/reviews";
import { AirbnbRating, RatingSummary, ReviewCard, ScoreHeading, useReviews } from "./reviewparts";

export default function Reviews() {
  const id = useId();
  const { data, loading, error } = useReviews();

  // Nothing to show if the reviews couldn't load; the rest of the page carries on
  if (error) return null;

  const enough = !!data && data.summary.count >= MIN_REVIEWS_TO_SHOW;
  const latest = data?.reviews.slice(0, 3) ?? [];

  return (
    <section id="reviews" aria-labelledby={`${id}-title`} className="bg-page py-16 md:py-24">
      <motion.div
        className="container-site"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger(0.08)}
      >
        <motion.p variants={fadeUp} className="eyebrow">Guest reviews</motion.p>

        {loading && (
          <div className="mt-4 space-y-6" aria-busy="true" aria-label="Loading reviews">
            <div className="skeleton h-10 w-64" />
            <div className="skeleton h-28 w-full" />
          </div>
        )}

        {data && !enough && (
          <>
            <motion.h2 variants={fadeUp} id={`${id}-title`} className="mt-3 text-h1 text-navy-900">What our guests say</motion.h2>
            <motion.div variants={fadeUp} className="mt-8"><AirbnbRating /></motion.div>
          </>
        )}

        {data && enough && (
          <>
            <motion.div variants={fadeUp} className="mt-3">
              <ScoreHeading summary={data.summary} id={`${id}-title`} />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8">
              <RatingSummary summary={data.summary} />
            </motion.div>

            {/* Latest reviews: grid on desktop, swipeable row on mobile */}
            <motion.ul
              variants={fadeUp}
              aria-label="Latest reviews"
              className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0"
            >
              {latest.map((r) => (
                <li key={r.id} className="w-[85%] shrink-0 snap-start rounded-card border border-line bg-surface p-5 md:w-auto md:border-0 md:bg-transparent md:p-0">
                  <ReviewCard review={r} clamp />
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link to="/reviews" className="btn btn-outline sm:px-8">Show all {data.summary.count} reviews</Link>
              <Link to="/reviews/new" className="btn btn-primary sm:px-8">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor" /></svg>
                Leave a review
              </Link>
            </motion.div>
          </>
        )}
      </motion.div>
    </section>
  );
}
