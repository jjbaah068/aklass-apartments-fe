import { IS_DEMO } from "./booking";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

/* ---------- Settings ---------- */

export const MIN_REVIEWS_TO_SHOW = 3;


export const AIRBNB = {
  rating: 4.64,
  count: 11,
  url: "https://www.airbnb.co.uk/", 
};

/* ---------- Types ---------- */

export type CategoryKey = "cleanliness" | "accuracy" | "checkIn" | "communication" | "location" | "value";

export const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: "cleanliness", label: "Cleanliness", icon: "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9zM5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6z" },
  { key: "accuracy", label: "Accuracy", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6" },
  { key: "checkIn", label: "Check-in", icon: "M15 7a4 4 0 1 0-3.9 4.9L4 19v2h3v-2h2v-2h2l1.6-1.6A4 4 0 0 0 15 7zM16 7h.01" },
  { key: "communication", label: "Communication", icon: "M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { key: "location", label: "Location", icon: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" },
  { key: "value", label: "Value", icon: "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" },
];

export type Review = {
  id: string;
  name: string; 
  stayedOn: string; 
  tripType?: string; 
  rating: number; 
  categories: Record<CategoryKey, number>;
  text: string;
  reply?: { text: string; date: string }; 
};

export type ReviewSummary = {
  count: number;
  average: number; 
  /** Keys are "1".."5" in the JSON; distribution[5] and distribution["5"] read the same value. */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  categories: Record<CategoryKey, number>;
};

export type ReviewSort = "newest" | "highest" | "lowest";

/* ---------- Helpers ---------- */

const round1 = (n: number) => Math.round(n * 10) / 10;

export function summarise(reviews: Review[]): ReviewSummary {
  const count = reviews.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["distribution"];
  reviews.forEach((r) => { distribution[Math.round(r.rating) as 1 | 2 | 3 | 4 | 5]++; });
  const avg = (pick: (r: Review) => number) => (count ? round1(reviews.reduce((s, r) => s + pick(r), 0) / count) : 0);
  const categories = Object.fromEntries(CATEGORIES.map((c) => [c.key, avg((r) => r.categories[c.key])])) as ReviewSummary["categories"];
  return { count, average: avg((r) => r.rating), distribution, categories };
}

export function sortReviews(list: Review[], sort: ReviewSort) {
  const copy = [...list];
  if (sort === "highest") return copy.sort((a, b) => b.rating - a.rating || b.stayedOn.localeCompare(a.stayedOn));
  if (sort === "lowest") return copy.sort((a, b) => a.rating - b.rating || b.stayedOn.localeCompare(a.stayedOn));
  return copy.sort((a, b) => b.stayedOn.localeCompare(a.stayedOn));
}

export function formatMonth(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/* ---------- Demo reviews ---------- */

function monthsAgo(n: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const c = (cleanliness: number, accuracy: number, checkIn: number, communication: number, location: number, value: number) =>
  ({ cleanliness, accuracy, checkIn, communication, location, value });

const DEMO_REVIEWS: Review[] = [
  {
    id: "r1", name: "Matt", stayedOn: monthsAgo(0), tripType: "Family visit", rating: 5, categories: c(5, 5, 5, 5, 4, 5),
    text: "Absolutely spotless and so much space for the kids. The kitchen had everything we needed for proper family meals, and parking on the drive made arriving with a car full of bags easy. We'll be back for Christmas.",
    reply: { text: "Thank you, Matt! It was lovely having your family stay. We'd be delighted to host you again at Christmas.", date: monthsAgo(0) + "-14" },
  },
  {
    id: "r2", name: "Georgia", stayedOn: monthsAgo(1), tripType: "Work trip", rating: 5, categories: c(5, 5, 5, 5, 4, 5),
    text: "Booked for four engineers working at i54 for a week. Fast Wi-Fi, a desk in every bedroom and a short drive to site. Much better than a hotel for a team.",
  },
  {
    id: "r3", name: "Sarah", stayedOn: monthsAgo(1), tripType: "Group trip", rating: 4, categories: c(5, 4, 4, 5, 4, 4),
    text: "Great space for seven of us and really comfortable beds. Only small thing was the check-in instructions arrived a bit late on the day, but the host answered straight away when we called.",
    reply: { text: "Thanks for the honest feedback, Sarah. We now send arrival instructions the evening before, so guests have them in good time.", date: monthsAgo(1) + "-20" },
  },
  {
    id: "r4", name: "Daniel", stayedOn: monthsAgo(2), tripType: "Event or match", rating: 5, categories: c(5, 5, 5, 5, 5, 5),
    text: "Perfect base for the match at Molineux. Clean, modern and the host was really helpful with tips on where to eat.",
  },
  {
    id: "r5", name: "Priya", stayedOn: monthsAgo(3), tripType: "Family visit", rating: 5, categories: c(5, 5, 4, 5, 4, 5),
    text: "We were visiting relatives nearby and this house made it so easy. Four proper bedrooms, two bathrooms and a quiet street. Felt like home.",
  },
  {
    id: "r6", name: "James", stayedOn: monthsAgo(4), tripType: "Contract work", rating: 4, categories: c(4, 4, 5, 4, 4, 5),
    text: "Good value for a long stay. Washing machine and a full kitchen meant we could live normally during the contract.",
  },
  {
    id: "r7", name: "Emma", stayedOn: monthsAgo(5), tripType: "Holiday", rating: 5, categories: c(5, 5, 5, 5, 4, 4),
    text: "Beautifully presented, exactly like the photos. Lovely touches throughout and very easy self check-in.",
  },
  {
    id: "r8", name: "Olu", stayedOn: monthsAgo(6), tripType: "Relocation", rating: 3, categories: c(4, 3, 3, 4, 3, 3),
    text: "The house itself was fine and clean, but we had trouble with the heating on the first night. It was fixed the next morning.",
    reply: { text: "Sorry about the heating, Olu, and thank you for your patience. The boiler has since been serviced and the thermostat replaced.", date: monthsAgo(6) + "-12" },
  },
];

/* ---------- Loading ---------- */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** All published reviews, newest first, with the score summary. */
export async function getReviews(): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
  if (IS_DEMO) {
    await wait(250);
    const reviews = sortReviews(DEMO_REVIEWS, "newest");
    return { reviews, summary: summarise(reviews) };
  }
  const res = await fetch(`${API_URL}/reviews`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("We couldn't load the reviews.");
  return res.json();
}

/* ---------- Leaving a review ---------- */

export const TRIP_TYPES = ["Family visit", "Holiday", "Group trip", "Work trip", "Contract work", "Event or match", "Relocation", "Other"];

export const REVIEW_RULES = { minText: 30, maxText: 1000 };


export type ReviewInvite = {
  token: string; 
  firstName: string;
  stayedFrom: string;
  stayedTo: string;
};

export type NewReview = {
  rating: number;
  categories: Record<CategoryKey, number>;
  tripType: string;
  text: string;
  displayName: string;
  confirmedGenuine: true;
  website: string; 
};

export type ReviewErrorCode =
  | "NOT_FOUND" | "NOT_FINISHED" | "ALREADY_REVIEWED" | "LINK_EXPIRED" | "INVALID"
  | "TOO_MANY_REQUESTS" | "SERVER_ERROR" | "BAD_REQUEST"
  | "NETWORK" | "UNKNOWN";

export class ReviewError extends Error {
  code: ReviewErrorCode;
  /** Form errors keyed by field path, e.g. { "text": "…", "categories.value": "…" } (code INVALID). */
  fields?: Record<string, string>;
  constructor(code: ReviewErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ReviewError("NETWORK", "We couldn't connect. Check your internet connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ReviewError(data.code ?? "UNKNOWN", data.message ?? "Something went wrong. Please try again.", data.fields);
  return data as T;
}

function demoInvite(ref: string, email: string): ReviewInvite {
  const name = email.split("@")[0].split(/[._-]/)[0] || "there";
  const d = new Date();
  const iso = (n: number) => { const x = new Date(d); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  return { token: `demo-${ref}`, firstName: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(), stayedFrom: iso(6), stayedTo: iso(3) };
}


export async function verifyBookingForReview(bookingRef: string, email: string): Promise<ReviewInvite> {
  const ref = bookingRef.trim().toUpperCase();
  if (IS_DEMO) {
    await wait(600);
    if (ref === "AKL-FUTURE") throw new ReviewError("NOT_FINISHED", "You can leave a review once your stay has finished.");
    if (ref === "AKL-DONE") throw new ReviewError("ALREADY_REVIEWED", "A review has already been left for this booking. Thank you!");
    if (ref === "AKL-LIMIT") throw new ReviewError("TOO_MANY_REQUESTS", "Too many requests. Please try again later.");
    if (!/^(AKL|ALS)-[A-Z0-9]{3,}$/.test(ref)) throw new ReviewError("NOT_FOUND", "We couldn't find a booking with that reference and email.");
    return demoInvite(ref, email);
  }
  return post<ReviewInvite>("/reviews/verify", { bookingRef: ref, email: email.trim().toLowerCase() });
}

/** Opens the private link from the "How was your stay?" email: /reviews/new?token=… */
export async function getInvite(token: string): Promise<ReviewInvite> {
  if (IS_DEMO) {
    await wait(400);
    return demoInvite("AKL-1043", "daniel@example.com");
  }
  const res = await fetch(`${API_URL}/reviews/invite/${encodeURIComponent(token)}`, { headers: { Accept: "application/json" } }).catch(() => null);
  if (!res) throw new ReviewError("NETWORK", "We couldn't connect. Check your internet connection and try again.");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ReviewError(data.code ?? "LINK_EXPIRED", data.message ?? "This review link has expired or was already used.");
  return data as ReviewInvite;
}

export async function submitReview(token: string, review: NewReview): Promise<void> {
  if (IS_DEMO) {
    await wait(800);
    return;
  }
  // tripType is optional and must be one of TRIP_TYPES, so leave it out when not chosen
  const { tripType, ...rest } = review;
  await post<unknown>("/reviews", { token, ...rest, ...(tripType ? { tripType } : {}) });
}
