import { useId, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { fadeUp, imageReveal, stagger, withDelay } from "./reveal";
import hero1 from '../assets/images/herobg.webp'


/* Images*/
const HERO_IMAGE = hero1;


const MAX_GUESTS = 7;
const BOOK_PATH = "/book";

const FACTS = [
  { label: "4 bedrooms", d: "M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 21v-3M21 21v-3M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M12 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" },
  { label: "People 7", d: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { label: "2 bathrooms", d: "M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0M7 20l-1 2M17 20l1 2" },
  { label: "Free parking", d: "M4 3h16v18H4zM9 17V7h4a3 3 0 0 1 0 6H9" },
];

/* yyyy-mm-dd in local time  */
function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return toISODate(new Date(y, m - 1, d + days));
}

export default function Hero() {
  const navigate = useNavigate();
  const id = useId();
  const today = useMemo(() => toISODate(new Date()), []);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");

  const minCheckOut = checkIn ? addDays(checkIn, 1) : addDays(today, 1);

  function handleCheckIn(value: string) {
    setCheckIn(value);
    setError("");
    // Keep check-out valid if the new check-in moves past it
    if (checkOut && value && checkOut <= value) setCheckOut(addDays(value, 1));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError("Choose your check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    navigate(`${BOOK_PATH}?${params.toString()}`);
  }

  return (
    <section aria-labelledby={`${id}-title`} className="relative bg-page">
      <div className="container-site grid items-center gap-8 pb-10 pt-4 md:pt-8 lg:grid-cols-12 lg:gap-12 lg:pb-16 lg:pt-12">
        {/* Photo — first on mobile so the house is the first thing you see */}
        <div className="relative lg:order-2 lg:col-span-7">
          {/* Wrapper clips the settle-in zoom to the photo's corners */}
          <div className="overflow-hidden rounded-photo">
            <motion.img
              src={HERO_IMAGE}
              alt="Bright living room with a grey velvet sofa, breakfast bar and garden window"
              width={1600}
              height={1200}
              fetchPriority="high"
              decoding="async"
              initial="hidden"
              animate="show"
              variants={imageReveal}
              className="photo aspect-[4/3] w-full lg:aspect-auto lg:h-[min(72vh,640px)]"
            />
          </div>

          {/* Exterior inset: shows it's a whole house, not a room */}
          {/* <figure className="absolute -bottom-6 left-4 hidden w-44 overflow-hidden rounded-card bg-surface p-1.5 shadow-overlay sm:block lg:-left-10 lg:bottom-10 lg:w-52">
            <img
              src={EXTERIOR_IMAGE}
              alt="Front of the house with private driveway parking"
              width={416}
              height={312}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-[8px] object-cover"
            />
            <figcaption className="px-1.5 pb-1 pt-2 text-[13px] font-semibold leading-snug text-navy-900">
              The whole house is yours
            </figcaption>
          </figure> */}
        </div>

        {/* Copy — each line rises in, one after another */}
        <motion.div
          className="lg:order-1 lg:col-span-5"
          initial="hidden"
          animate="show"
          variants={stagger(0.1, 0.15)}
        >
          <motion.p variants={fadeUp} className="eyebrow">Bushbury · Wolverhampton WV10</motion.p>

          <motion.h1 variants={fadeUp} id={`${id}-title`} className="text-display-hero mt-3 text-navy-900">
            Your Comfort, Our Priority
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-4 max-w-[34rem] text-body-lg text-ink-muted">
            A home away from home, an entire four-bedroom house for up to seven guests.
            No shared spaces, no other guests. Just you.
          </motion.p>

          <motion.ul
            variants={stagger(0.06)}
            className="mt-6 flex flex-wrap gap-x-5 gap-y-3"
            aria-label="Key facts"
          >
            {FACTS.map((f) => (
              <motion.li
                key={f.label}
                variants={fadeUp}
                className="flex items-center gap-2 text-small font-medium text-navy-900"
              >
                <svg viewBox="0 0 24 24" className="amenity-icon size-5" aria-hidden="true">
                  <path d={f.d} />
                </svg>
                {f.label}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Booking bar — spans the full width under both columns */}
        <motion.form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Check availability"
          initial="hidden"
          animate="show"
          variants={withDelay(fadeUp, 0.55)}
          className="card-overlay relative z-10 p-3 sm:p-4 lg:order-3 lg:col-span-12 lg:-mt-2"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_auto]">
            <div className="field-group">
              <label htmlFor={`${id}-in`} className="field-label">Check-in</label>
              <input
                id={`${id}-in`}
                type="date"
                className="field"
                min={today}
                value={checkIn}
                onChange={(e) => handleCheckIn(e.target.value)}
                aria-invalid={!!error && !checkIn}
                aria-describedby={error ? `${id}-err` : undefined}
              />
            </div>

            <div className="field-group">
              <label htmlFor={`${id}-out`} className="field-label">Check-out</label>
              <input
                id={`${id}-out`}
                type="date"
                className="field"
                min={minCheckOut}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setError("");
                }}
                aria-invalid={!!error && (!checkOut || checkOut <= checkIn)}
                aria-describedby={error ? `${id}-err` : undefined}
              />
            </div>

            <div className="field-group sm:col-span-2 lg:col-span-1">
              <label htmlFor={`${id}-guests`} className="field-label">Guests</label>
              <select
                id={`${id}-guests`}
                className="field"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button type="submit" className="btn btn-primary btn-block lg:w-auto lg:px-8">
                Check availability
              </button>
            </div>
          </div>

          <div aria-live="polite" className="min-h-0">
            {error ? (
              <p id={`${id}-err`} className="field-error mt-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" />
                </svg>
                {error}
              </p>
            ) : (
              <p className="mt-3 text-[13px] text-ink-subtle">
                Check-in 3:00–7:00 PM · Check-out by 11:00 AM
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
}