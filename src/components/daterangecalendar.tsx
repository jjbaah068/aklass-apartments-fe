import { useMemo, useState } from "react";
import { addDays, fromISO, nightsBetween, rangeIsFree, toISO, todayISO } from "../lib/booking";

type Props = {
  checkIn: string | null;
  checkOut: string | null;
  blocked: Set<string>;
  minNights: number;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  /** How many months to show side by side on wide screens (mobile always shows 1). */
  months?: 1 | 2;
};

const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthStart(iso: string) {
  const d = fromISO(iso);
  return toISO(new Date(d.getFullYear(), d.getMonth(), 1));
}
function addMonths(iso: string, n: number) {
  const d = fromISO(iso);
  return toISO(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

type DayState = "outside" | "past" | "available" | "unavailable" | "checkout-only" | "min-stay" | "start" | "end" | "in-range";

export default function DateRangeCalendar({ checkIn, checkOut, blocked, minNights, onChange, months = 2 }: Props) {
  const today = todayISO();
  const [view, setView] = useState(() => monthStart(checkIn ?? today));
  const [hover, setHover] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const choosingCheckOut = !!checkIn && !checkOut;

  /** First booked night after check-in — check-out can be ON that date but not after it. */
  const lastPossibleCheckOut = useMemo(() => {
    if (!checkIn) return null;
    for (let i = 1; i <= 365; i++) {
      const night = addDays(checkIn, i);
      if (blocked.has(night)) return night;
    }
    return null;
  }, [checkIn, blocked]);

  function stateOf(day: string): DayState {
    if (day < today) return "past";
    if (checkIn && day === checkIn) return "start";
    if (checkOut && day === checkOut) return "end";

    const end = checkOut ?? (choosingCheckOut ? hover : null);
    if (checkIn && end && day > checkIn && day < end && (checkOut || isValidCheckOut(end))) return "in-range";
    if (checkIn && hover && choosingCheckOut && day === hover && isValidCheckOut(day)) return "end";

    if (choosingCheckOut && checkIn && day > checkIn) {
      if (lastPossibleCheckOut && day > lastPossibleCheckOut) return "unavailable";
      if (nightsBetween(checkIn, day) < minNights) return "min-stay";
      return "available";
    }
    if (blocked.has(day)) return blocked.has(addDays(day, -1)) ? "unavailable" : "checkout-only";
    return "available";
  }

  function isValidCheckOut(day: string) {
    if (!checkIn || day <= checkIn) return false;
    return nightsBetween(checkIn, day) >= minNights && rangeIsFree(checkIn, day, blocked);
  }

  function pick(day: string) {
    setNotice("");
    if (choosingCheckOut && checkIn) {
      if (day > checkIn) {
        if (!rangeIsFree(checkIn, day, blocked)) {
          setNotice("Some of those nights are already booked. Choose an earlier check-out date.");
          return;
        }
        if (nightsBetween(checkIn, day) < minNights) {
          setNotice(`The minimum stay is ${minNights} night${minNights === 1 ? "" : "s"}.`);
          return;
        }
        onChange(checkIn, day);
        return;
      }
      // clicked on/before check-in → start again from that day
    }
    if (blocked.has(day)) {
      setNotice("That night is already booked. Choose another check-in date.");
      return;
    }
    onChange(day, null);
  }

  const shown = Array.from({ length: months }, (_, i) => addMonths(view, i));
  const canGoBack = view > monthStart(today);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="btn-icon disabled:opacity-30"
          onClick={() => setView(addMonths(view, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <p className="text-small font-semibold text-ink-muted" aria-live="polite">
          {checkIn && !checkOut ? "Now choose your check-out date" : !checkIn ? "Choose your check-in date" : " "}
        </p>
        <button type="button" className="btn-icon" onClick={() => setView(addMonths(view, 1))} aria-label="Next month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>

      <div className={`grid gap-8 ${months === 2 ? "md:grid-cols-2" : ""}`}>
        {shown.map((m, mi) => {
          const first = fromISO(m);
          const label = first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
          const offset = (first.getDay() + 6) % 7; // Monday first
          const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
          return (
            <div key={m} className={mi > 0 ? "hidden md:block" : ""}>
              <p className="mb-2 text-center font-semibold text-navy-900">{label}</p>
              <div className="cal-grid" role="grid" aria-label={label}>
                {DOW.map((d) => <span key={d} className="cal-dow" role="columnheader">{d}</span>)}
                {Array.from({ length: offset }, (_, i) => <span key={`x${i}`} aria-hidden="true" />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = toISO(new Date(first.getFullYear(), first.getMonth(), i + 1));
                  const s = stateOf(day);
                  const disabled = s === "past" || s === "unavailable" || (s === "checkout-only" && !choosingCheckOut);
                  const stateAttr =
                    s === "past" || s === "unavailable" ? "unavailable" : s === "min-stay" ? "available" : s;
                  const name = fromISO(day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
                  const desc =
                    s === "start" ? "check-in" : s === "end" ? "check-out" : s === "in-range" ? "in your stay" :
                    s === "unavailable" ? "unavailable" : s === "checkout-only" ? "check-out only" :
                    s === "min-stay" ? `below ${minNights}-night minimum` : s === "past" ? "unavailable" : "available";
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`cal-day ${s === "min-stay" ? "text-slate-400" : ""} ${day === today && s === "available" ? "font-bold underline underline-offset-4" : ""}`}
                      data-state={stateAttr}
                      disabled={disabled}
                      aria-label={`${name}, ${desc}`}
                      aria-pressed={s === "start" || s === "end"}
                      onClick={() => pick(day)}
                      onMouseEnter={() => setHover(day)}
                      onMouseLeave={() => setHover(null)}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {notice && (
        <p role="alert" className="field-error mt-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01" /></svg>
          {notice}
        </p>
      )}

      <div className="cal-legend mt-4">
        <span><span className="cal-legend__swatch bg-navy-900" />Selected</span>
        <span><span className="cal-legend__swatch bg-navy-100" />Your stay</span>
        <span><span className="cal-legend__swatch bg-slate-100" />Unavailable</span>
        <span><span className="cal-legend__swatch" style={{ background: "linear-gradient(135deg,#fff 50%,#d9dde1 50%)", boxShadow: "inset 0 0 0 1px #d9dde1" }} />Check-out only</span>
        <span className="ml-auto text-ink-subtle">Minimum stay {minNights} night{minNights === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}