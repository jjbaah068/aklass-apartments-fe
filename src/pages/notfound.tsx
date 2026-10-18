import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { EASE } from "../components/reveal";
import notFoundImg from "../assets/images/notfound.webp";

const IMAGE_BG = "#f8f8f8";

const LINKS = [
  { label: "Back to home", to: "/", primary: true },
];

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar />

      <main
        id="main"
        className="flex min-h-[calc(100svh-68px)] flex-col md:min-h-[calc(100svh-80px)]"
        style={{ backgroundColor: IMAGE_BG }}
      >
        {/* Illustration */}
        <motion.div
          className="flex flex-1 items-center justify-center px-4 pt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <img
            src={notFoundImg}
            alt="Oops… 404 Not Found — two people trying to connect a plug and socket"
            width={1404}
            height={1120}
            fetchPriority="high"
            className="h-auto max-h-[64svh] w-full max-w-[880px] object-contain"
          />
        </motion.div>

        {/* Message + ways out */}
        <motion.div
          className="container-site flex flex-col items-center pb-14 pt-2 text-center md:pb-20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
        >
          <h1 className="sr-only">Page not found</h1>
          <p className="max-w-[30rem] text-body-lg text-ink-muted">
            We couldn't find that page, the link may be broken or the page may have moved.
          </p>
          {pathname !== "/" && (
            <p className="mt-2 max-w-full truncate text-[13px] text-ink-subtle">
              <span className="sr-only">Address requested: </span>
              {/* <code className="rounded-xs bg-white px-1.5 py-0.5 font-mono">{pathname}</code> */}
            </p>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={`btn ${l.primary ? "btn-primary" : "btn-outline"}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer showCta={false} />
    </>
  );
}