import { useId } from "react";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

const HIGHLIGHTS = [
  {
    title: "Entire home",
    body: "No shared spaces and no other guests, the whole house is yours for your stay.",
    d: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5",
  },
  {
    title: "Self-contained",
    body: "A fully fitted kitchen and your own laundry room, so longer stays feel easy.",
    d: "M4 3h16v18H4zM4 7h16M12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8M7 5h.01",
  },
  {
    title: "Work-ready",
    body: "A desk in every bedroom, fast Wi-Fi and a dining area that doubles as a workspace.",
    d: "M3 10h18M5 10v10M19 10v10M8 10V6h8v4",
  },
];

// const GOOD_FOR = ["Families", "Groups of friends", "Contractors", "Business travellers"];

export default function Overview() {
  const id = useId();

  return (
    <section id="overview" aria-labelledby={`${id}-title`} className="scroll-mt-32">
      <Reveal>
        <p className="eyebrow">Overview</p>
        <h2 id={`${id}-title`} className="mt-2 text-h2 md:text-[42px] md:leading-[1.1]">
          You have the house
        </h2>

        <div className="mt-5 max-w-[40rem] space-y-4 text-body-lg text-ink-muted">
          <p>
            A bright, four-bedroom home in Bushbury, Wolverhampton, booked as a whole no other
            paying guests during your stay. Clean white rooms, grey velvet and soft gold details,
            with space for up to seven people to spread out.
          </p>
          <p>
            Two living rooms, two bathrooms, a large private garden and parking on the driveway
            make it just as comfortable for a family weekend as for a few weeks on a work contract.
          </p>
        </div>

        {/* Good for */}
        {/* <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-small font-semibold text-navy-900">Ideal for</span>
          {GOOD_FOR.map((g) => (
            <span key={g} className="rounded-pill bg-navy-50 px-3 py-1.5 text-[13px] font-medium text-navy-800">
              {g}
            </span>
          ))}
        </div> */}
      </Reveal>

      {/* Highlights */}
      <RevealGroup step={0.1} className="mt-10 grid gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((h) => (
          <RevealItem key={h.title} className="card flex flex-col gap-3 p-5">
            <span className="flex size-11 items-center justify-center rounded-full bg-navy-900">
              <svg viewBox="0 0 24 24" className="amenity-icon size-5 text-gold-200" aria-hidden="true">
                <path d={h.d} />
              </svg>
            </span>
            <h3 className="font-sans text-[17px] font-semibold text-navy-900">{h.title}</h3>
            <p className="text-small text-ink-muted">{h.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}