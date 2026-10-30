import { Link } from "react-router";
import Navbar from "../components/navbar";
import ApartmentHero from "../components/apartmenthero";
import Overview from "../components/overview";
import RoomExplorer from "../components/roomexplorer";
import ReadyToStay from "../components/readytostay";
import Footer from "../components/footer";
import { discountBadges, formatGBPShort } from "../lib/booking";
import { usePublicSettings } from "../lib/hooks";

export default function Apartment() {
  const settings = usePublicSettings();
  return (
    <>
      <Navbar />

      <main id="main">
        <ApartmentHero />

        {/* Two-column page body */}
        <div className="container-site grid gap-12 pb-20 pt-12 md:pt-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          {/* Left column: every page section goes in here, in order */}
          <div className="flex min-w-0 flex-col gap-16 md:gap-20">
            <Overview />
            <RoomExplorer />
          </div>

          {/* Temporary card */}
          <aside className="hidden lg:block" aria-label="Book your stay">
            <div className="card-overlay sticky top-28 flex flex-col gap-4 p-6">
              <p className="eyebrow">Book direct</p>
              <p className="font-display text-[28px] font-semibold leading-tight text-navy-900">
                {settings ? `The whole house, from ${formatGBPShort(settings.nightlyRate)} a night` : "The whole house, booked direct"}
              </p>
              {settings && discountBadges(settings).length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Discounts">
                  {discountBadges(settings).map((b) => (
                    <li key={b} className="chip chip-sm" data-status="confirmed">{b}</li>
                  ))}
                </ul>
              )}
              <ul className="flex flex-col gap-2 text-small text-ink-muted">
                <li>Up to {settings?.maxGuests ?? 7} guests · 4 bedrooms</li>
                <li>Check-in 3:00–7:00 PM</li>
                <li>Pay securely with SumUp</li>
              </ul>
              <Link to="/book" className="btn btn-primary btn-block">
                Check availability
              </Link>
            </div>
          </aside>
        </div>

        {/* Full-width closing section, after the two columns */}
        <ReadyToStay />
      </main>

      {/* Footer  */}
      <Footer showCta={false} />
    </>
  );
}