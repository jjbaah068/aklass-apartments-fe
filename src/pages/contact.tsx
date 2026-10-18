import Navbar from "../components/navbar";
import ContactHero from "../components/contacthero";
import ContactForm from "../components/contactform";
import Footer from "../components/footer";

export default function Contact() {
  return (
    <>
      <Navbar />

      <main id="main">
        <ContactHero />
        <ContactForm />
      </main>

      <Footer showCta={false} />
    </>
  );
}