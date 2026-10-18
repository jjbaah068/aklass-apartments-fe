import { Link } from "react-router";
import LegalPage, { type LegalSection } from "../components/legalpage";

const COMPANY = "Aklass Dynamic Services";
const EMAIL = "[EMAIL ADDRESS]";

const sections: LegalSection[] = [
  {
    id: "about",
    title: "Who we are",
    body: (
      <>
        <p>
          Aklass Luxury Stay is operated by <strong>{COMPANY}</strong> [company number / registered address, if applicable]
          ("we", "us"). These terms apply when you ("you", the lead guest) book the property at Bushbury, Wolverhampton WV10
          directly through this website.
        </p>
        <p>By completing a booking you confirm you are at least 18 years old and agree to these terms on behalf of everyone in your group.</p>
      </>
    ),
  },
  {
    id: "booking",
    title: "Making a booking",
    body: (
      <>
        <ul>
          <li>You book the <strong>entire house</strong>. No other paying guests will stay during your booking.</li>
          <li>The minimum stay is <strong>[N] nights</strong> and the maximum is <strong>7 guests</strong>, including children.</li>
          <li>When you review your booking, your dates are <strong>held for 30 minutes</strong>. If payment isn't completed in that time, the dates are released.</li>
          <li>Your booking is confirmed only when payment has been received and we've sent your confirmation email with a booking reference.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payment",
    title: "Prices and payment",
    body: (
      <>
        <p>
          Prices are shown in pounds sterling (GBP) and include the nightly rate and a cleaning fee. The total shown before
          you pay is the total you'll be charged. [State whether prices include VAT, if applicable.]
        </p>
        <p>
          Payment is taken in full at the time of booking through <strong>Stripe</strong>, our secure payment provider. We
          never see or store your full card details.
        </p>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "Cancellations and changes",
    body: (
      <>
        <p><strong>If you cancel:</strong> [CANCELLATION POLICY — e.g. full refund if cancelled more than N days before check-in; X% refund between N and M days; no refund within M days.]</p>
        <p>
          <strong>Changes:</strong> to change your dates or number of guests, <Link to="/contact">contact us</Link> as soon
          as possible. Changes depend on availability and may change the price.
        </p>
        <p>
          <strong>If we have to cancel:</strong> in the unlikely event we cannot provide the property, we'll give you a full
          refund of everything you've paid.
        </p>
        <p>Refunds are made to the card used to pay and can take 5–10 working days to appear.</p>
      </>
    ),
  },
  {
    id: "arrival",
    title: "Arrival and departure",
    body: (
      <ul>
        <li><strong>Check-in</strong> is between 3:00 PM and 7:00 PM.</li>
        <li><strong>Check-out</strong> is by 11:00 AM.</li>
        <li>Early check-in or late check-out may be possible on request, subject to availability.</li>
        <li>The full address and arrival instructions are sent by email once your booking is confirmed.</li>
      </ul>
    ),
  },
  {
    id: "rules",
    title: "House rules",
    body: (
      <>
        <p>To keep the home comfortable for every guest and respectful to our neighbours:</p>
        <ul>
          <li>No smoking inside the house. Please use the designated smoking area in the garden.</li>
          <li>Quiet hours after 7:00 PM.</li>
          <li>No parties or events.</li>
          <li>Only registered guests may stay at the property.</li>
          <li>Pets are allowed by prior agreement only.</li>
        </ul>
        <p>
          If the rules are seriously broken we may ask guests to leave without a refund. [Confirm with the owner.]
        </p>
      </>
    ),
  },
  {
    id: "charges",
    title: "Damage and extra charges",
    body: (
      <>
        <ul>
          <li>A <strong>£50 surcharge</strong> applies for breaches of the house rules.</li>
          <li>A <strong>£75 surcharge plus the cost of repair or replacement</strong> applies for damage or missing items.</li>
        </ul>
        <p>
          We'll tell you about any charge in writing, with an explanation and evidence, before taking payment. [Confirm how
          charges are collected — e.g. card on file via Stripe, or a separate invoice.]
        </p>
      </>
    ),
  },
  {
    id: "cctv",
    title: "Security and CCTV",
    body: (
      <p>
        The property has <strong>external CCTV only</strong>, covering the outside of the house. There are no cameras inside
        the house. See our <Link to="/privacy">privacy notice</Link> for how footage is handled.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: (
      <>
        <p>
          We'll provide the property as described and in a clean, safe condition. If something isn't right, tell us straight
          away so we can fix it.
        </p>
        <p>
          We aren't responsible for loss of or damage to guests' belongings, or for disruption caused by events outside our
          control (such as utility failures or severe weather), except where the law says we are. Nothing in these terms
          limits our liability for death or personal injury caused by our negligence, or any other liability that can't be
          limited by law.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Complaints and governing law",
    body: (
      <>
        <p>If you have a complaint, please email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we'll respond as quickly as we can.</p>
        <p>These terms are governed by the law of England and Wales, and disputes will be handled by the courts of England and Wales.</p>
      </>
    ),
  },
];

export default function Terms() {
  return (
    <LegalPage
          eyebrow="Guests"
          title="Booking terms"
          intro={<p>The short version: book the whole house, pay securely online, follow the house rules and enjoy your stay. The full details are below.</p>}
          sections={sections}
          related={{ label: "Privacy notice", to: "/privacy" }} lastUpdated={""}    />
  );
}