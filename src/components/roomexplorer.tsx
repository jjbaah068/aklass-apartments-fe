import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, EASE } from "./reveal";
import { ROOMS } from "../roomsdata";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export default function RoomExplorer() {
  const id = useId();
  const [roomIndex, setRoomIndex] = useState(0);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const room = ROOMS[roomIndex];

  // New room → back to first photo
  useEffect(() => {
    setSlide(0);
    trackRef.current?.scrollTo({ left: 0 });
    thumbsRef.current?.scrollTo({ left: 0 });
  }, [roomIndex]);

  // Keep the active thumbnail centred in its strip (scrolls the strip only, never the page)
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[slide] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: "smooth" });
  }, [slide]);

  if (!room) return null; // no photos added yet

  const count = room.photos.length;

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(count - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setSlide(next);
  }

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
  }

  function onCarouselKey(e: KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(slide + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(slide - 1); }
  }

  /* Arrow keys move between tabs (standard tab pattern) */
  function onTabsKey(e: KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (roomIndex + (e.key === "ArrowRight" ? 1 : -1) + ROOMS.length) % ROOMS.length;
    setRoomIndex(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <section id="rooms" aria-labelledby={`${id}-title`} className="scroll-mt-32">
      <Reveal>
        <p className="eyebrow">Room by room</p>
        <h2 id={`${id}-title`} className="mt-2 text-h2 md:text-[42px] md:leading-[1.1]">
          Take a look around
        </h2>
      </Reveal>

      {/* Room tabs */}
      <Reveal delay={0.08}>
        <div
          role="tablist"
          aria-label="Rooms"
          onKeyDown={onTabsKey}
          className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {ROOMS.map((r, i) => {
            const selected = i === roomIndex;
            return (
              <button
                key={r.key}
                id={`${id}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setRoomIndex(i)}
                className={`relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border-[1.5px] px-4 text-small font-semibold transition-colors ${
                  selected ? "border-navy-900 text-white" : "border-slate-300 bg-surface text-navy-900 hover:border-navy-900"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId={`${id}-tab-pill`}
                    className="absolute inset-0 rounded-pill bg-navy-900"
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
                <span className="relative">{r.tab}</span>
                <span className={`relative text-[12px] tabular-nums ${selected ? "text-navy-200" : "text-slate-600"}`}>
                  {r.photos.length}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Panel */}
      <Reveal delay={0.12}>
        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${roomIndex}`}
          className="card mt-6 overflow-hidden"
        >
          {/* Carousel */}
          <div
            className="group relative"
            role="region"
            aria-roledescription="carousel"
            aria-label={`${room.title} photos`}
            tabIndex={0}
            onKeyDown={onCarouselKey}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={room.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div
                  ref={trackRef}
                  onScroll={onScroll}
                  className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {room.photos.map((p, i) => (
                    <div
                      key={p.src}
                      className="w-full shrink-0 snap-center"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${i + 1} of ${count}`}
                    >
                      <img
                        src={p.src}
                        alt={p.alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="aspect-[4/3] w-full bg-slate-100 object-cover sm:aspect-[16/10]"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(slide - 1)}
                  disabled={slide === 0}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-raised transition-opacity hover:bg-white disabled:opacity-0 sm:flex"
                >
                  <Chevron dir="left" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(slide + 1)}
                  disabled={slide === count - 1}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-raised transition-opacity hover:bg-white disabled:opacity-0 sm:flex"
                >
                  <Chevron dir="right" />
                </button>
              </>
            )}

            {/* Counter */}
            <span
              aria-live="polite"
              className="pointer-events-none absolute bottom-3 right-3 rounded-pill bg-navy-950/70 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white"
            >
              {slide + 1} / {count}
            </span>
          </div>

          {/* Thumbnails */}
          {count > 1 && (
            <div
              ref={thumbsRef}
              className="relative flex gap-2 overflow-x-auto bg-stone-100 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {room.photos.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === slide}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-[6px] transition-opacity sm:h-16 sm:w-24 ${
                    i === slide ? "opacity-100 ring-2 ring-navy-900 ring-offset-2 ring-offset-stone-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={p.src} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Text */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={room.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1.4fr_1fr] md:gap-10"
            >
              <div>
                <h3 className="text-h3">{room.title}</h3>
                <p className="mt-2 text-body text-ink-muted">{room.body}</p>
              </div>
              {room.features.length > 0 && (
                <ul className="flex flex-col gap-2.5 md:border-l md:border-line md:pl-8">
                  {room.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-small font-medium text-navy-900">
                      <svg viewBox="0 0 24 24" className="amenity-icon size-[18px] text-gold-600" aria-hidden="true">
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}