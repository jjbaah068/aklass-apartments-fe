
export const BOOKING = {
  maxGuests: 7,
  minNights: 2, 
  holdMinutes: 30,
  demoNightlyRate: 185,
  demoCleaningFee: 60,
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


export type Quote = {
  nights: number;
  nightlyRate: number;
  accommodation: number;
  cleaningFee: number;
  total: number;
  currency: "GBP";
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
  acceptAttr: "image/jpeg,image/png,application/pdf", // iPhones convert HEIC photos to JPEG automatically
  deleteAfterDays: 30, // ID photos are deleted this many days after check-out
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
  holdExpiresAt: string; 
  checkoutUrl: string; 
};

export class BookingError extends Error {
  code: "DATES_TAKEN" | "MIN_STAY" | "MAX_GUESTS" | "ID_INVALID" | "HOLD_EXPIRED" | "NETWORK" | "UNKNOWN";
  constructor(code: BookingError["code"], message: string) {
    super(message);
    this.code = code;
  }
}


async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new BookingError("NETWORK", "We couldn't connect. Check your internet connection and try again.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new BookingError(body.code ?? "UNKNOWN", body.message ?? "Something went wrong. Please try again.");
  return body as T;
}

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

export async function getQuote(checkIn: string, checkOut: string, guests: number): Promise<Quote> {
  if (IS_DEMO) {
    await wait(200);
    const nights = nightsBetween(checkIn, checkOut);
    const accommodation = nights * BOOKING.demoNightlyRate;
    return {
      nights,
      nightlyRate: BOOKING.demoNightlyRate,
      accommodation,
      cleaningFee: BOOKING.demoCleaningFee,
      total: accommodation + BOOKING.demoCleaningFee,
      currency: "GBP",
    };
  }
  return api<Quote>(`/quote?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
}

export async function createHold(req: HoldRequest): Promise<Hold> {
  if (IS_DEMO) {
    await wait(700);
    const blocked = new Set(demoBlocked());
    if (!rangeIsFree(req.checkIn, req.checkOut, blocked)) {
      throw new BookingError("DATES_TAKEN", "Those dates were just taken.");
    }
    const ref = `ALS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    return {
      bookingRef: ref,
      holdExpiresAt: new Date(Date.now() + BOOKING.holdMinutes * 60_000).toISOString(),
      checkoutUrl: `/booking/confirmed?ref=${ref}`, // demo: skip SumUp
    };
  }
  return api<Hold>("/bookings/hold", { method: "POST", body: JSON.stringify(req) });
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
    res = await fetch(`${API_URL}/bookings/${encodeURIComponent(bookingRef)}/id`, { method: "POST", body: form });
  } catch {
    throw new BookingError("NETWORK", "We couldn't upload your ID. Check your internet connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new BookingError(body.code ?? "UNKNOWN", body.message ?? "We couldn't upload your ID. Please try again.");
  }
}
