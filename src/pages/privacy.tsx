import LegalPage, { type LegalSection } from "../components/legalpage";

const COMPANY = "Aklass Dynamic Services";
const EMAIL = "[EMAIL ADDRESS]";

const sections: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <p>
        Aklass Luxury Stay is run by <strong>{COMPANY}</strong> [company number / registered address], the data controller
        for the personal information described here. You can contact us about privacy at{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. [ICO registration number, if registered.]
      </p>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    body: (
      <ul>
        <li><strong>Booking details:</strong> your name, email address, phone number, dates, number of guests, expected arrival time and (if you tell us) the purpose of your stay.</li>
        <li><strong>Messages:</strong> anything you send us through the contact form, email or WhatsApp.</li>
        <li><strong>Payment information:</strong> handled by Stripe. We receive confirmation that you've paid and limited details (such as the last four digits of your card), never your full card number.</li>
        <li><strong>CCTV footage:</strong> from external cameras covering the outside of the property only.</li>
        <li><strong>Website data:</strong> basic technical information such as your browser and device, used to keep the site working and secure.</li>
      </ul>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>take and manage your booking, and send your confirmation and arrival details (<strong>to perform our contract with you</strong>)</li>
          <li>reply to your questions (<strong>our legitimate interest</strong> in helping you, or steps before a contract)</li>
          <li>keep the property and guests safe, including CCTV (<strong>our legitimate interest</strong> in security)</li>
          <li>keep financial records we're required to keep (<strong>legal obligation</strong>)</li>
        </ul>
        <p>We don't sell your information and we don't send marketing unless you've asked us to.</p>
      </>
    ),
  },
  {
    id: "share",
    title: "Who we share it with",
    body: (
      <>
        <p>Only with trusted providers who help us run the business, and only what they need:</p>
        <ul>
          <li><strong>Stripe</strong>: to process payments</li>
          <li>[Website hosting provider], to run this website</li>
          <li>[Email provider], to send booking emails</li>
          <li>Cleaning or maintenance staff, only where they need to know about your stay (for example, arrival times)</li>
        </ul>
        <p>We may also share information if the law requires it, for example with the police or HMRC.</p>
      </>
    ),
  },
  {
    id: "keep",
    title: "How long we keep it",
    body: (
      <ul>
        <li>Booking and payment records: <strong>6 years</strong> after your stay, for tax and accounting.</li>
        <li>Contact messages that didn't lead to a booking: [12 months].</li>
        <li>CCTV footage: [30 days], unless needed to investigate an incident.</li>
      </ul>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>Under UK data protection law you can ask us to:</p>
        <ul>
          <li>give you a copy of the information we hold about you</li>
          <li>correct anything that's wrong</li>
          <li>delete your information, where we don't need to keep it</li>
          <li>restrict or object to how we use it</li>
          <li>transfer it to you or another organisation</li>
        </ul>
        <p>Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we'll reply within one month. There's normally no charge.</p>
      </>
    ),
  },
  {
    id: "security",
    title: "Keeping it safe",
    body: (
      <p>
        Your information is stored with providers that use industry-standard security, payments go through Stripe's secure
        checkout, and only people who need it can access booking details. Some providers may store data outside the UK; where
        they do, they use approved safeguards.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        This website only uses cookies and similar storage that are needed for it to work, such as remembering your booking
        progress. [If you add analytics or advertising cookies, list them here and ask for consent first.]
      </p>
    ),
  },
  {
    id: "complaints",
    title: "Complaints",
    body: (
      <p>
        If you're unhappy with how we've handled your information, please contact us first. You also have the right to complain
        to the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Your privacy"
      title="Privacy notice"
      intro={<p>We only collect what we need to look after your booking and your stay, and we never sell your information.</p>}
      lastUpdated="[DATE]"
      sections={sections}
      related={{ label: "Booking terms", to: "/terms" }}
    />
  );
}