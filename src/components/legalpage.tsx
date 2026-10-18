import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import Navbar from "./navbar";
import Footer from "./footer";
import { EASE } from "./reveal";

export type LegalSection = { id: string; title: string; body: ReactNode };

type Props = {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  lastUpdated: string; // e.g. "18 October 2026"
  sections: LegalSection[];
  /** Link to the other legal page, shown at the bottom */
  related: { label: string; to: string };
};

/** Highlights the contents link for the section currently on screen. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join(",")]); 
  return active;
}

export default function LegalPage({ eyebrow, title, intro, sections, related }: Props) {
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <>
      <Navbar />

      <main id="main" className="bg-page">
        {/* Title band */}
        <header className="border-b border-line bg-stone-100">
          <motion.div
            className="container-site py-12 md:py-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-2 text-h1 md:text-[52px]">{title}</h1>
            <div className="mt-4 max-w-[42rem] text-body-lg text-ink-muted">{intro}</div>
          </motion.div>
        </header>

        <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          {/* Contents */}
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
            {/* Mobile: collapsible */}
            <details className="card p-4 lg:hidden">
              <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-navy-900">On this page</summary>
              <ol className="mt-2 flex flex-col">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex min-h-11 items-center gap-3 text-small text-navy-800 no-underline">
                      <span className="w-5 text-ink-subtle tabular-nums">{i + 1}.</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            {/* Desktop: sticky list */}
            <div className="hidden lg:block">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">On this page</p>
              <ol className="flex flex-col border-l border-line">
                {sections.map((s, i) => {
                  const isActive = active === s.id;
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={`-ml-px flex min-h-10 items-center gap-2 border-l-2 py-1.5 pl-4 text-small no-underline transition-colors ${
                          isActive ? "border-gold-500 font-semibold text-navy-900" : "border-transparent text-ink-muted hover:text-navy-900"
                        }`}
                      >
                        <span className="w-5 shrink-0 text-ink-subtle tabular-nums">{i + 1}.</span>
                        {s.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </nav>

          {/* Content */}
          <article className="legal-prose max-w-[46rem]">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28 border-b border-line py-8 first:pt-0 last:border-0">
                <h2 id={`${s.id}-h`} className="text-[26px] leading-tight md:text-[30px]">
                  <span className="mr-2 font-sans text-[15px] font-semibold text-gold-700 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="mt-4 flex flex-col gap-4 text-body text-slate-800 [&_a]:font-semibold [&_li]:pl-1 [&_strong]:text-navy-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                  {s.body}
                </div>
              </section>
            ))}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card bg-stone-100 p-5">
              <p className="text-small text-ink-muted">Questions about this page? We're happy to help.</p>
              <div className="flex flex-wrap gap-3">
                <Link to={related.to} className="btn btn-outline btn-sm">{related.label}</Link>
                <Link to="/contact" className="btn btn-primary btn-sm">Contact us</Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer showCta={false} />
    </>
  );
}