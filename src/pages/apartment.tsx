import { Link } from "react-router";
import Navbar from "../components/navbar";
import ApartmentHero from "../components/apartmenthero";
import Overview from "../components/overview";
import RoomExplorer from "../components/roomexplorer";
import ReadyToStay from "../components/readytostay";
import Footer from "../components/footer";

export default function Apartment() {
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
                The whole house, from £[X] a night
              </p>
              <ul className="flex flex-col gap-2 text-small text-ink-muted">
                <li>Up to 7 guests · 4 bedrooms</li>
                <li>Check-in 3:00–7:00 PM</li>
                <li>Pay securely with ...</li>
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