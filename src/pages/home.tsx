import Navbar from "../components/navbar";
import Hero from "../components/hero";
import MadeFor from '../components/madefor'
import LocalArea from "../components/localarea";
import FAQS from '../components/faqs'
import Reviews from "../components/reviews";
import Footer from '../components/footer'


export default function Home() {
    return(
        <>
            <Navbar />
            <Hero />
            <MadeFor />
            <Reviews />
            <LocalArea />
            <FAQS />
            <Footer />
        </>
    )
}