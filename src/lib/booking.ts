
export const BOOKING = {
  maxGuests: 7,
  minNights: 2,
  holdMinutes: 30,
};

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const IS_DEMO = !API_URL;


export function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fromISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function todayISO() {
  return toISO(new Date());
}

export function nightsBetween(checkIn: string, checkOut: string) {
  return Math.round((fromISO(checkOut).getTime() - fromISO(checkIn).getTime()) / 86_400_000);
}


export function formatDateUK(iso: string) {
  return fromISO(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).replace(",", "");
}


export function formatDateShort(iso: string) {
  return fromISO(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
export function formatGBP(amount: number) {
  return GBP.format(amount);
}

/** True if every night from checkIn up to (not including) checkOut is free. */
export function rangeIsFree(checkIn: string, checkOut: string, blocked: Set<string>) {
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) if (blocked.has(d)) return false;
  return true;
}


/* ---------- Prices (API section 2.2 / 2.3) ---------- */

export type PublicSettings = {
  minNights: number;
  maxNights: number;
  maxGuests: number;
  checkInFrom: string;
  checkOutBy: string;
  nightlyRate: number;
  /** null = Fri/Sat cost the same as other nights. */
  weekendRate: number | null;
  cleaningFee: number;
  /** A percent of 0 means that discount is switched off. */
  discounts: {
    midweekPercent: number;
    weeklyPercent: number;
    weeklyFromNights: number;
    monthlyPercent: number;
    monthlyFromNights: number;
  };
};

/** Demo numbers. They match the live backend's defaults so demo prices look the same. */
export const DEMO_SETTINGS: PublicSettings = {
  minNights: 2,
  maxNights: 60,
  maxGuests: 7,
  checkInFrom: "15:00",
  checkOutBy: "11:00",
  nightlyRate: 160,
  weekendRate: null,
  cleaningFee: 60,
  discounts: { midweekPercent: 5, weeklyPercent: 10, weeklyFromNights: 7, monthlyPercent: 15, monthlyFromNights: 28 },
};

/** Badge texts like "5% off Mon–Thu nights". A discount at 0% is switched off, so no badge. */
export function discountBadges(s: PublicSettings): string[] {
  const d = s.discounts;
  const out: string[] = [];
  if (d.midweekPercent > 0) out.push(`${d.midweekPercent}% off Mon–Thu nights`);
  if (d.weeklyPercent > 0) out.push(`${d.weeklyPercent}% off weekly stays`);
  if (d.monthlyPercent > 0) out.push(`${d.monthlyPercent}% off monthly stays`);
  return out;
}

/** "£160" without pence when it's a whole number. */
export function formatGBPShort(amount: number) {
  return Number.isInteger(amount) ? `£${amount.toLocaleString("en-GB")}` : formatGBP(amount);
}

/** "3:00 PM" from "15:00". */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return hhmm;
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export type QuoteDiscount = {
  type: "midweek" | "weekly" | "monthly" | (string & {});
  label: string;
  percent: number;
  amount: number;
};

export type QuoteLine = {
  date: string;
  /** Price of that night before any discount. */
  fullPrice: number;
  /** Price after the midweek discount (weekly/monthly comes off the total). */
  price: number;
  weekend: boolean;
  midweek: boolean;
};

export type Quote = {
  nights: number;
  /** Full price per night (average), before discounts. */
  nightlyRate: number;
  accommodationBeforeDiscounts: number;
  discounts: QuoteDiscount[];
  discountTotal: number;
  /** Accommodation AFTER discounts. */
  accommodation: number;
  cleaningFee: number;
  total: number;
  currency: "GBP";
  lines: QuoteLine[];
};

export type GuestDetails = {
  fullName: string;
  email: string;
  phoneCountry: string;
  phone: string;
  purpose: string;
  arrivalTime: string;
};

/* ---------- ID verification ---------- */

export type IdType = "passport" | "driving_licence" | "national_id";

export const ID_TYPES: { value: IdType; label: string; hint: string; needsBack: boolean }[] = [
  { value: "passport", label: "Passport", hint: "The photo page", needsBack: false },
  { value: "driving_licence", label: "Driving licence", hint: "Photocard, front and back", needsBack: true },
  { value: "national_id", label: "National ID card", hint: "Front and back", needsBack: true },
];

export const ID_RULES = {
  maxBytes: 10 * 1024 * 1024, // 10 MB
  accept: ["image/jpeg", "image/png", "application/pdf"],
  acceptAttr: "image/jpeg,image/png,application/pdf",
  deleteAfterDays: 30,
};

export type IdUpload = {
  type: IdType;
  front: File;
  back: File | null;
  consent: true;
};

/** Returns an error message, or null if the file is fine. */
export function checkIdFile(file: File): string | null {
  if (!ID_RULES.accept.includes(file.type)) return "Upload a JPG, PNG or PDF file.";
  if (file.size > ID_RULES.maxBytes) return "That file is over 10 MB. Try a smaller photo.";
  if (file.size < 20 * 1024) return "That file looks too small to read. Take a clearer photo.";
  return null;
}

export type HoldRequest = {
  checkIn: string;
  checkOut: string;
  guests: number;
  details: GuestDetails;
  idType: IdType;
  agreedToTerms: true;
  agreedToIdCheck: true;
  /** The guest's earlier hold (if they went back and changed something). The server releases it first. */
  previousRef?: string;
};

export type Hold = {
  bookingRef: string;
  /** ISO date-time. Show a countdown to this. */
  holdExpiresAt: string;
  /** Always null now: the payment link comes from startCheckout(). Don't use it. */
  checkoutUrl: string | null;
  /** The server's final price for this hold. */
  quote: Quote;
};

/* ---------- Booking status (API section 2.8) ---------- */

export type BookingStatus = "hold" | "id_review" | "needs_review" | "confirmed" | "cancelled";
export type PaymentState = "paid" | "pending" | "failed" | "not_started";

export type BookingStatusResponse = {
  ref: string;
  status: BookingStatus;
  payment: PaymentState;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
};

/* ---------- Errors (API section 3) ---------- */

export type BookingErrorCode =
  // Prices / dates
  | "INVALID_DATES" | "PAST_DATE" | "MIN_STAY" | "MAX_STAY" | "MAX_GUESTS" | "RANGE_TOO_LONG" | "DATES_TAKEN"
  // Hold / ID
  | "INVALID" | "ID_INVALID" | "HOLD_EXPIRED" | "NOT_FOUND"
  // Payment
  | "ID_REQUIRED" | "ALREADY_PAID" | "PAYMENT_PROVIDER_ERROR" | "PAYMENTS_NOT_SET_UP"
  // Anywhere
  | "TOO_MANY_REQUESTS" | "SERVER_ERROR" | "BAD_REQUEST" | "FORBIDDEN_ORIGIN"
  // Frontend only
  | "NETWORK" | "UNKNOWN";

export class BookingError extends Error {
  code: BookingErrorCode;
  /** HTTP status (0 for network errors). */
  status: number;
  /** Form errors keyed by field path, e.g. { "details.email": "Invalid email" }. */
  fields?: Record<string, string>;
  constructor(code: BookingErrorCode, message: string, status = 0, fields?: Record<string, string>) {
    super(message);
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

const NETWORK_MESSAGE = "We couldn't connect. Check your internet connection and try again.";

/** Turns a failed response into a BookingError, always keeping the server's message. */
async function errorFrom(res: Response, fallback: string): Promise<BookingError> {
  const body = await res.json().catch(() => ({}));
  return new BookingError(body.code ?? "UNKNOWN", body.message ?? fallback, res.status, body.fields);
}


/**
 * Calls the API. No timeout on purpose: Render's free server can take about a
 * minute to wake up, so callers show a loading state instead.
 */
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Only send Content-Type when there is a JSON body (keeps GETs simple for CORS).
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init?.body) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new BookingError("NETWORK", NETWORK_MESSAGE);
  }
  if (!res.ok) throw await errorFrom(res, "Something went wrong. Please try again.");
  if (res.status === 204) return undefined as T;
  return (await res.json().catch(() => ({}))) as T;
}

const enc = encodeURIComponent;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Demo: a few booked nights relative to today so the calendar looks real. */
function demoBlocked(): string[] {
  const t = todayISO();
  const ranges: [number, number][] = [[3, 6], [12, 14], [24, 27], [40, 44], [58, 60]];
  return ranges.flatMap(([a, b]) => Array.from({ length: b - a }, (_, i) => addDays(t, a + i)));
}

/** Nights that can't be booked (direct bookings, Airbnb, manual blocks, active holds). */
export async function getBlockedNights(from: string, to: string): Promise<string[]> {
  if (IS_DEMO) {
    await wait(300);
    return demoBlocked();
  }
  const data = await api<{ nights: string[] }>(`/availability?from=${from}&to=${to}`);
  return data.nights;
}

/** Rounds to whole pence, like the server (which works in pence). */
const pence = (n: number) => Math.round(n * 100) / 100;

/**
 * DEMO ONLY: mirrors the server's pricing rules (API section 2.3) so demo prices match.
 * - Mon–Thu NIGHTS get the midweek % off; Fri–Sun nights are full price.
 * - 28+ nights: monthly % off the nights' total; otherwise 7+ nights: weekly %. Never both.
 *   Applied after the midweek discount.
 * - The cleaning fee is charged once and never discounted.
 * With the live API, always show the server's /quote instead.
 */
export function demoQuote(checkIn: string, checkOut: string, guests: number, s: PublicSettings = DEMO_SETTINGS): Quote {
  const isDay = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  const nights = isDay(checkIn) && isDay(checkOut) ? nightsBetween(checkIn, checkOut) : 0;
  if (nights <= 0) throw new BookingError("INVALID_DATES", "Choose a check-out date after your check-in date.", 400);
  if (checkIn < todayISO()) throw new BookingError("PAST_DATE", "Check-in can't be in the past.", 400);
  if (nights < s.minNights) throw new BookingError("MIN_STAY", `The minimum stay is ${s.minNights} nights.`, 400);
  if (nights > s.maxNights) throw new BookingError("MAX_STAY", `The maximum stay is ${s.maxNights} nights.`, 400);
  if (guests < 1 || guests > s.maxGuests) throw new BookingError("MAX_GUESTS", `The apartment sleeps up to ${s.maxGuests} guests.`, 400);

  const d = s.discounts;
  const lines: QuoteLine[] = [];
  let midweekNights = 0;
  for (let date = checkIn; date < checkOut; date = addDays(date, 1)) {
    const day = fromISO(date).getDay(); // 0 Sun … 6 Sat
    const weekend = day === 5 || day === 6; // Fri and Sat nights
    const midweek = day >= 1 && day <= 4; // Mon–Thu nights
    const fullPrice = weekend && s.weekendRate != null ? s.weekendRate : s.nightlyRate;
    const discounted = midweek && d.midweekPercent > 0;
    if (discounted) midweekNights++;
    lines.push({ date, fullPrice, price: discounted ? pence(fullPrice * (1 - d.midweekPercent / 100)) : fullPrice, weekend, midweek });
  }

  const before = pence(lines.reduce((sum, l) => sum + l.fullPrice, 0));
  const afterMidweek = pence(lines.reduce((sum, l) => sum + l.price, 0));
  const discounts: QuoteDiscount[] = [];
  if (midweekNights > 0) {
    discounts.push({
      type: "midweek",
      label: `Monday–Thursday discount (${midweekNights} ${midweekNights === 1 ? "night" : "nights"})`,
      percent: d.midweekPercent,
      amount: pence(before - afterMidweek),
    });
  }
  if (d.monthlyPercent > 0 && nights >= d.monthlyFromNights) {
    discounts.push({ type: "monthly", label: "Monthly stay discount", percent: d.monthlyPercent, amount: pence((afterMidweek * d.monthlyPercent) / 100) });
  } else if (d.weeklyPercent > 0 && nights >= d.weeklyFromNights) {
    discounts.push({ type: "weekly", label: "Weekly stay discount", percent: d.weeklyPercent, amount: pence((afterMidweek * d.weeklyPercent) / 100) });
  }

  const discountTotal = pence(discounts.reduce((sum, x) => sum + x.amount, 0));
  const accommodation = pence(before - discountTotal);
  return {
    nights,
    nightlyRate: pence(before / nights),
    accommodationBeforeDiscounts: before,
    discounts,
    discountTotal,
    accommodation,
    cleaningFee: s.cleaningFee,
    total: pence(accommodation + s.cleaningFee),
    currency: "GBP",
    lines,
  };
}

/** The price of a stay. Always show THIS price (the server's, when live). */
export async function getQuote(checkIn: string, checkOut: string, guests: number): Promise<Quote> {
  if (IS_DEMO) {
    await wait(200);
    return demoQuote(checkIn, checkOut, guests);
  }
  return api<Quote>(`/quote?checkIn=${enc(checkIn)}&checkOut=${enc(checkOut)}&guests=${enc(String(guests))}`);
}

/** Stay rules, "from £160" and the discount badges (API section 2.2). */
export async function getPublicSettings(): Promise<PublicSettings> {
  if (IS_DEMO) return DEMO_SETTINGS;
  return api<PublicSettings>("/settings/public");
}

export async function createHold(req: HoldRequest): Promise<Hold> {
  if (IS_DEMO) {
    await wait(700);
    const blocked = new Set(demoBlocked());
    if (!rangeIsFree(req.checkIn, req.checkOut, blocked)) {
      throw new BookingError("DATES_TAKEN", "Those dates were just taken.");
    }
    const ref = `AKL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    return {
      bookingRef: ref,
      holdExpiresAt: new Date(Date.now() + BOOKING.holdMinutes * 60_000).toISOString(),
      checkoutUrl: null,
      quote: demoQuote(req.checkIn, req.checkOut, req.guests),
    };
  }
  // Leave out optional fields the guest left blank (e.g. "Prefer not to say" purpose)
  const details = Object.fromEntries(Object.entries(req.details).filter(([, v]) => v.trim() !== ""));
  return api<Hold>("/bookings/hold", { method: "POST", body: JSON.stringify({ ...req, details }) });
}

/**
 * Sends the ID photos for a held booking.
 * Uses FormData (not JSON) because it carries files, so we don't set Content-Type:
 * the browser adds the right "multipart/form-data" header itself.
 */
export async function uploadId(bookingRef: string, upload: IdUpload): Promise<void> {
  if (IS_DEMO) {
    await wait(900);
    return;
  }
  const form = new FormData();
  form.append("idType", upload.type);
  form.append("front", upload.front);
  if (upload.back) form.append("back", upload.back);
  form.append("consent", "true");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/bookings/${enc(bookingRef)}/id`, { method: "POST", body: form });
  } catch {
    throw new BookingError("NETWORK", "We couldn't upload your ID. Check your internet connection and try again.");
  }
  if (!res.ok) throw await errorFrom(res, "We couldn't upload your ID. Please try again.");
}

/**
 * Creates SumUp's payment page for a hold (API section 2.7). Only works after the ID is uploaded.
 * Demo: skips SumUp and goes straight to the confirmation page.
 */
export async function startCheckout(bookingRef: string): Promise<{ checkoutUrl: string }> {
  if (IS_DEMO) {
    await wait(600);
    return { checkoutUrl: `/booking/confirmed?ref=${enc(bookingRef)}` };
  }
  return api<{ checkoutUrl: string }>(`/bookings/${enc(bookingRef)}/checkout`, { method: "POST" });
}

/** For the confirmation page (API section 2.8). No personal details come back. */
export async function getBookingStatus(bookingRef: string): Promise<BookingStatusResponse> {
  if (IS_DEMO) {
    await wait(400);
    const checkIn = addDays(todayISO(), 14);
    const checkOut = addDays(checkIn, 3);
    return {
      ref: bookingRef,
      status: "id_review",
      payment: "paid",
      checkIn,
      checkOut,
      nights: 3,
      guests: 2,
      total: demoQuote(checkIn, checkOut, 2).total,
    };
  }
  return api<BookingStatusResponse>(`/bookings/${enc(bookingRef)}/status`);
}
