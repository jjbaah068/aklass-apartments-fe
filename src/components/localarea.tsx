import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, EASE } from "./reveal";

/* ---------------------------------------------------------------------------
   Place photos — drop a WebP into src/assets/images/places/ named after the
   place id (e.g. molineux.webp) and it is picked up automatically.
   No photo yet? The category icon is shown instead.
--------------------------------------------------------------------------- */
const PLACE_IMAGES = import.meta.glob("../assets/images/places/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function imageFor(id: string): string | undefined {
  return PLACE_IMAGES[`../assets/images/places/${id}.webp`];
}

type CategoryKey = "attractions" | "shopping" | "transport" | "health";

type Place = {
  id: string; 
  name: string;
  category: CategoryKey;
  miles: number;
  angle: number;
  blurb: string;
  query: string;
};

const CATEGORIES: { key: CategoryKey | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "attractions", label: "Things to do" },
  { key: "shopping", label: "Supermarkets" },
  { key: "transport", label: "Getting around" },
  { key: "health", label: "Health" },
];

const ICONS: Record<CategoryKey, string> = {
  attractions: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z",
  shopping: "M3 4h2l2.5 11h11L21 7H6.2M9 20h.01M18 20h.01",
  transport: "M6 3h12v13H6zM6 10h12M9 20l-2 2M15 20l2 2M9 13h.01M15 13h.01",
  health: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
};

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  attractions: "Things to do",
  shopping: "Supermarket",
  transport: "Getting around",
  health: "Health",
};

const PLACES: Place[] = [
  { id: "bp", name: "BP petrol station", category: "transport", miles: 1, angle: 300, blurb: "Fuel, snacks and essentials handy on the way in or out.", query: "BP petrol station Bushbury Wolverhampton" },
  { id: "aldi", name: "Aldi", category: "shopping", miles: 1.2, angle: 40, blurb: "The closest supermarket for a first-night shop.", query: "Aldi Wolverhampton WV10" },
//   { id: "northycote", name: "Northycote Farm", category: "attractions", miles: 1.5, angle: 150, blurb: "Farm and country park with open green space — good for a family walk.", query: "Northycote Farm Wolverhampton" },
//   { id: "lidl", name: "Lidl", category: "shopping", miles: 1.9, angle: 95, blurb: "Another budget-friendly option for groceries.", query: "Lidl Wolverhampton WV10" },
  { id: "morrisons", name: "Morrisons", category: "shopping", miles: 2, angle: 230, blurb: "Large supermarket for a bigger weekly shop.", query: "Morrisons Wolverhampton" },
  { id: "station", name: "Wolverhampton railway station", category: "transport", miles: 2.8, angle: 200, blurb: "Direct trains to Birmingham, London and beyond.", query: "Wolverhampton railway station" },
  { id: "racecourse", name: "Wolverhampton Racecourse", category: "attractions", miles: 2.8, angle: 330, blurb: "Horse racing, including evening meetings under floodlights.", query: "Wolverhampton Racecourse" },
  { id: "molineux", name: "Molineux Stadium", category: "attractions", miles: 3, angle: 250, blurb: "Home of Wolverhampton Wanderers ideal for match-day stays.", query: "Molineux Stadium Wolverhampton" },
  { id: "bentley", name: "Bentley Bridge Leisure Park", category: "attractions", miles: 3, angle: 60, blurb: "Cinema, restaurants and shops in one place for an easy evening out.", query: "Bentley Bridge Leisure Park Wednesfield" },
//   { id: "asda", name: "Asda", category: "shopping", miles: 3, angle: 120, blurb: "Big-store range including household and baby essentials.", query: "Asda Wolverhampton" },
  { id: "newcross", name: "New Cross Hospital", category: "health", miles: 3, angle: 15, blurb: "The main local hospital, with an A&E department.", query: "New Cross Hospital Wolverhampton" },
];

const MAX_MILES = 3.2; 
const RINGS = [1, 2, 3];

function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Position of a place on the ring map */
function position(p: Place) {
  const r = (p.miles / MAX_MILES) * 46;
  const rad = (p.angle * Math.PI) / 180;
  return { left: 50 + r * Math.sin(rad), top: 50 - r * Math.cos(rad) };
}

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`amenity-icon ${className}`} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}


function PlaceThumb({
  place,
  className,
  iconClassName,
  fallbackClassName,
}: {
  place: Place;
  className: string; 
  iconClassName: string;
  fallbackClassName: string; 
}) {
  const src = imageFor(place.id);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        width={160}
        height={160}
        className={`${className} object-cover`}
      />
    );
  }
  return (
    <span className={`${className} ${fallbackClassName} flex items-center justify-center`}>
      <Icon d={ICONS[place.category]} className={iconClassName} />
    </span>
  );
}

export default function LocalArea() {
  const id = useId();
  const [category, setCategory] = useState<CategoryKey | "all">("all");
  const [activeId, setActiveId] = useState<string>(PLACES[1].id);

  const visible = useMemo(
    () => PLACES.filter((p) => category === "all" || p.category === category).sort((a, b) => a.miles - b.miles),
    [category],
  );

  const active = PLACES.find((p) => p.id === activeId) ?? visible[0];
  const activeImage = active ? imageFor(active.id) : undefined;

  function chooseCategory(key: CategoryKey | "all") {
    setCategory(key);
    const first = PLACES.filter((p) => key === "all" || p.category === key).sort((a, b) => a.miles - b.miles)[0];
    if (first && key !== "all" && active?.category !== key) setActiveId(first.id);
  }

  return (
    <section aria-labelledby={`${id}-title`} className="bg-page py-16 md:py-24">
      <div className="container-site">
        {/* Heading */}
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div>
            <p className="eyebrow">Local area</p>
            <h2 id={`${id}-title`} className="mt-2 text-h2 md:text-[46px] md:leading-[1.1]">
              Everything within three miles
            </h2>
          </div>
          {/* <p className="max-w-[28rem] text-body text-ink-muted">
            A quiet residential street in Bushbury, with supermarkets nearby and the city centre,
            station and Molineux a short drive away. Full address sent after booking.
          </p> */}
        </Reveal>

        {/* Category filter */}
        <Reveal delay={0.1}>
          <div role="group" aria-label="Filter places" className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {CATEGORIES.map((c) => {
              const selected = category === c.key;
              const count = c.key === "all" ? PLACES.length : PLACES.filter((p) => p.category === c.key).length;
              return (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseCategory(c.key)}
                  className={`relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border-[1.5px] px-4 text-small font-semibold transition-colors ${
                    selected
                      ? "border-navy-900 text-white"
                      : "border-slate-300 bg-surface text-navy-900 hover:border-navy-900"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId={`${id}-pill`}
                      className="absolute inset-0 -z-0 rounded-pill bg-navy-900"
                      transition={{ duration: 0.35, ease: EASE }}
                    />
                  )}
                  <span className="relative">{c.label}</span>
                  <span className={`relative text-[12px] tabular-nums ${selected ? "text-navy-200" : "text-slate-600"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Ring map */}
          <Reveal delay={0.15} className="lg:col-span-6">
            <div className="card relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden bg-stone-100">
              {/* Rings */}
              {RINGS.map((m) => {
                const size = (m / MAX_MILES) * 92;
                return (
                  <div
                    key={m}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-stone-300"
                    style={{ width: `${size}%`, height: `${size}%` }}
                  >
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-stone-100 px-2 text-[11px] font-semibold text-slate-600">
                      {m} mi
                    </span>
                  </div>
                );
              })}

              {/* Line from the house to the active place */}
              {active && (
                <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full">
                  <motion.line
                    key={active.id}
                    x1="50"
                    y1="50"
                    x2={position(active).left}
                    y2={position(active).top}
                    stroke="var(--color-gold-500)"
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeWidth: 1.5 }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                </svg>
              )}

              {/* The house */}
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <span className="relative flex size-12 items-center justify-center rounded-full bg-navy-900 shadow-overlay">
                  <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-navy-900/20 motion-reduce:hidden" />
                  <svg viewBox="0 0 24 24" className="amenity-icon size-6 text-gold-200" aria-hidden="true">
                    <path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5" />
                  </svg>
                </span>
                <span className="mt-1.5 rounded-pill bg-surface px-2 py-0.5 text-[11px] font-semibold text-navy-900 shadow-raised">
                  Aklass
                </span>
              </div>

              {/* Place markers — round photo pins */}
              {PLACES.map((p) => {
                const pos = position(p);
                const shown = category === "all" || p.category === category;
                const isActive = p.id === active?.id;
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    aria-label={`${p.name}, ${p.miles} miles`}
                    aria-pressed={isActive}
                    tabIndex={shown ? 0 : -1}
                    disabled={!shown}
                    onClick={() => setActiveId(p.id)}
                    onMouseEnter={() => shown && setActiveId(p.id)}
                    className={`absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${
                      isActive ? "z-10" : ""
                    }`}
                    style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    animate={{ opacity: shown ? 1 : 0.15, scale: isActive ? 1.3 : 1 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <PlaceThumb
                      place={p}
                      className={`size-10 rounded-full shadow-raised transition-[box-shadow] ${
                        isActive
                          ? "ring-[3px] ring-gold-400 ring-offset-2 ring-offset-stone-100"
                          : "ring-2 ring-white"
                      }`}
                      fallbackClassName={isActive ? "bg-gold-400 text-navy-950" : "bg-navy-700 text-white"}
                      iconClassName="size-4 text-current"
                    />
                  </motion.button>
                );
              })}

              <p className="absolute bottom-3 left-3 right-3 text-center text-[11px] text-slate-600">
                Distances by road. Positions are illustrative, not directions.
              </p>
            </div>

            {/* Active place detail  */}
            <div aria-live="polite" className="mx-auto mt-4 max-w-[560px]">
              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="card overflow-hidden"
                  >
                    {activeImage && (
                      <motion.img
                        src={activeImage}
                        alt={active.name}
                        width={800}
                        height={400}
                        decoding="async"
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="aspect-[2/1] w-full object-cover"
                      />
                    )}
                    <div className="flex flex-wrap items-center gap-4 p-5">
                      {!activeImage && (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-card bg-navy-50">
                          <Icon d={ICONS[active.category]} className="size-6" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gold-700">
                          {CATEGORY_LABEL[active.category]} · {active.miles} mi
                        </p>
                        <p className="mt-0.5 font-semibold text-navy-900">{active.name}</p>
                        <p className="mt-1 text-small text-ink-muted">{active.blurb}</p>
                      </div>
                      <a
                        href={mapsUrl(active.query)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        Open in Maps
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M7 17L17 7M9 7h8v8" />
                        </svg>
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          {/* List */}
          <Reveal delay={0.2} className="lg:col-span-6">
            <ul className="flex flex-col">
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((p) => {
                  const isActive = p.id === active?.id;
                  return (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="border-b border-line"
                    >
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveId(p.id)}
                        onMouseEnter={() => setActiveId(p.id)}
                        onFocus={() => setActiveId(p.id)}
                        className={`group flex w-full items-center gap-4 rounded-control px-3 py-3 text-left transition-colors ${
                          isActive ? "bg-surface shadow-raised" : "hover:bg-stone-100"
                        }`}
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-control">
                          <PlaceThumb
                            place={p}
                            className={`size-14 rounded-control transition-transform duration-500 group-hover:scale-105 ${
                              isActive ? "ring-2 ring-inset ring-gold-400" : ""
                            }`}
                            fallbackClassName={isActive ? "bg-gold-400" : "bg-navy-50"}
                            iconClassName="size-5"
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-navy-900">{p.name}</span>
                          <span className="block text-[13px] text-slate-600">{CATEGORY_LABEL[p.category]}</span>
                        </span>

                        {/* Distance bar */}
                        <span className="hidden w-28 sm:block" aria-hidden="true">
                          <span className="block h-1.5 overflow-hidden rounded-pill bg-slate-100">
                            <motion.span
                              className={`block h-full rounded-pill ${isActive ? "bg-gold-500" : "bg-navy-300"}`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(p.miles / MAX_MILES) * 100}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: EASE }}
                            />
                          </span>
                        </span>

                        <span className="w-14 shrink-0 text-right font-semibold tabular-nums text-navy-900">
                          {p.miles} mi
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}