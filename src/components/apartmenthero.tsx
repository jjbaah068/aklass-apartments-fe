import { useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { EASE, fadeUp, stagger } from "./reveal";
import { HERO_PHOTOS, TOTAL_PHOTOS } from "../apartmentPhotos";

const FACTS = [
  { label: "4 bedrooms", d: "M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 21v-3M21 21v-3M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M12 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" },
  { label: "Sleeps 7", d: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { label: "2 bathrooms", d: "M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0M7 20l-1 2M17 20l1 2" },
  { label: "2 living rooms", d: "M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 18v2M19 18v2" },
  { label: "Private garden", d: "M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16zM4 21l8-8" },
  { label: "Parking", d: "M4 3h16v18H4zM9 17V7h4a3 3 0 0 1 0 6H9" },
];

type Props = {
  /** Opens the photo viewer at a given photo (wire up once PhotoViewer exists). */
  onOpenPhoto?: (index: number) => void;
  /** Opens the photo viewer showing all photos. */
  onOpenAll?: () => void;
};

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
    </svg>
  );
}

export default function ApartmentHero({ onOpenPhoto, onOpenAll }: Props) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  function handleTrackScroll() {
    const el = trackRef.current;
    if (!el) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
  }

  const [main, ...rest] = HERO_PHOTOS;

  return (
    <section aria-labelledby={`${id}-title`} className="bg-page">
      {/* Title strip */}
      <motion.div
        className="container-site pb-6 pt-6 md:pb-8 md:pt-10"
        initial="hidden"
        animate="show"
        variants={stagger(0.08, 0.05)}
      >
        {/* <motion.nav variants={fadeUp} aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            <li><Link to="/" className="text-slate-600 no-underline hover:text-navy-900">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-gold-700">The Apartment</li>
          </ol>
        </motion.nav> */}

        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <motion.h1 variants={fadeUp} id={`${id}-title`} className="text-h1 text-navy-900 md:text-[56px] md:leading-[1.05]">
              The Apartment
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-2 text-body-lg text-ink-muted">
              Entire home · Bushbury, Wolverhampton WV10
            </motion.p>
          </div>

          <motion.ul
            variants={stagger(0.05)}
            aria-label="Key facts"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:justify-end md:overflow-visible md:px-0"
          >
            {FACTS.map((f) => (
              <motion.li
                key={f.label}
                variants={fadeUp}
                className="flex shrink-0 items-center gap-2 rounded-pill border border-line-strong bg-surface px-3.5 py-2 text-small font-medium text-navy-900"
              >
                <svg viewBox="0 0 24 24" className="amenity-icon size-[18px]" aria-hidden="true"><path d={f.d} /></svg>
                {f.label}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* ---------- Desktop / tablet: mosaic ---------- */}
      <div className="container-site hidden md:block">
        <div className="relative grid h-[min(62vh,560px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-card">
          {/* Large tile */}
          <motion.button
            type="button"
            onClick={() => onOpenPhoto?.(0)}
            aria-label={`Open photo: ${main.alt}`}
            className="group relative col-span-2 row-span-2 overflow-hidden bg-slate-200"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <img
              src={main.src}
              alt=""
              fetchPriority="high"
              decoding="async"
              className="size-full object-cover transition-transform duration-700 ease-[var(--ease-calm)] group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/10" />
          </motion.button>

          {/* Four small tiles */}
          {rest.map((p, i) => (
            <motion.button
              key={p.src}
              type="button"
              onClick={() => onOpenPhoto?.(i + 1)}
              aria-label={`Open photo: ${p.alt}`}
              className="group relative overflow-hidden bg-slate-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.08 }}
            >
              <img
                src={p.src}
                alt=""
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                className="size-full object-cover transition-transform duration-700 ease-[var(--ease-calm)] group-hover:scale-[1.05]"
              />
              <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/10" />
            </motion.button>
          ))}

          {/* View all */}
          {/* <motion.button
            type="button"
            onClick={() => onOpenAll?.()}
            className="btn btn-sm absolute bottom-4 right-4 border-white bg-white/95 text-navy-900 shadow-raised backdrop-blur hover:bg-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
          >
            <GridIcon />
            View all photos
          </motion.button> */}
        </div>
      </div>

      {/* ---------- Mobile: swipe gallery ---------- */}
      <div className="relative md:hidden">
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label="Apartment photos"
        >
          {HERO_PHOTOS.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => onOpenPhoto?.(i)}
              aria-label={`Photo ${i + 1} of ${HERO_PHOTOS.length}: ${p.alt}`}
              className="w-full shrink-0 snap-center"
            >
              <img
                src={p.src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Counter + view all */}
        <span
          aria-live="polite"
          className="pointer-events-none absolute bottom-3 right-3 rounded-pill bg-navy-950/70 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white"
        >
          {slide + 1} / {HERO_PHOTOS.length}
        </span>
        <button
          type="button"
          onClick={() => onOpenAll?.()}
          className="btn btn-sm absolute bottom-3 left-3 border-white bg-white/95 text-navy-900 shadow-raised"
        >
          <GridIcon />
          All {TOTAL_PHOTOS} photos
        </button>

        {/* Dots */}
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {HERO_PHOTOS.map((p, i) => (
            <span
              key={p.src}
              className={`h-1.5 rounded-pill transition-all duration-300 ${i === slide ? "w-5 bg-navy-900" : "w-1.5 bg-slate-300"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}