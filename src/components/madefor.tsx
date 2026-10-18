import { useId } from "react";
import { motion } from "motion/react";
import { Reveal, RevealList, fadeUp } from "./reveal";
import familiesImg from "../assets/images/livingroom2.webp"; 
import groupsImg from "../assets/images/bedroom1.webp"; 
import workImg from "../assets/images/bedroom4.webp"; 

type Audience = {
  title: string;
  body: string;
  points: string[];
  image: string;
  alt: string;
};

const AUDIENCES: Audience[] = [
  {
    title: "Families",
    body: "Two living rooms with Smart TVs, a large private garden and a fully fitted kitchen — room for everyone to spread out.",
    points: ["2 living rooms", "Private garden", "Air fryer, oven & microwave"],
    image: familiesImg,
    alt: "Bright second living room with large windows",
  },
  {
    title: "Groups",
    body: "Four private bedrooms and two bathrooms for up to seven guests, with a dining area that seats the whole party.",
    points: ["4 private bedrooms", "2 bathrooms", "Sleeps up to 7"],
    image: groupsImg,
    alt: "Bedroom with two single beds and grey velvet headboards",
  },
  {
    title: "Contractors & business",
    body: "A desk in every bedroom, fast Wi-Fi, designated parking and a laundry room with washer and tumble dryer.",
    points: ["Desk in every bedroom", "Fast Wi-Fi", "Parking & laundry room"],
    image: workImg,
    alt: "Bedroom with a work desk and chair by the window",
  },
];

export default function MadeFor() {
  const id = useId();

  return (
    <section aria-labelledby={`${id}-title`} className="bg-page py-16 md:py-24">
      <div className="container-site">
        {/* Heading row */}
        <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div>
            <p className="eyebrow">Made for</p>
            <h2 id={`${id}-title`} className="mt-2 text-h2 md:text-[46px] md:leading-[1.1]">
              Families, groups and work trips
            </h2>
          </div>
          {/* <p className="max-w-[26rem] text-body text-ink-muted">
            Bright white rooms, grey velvet and quiet gold details — with the practical
            things a longer stay needs.
          </p> */}
        </Reveal>

        {/* Cards — rise in one after another */}
        <RevealList step={0.12} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((a) => (
            <motion.li key={a.title} variants={fadeUp} className="card-raised group flex flex-col">
              <div className="overflow-hidden">
                <img
                  src={a.image}
                  alt={a.alt}
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-[var(--ease-calm)] group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <span className="gold-rule mb-4 w-8" aria-hidden="true" />
                <h3 className="text-[28px] leading-tight">{a.title}</h3>
                <p className="mt-2 text-body text-ink-muted">{a.body}</p>

                <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-5">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-small font-medium text-navy-900">
                      <svg viewBox="0 0 24 24" className="amenity-icon size-[18px] text-gold-600" aria-hidden="true">
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </RevealList>
      </div>
    </section>
  );
}