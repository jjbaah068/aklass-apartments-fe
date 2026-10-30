import { useEffect, useState } from "react";
import { getPublicSettings, type PublicSettings } from "./booking";

/* One request for the whole visit: hero, sticky card and apartment page share it. */
let settingsPromise: Promise<PublicSettings> | null = null;

export function loadPublicSettings() {
  if (!settingsPromise) {
    settingsPromise = getPublicSettings().catch((e) => {
      settingsPromise = null; // let a later page try again
      throw e;
    });
  }
  return settingsPromise;
}

/** Stay rules and prices from GET /settings/public. null while loading or if it failed. */
export function usePublicSettings(): PublicSettings | null {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadPublicSettings()
      .then((s) => { if (!cancelled) setSettings(s); })
      .catch(() => { /* prices just stay hidden */ });
    return () => { cancelled = true; };
  }, []);
  return settings;
}

/**
 * True once `active` has been true for `afterMs`. Used to explain a slow first load:
 * the free Render server can take about a minute to wake up.
 */
export function useSlow(active: boolean, afterMs = 4000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setSlow(true), afterMs);
    return () => { clearTimeout(t); setSlow(false); };
  }, [active, afterMs]);
  return active && slow;
}

export const WAKE_UP_MESSAGE = "Waking up our booking system. The first load can take up to a minute.";
